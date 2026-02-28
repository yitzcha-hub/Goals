import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Disable body parsing so we get the raw request body (required for Stripe signature verification).
// See: https://docs.stripe.com/webhooks/signature#verify-official-libraries
export const config = {
  api: { bodyParser: false },
};

/** Read raw body from Node.js IncomingMessage stream without any parsing or encoding changes. */
function getRawBody(req: { on: (ev: string, fn: (...args: unknown[]) => void) => void; resume?: () => void }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: unknown) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
    if (typeof req.resume === 'function') req.resume();
  });
}

type Req = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  on?: (ev: string, fn: (...args: unknown[]) => void) => void;
  resume?: () => void;
};

type Res = {
  status: (code: number) => { json: (body: unknown) => void };
  setHeader?: (name: string, value: string) => void;
};

export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? process.env.VITE_STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? process.env.VITE_STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  // Service role key is required: it bypasses RLS so the webhook (no auth user) can upsert subscriptions.
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY. Webhook needs it to bypass RLS and upsert subscriptions. Set it in .env from Supabase Dashboard → Settings → API → service_role key.');
  }

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Stripe or Supabase env vars');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  const stripe = new Stripe(stripeSecretKey);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const sig = Array.isArray(req.headers?.['stripe-signature'])
    ? req.headers['stripe-signature'][0]
    : req.headers?.['stripe-signature'];

  if (!sig || typeof sig !== 'string') {
    res.status(400).json({
      error: 'Missing stripe-signature header',
      hint: 'Ensure Stripe (or Stripe CLI) is sending the Stripe-Signature header.',
    });
    return;
  }

  let rawBody: Buffer;
  try {
    rawBody = await getRawBody(req as Parameters<typeof getRawBody>[0]);
  } catch (bodyErr) {
    const msg = bodyErr instanceof Error ? bodyErr.message : 'Unknown error';
    console.error('Webhook could not read raw body:', msg);
    res.status(400).json({ error: 'Invalid request body', detail: msg });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    const hint =
      message.includes('signature') || message.includes('No signatures')
        ? "When testing locally, run 'stripe listen' and set STRIPE_WEBHOOK_SECRET to the secret it prints (whsec_...). Do not use the Dashboard webhook secret for CLI forwarding."
        : undefined;
    res.status(400).json({ error: `Webhook signature verification failed: ${message}`, ...(hint ? { hint } : {}) });
    return;
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata?.user_id as string) || null;
        if (!userId) {
          console.warn('Subscription event missing user_id in metadata');
          break;
        }

        const item = sub.items.data[0];
        const price = item?.price;
        const status = sub.status as 'active' | 'trialing' | 'canceled' | 'past_due' | 'unpaid';

        const record = {
          user_id: userId,
          status,
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer as string,
          stripe_price_id: price?.id ?? null,
          trial_start: sub.trial_start ? Math.floor(sub.trial_start) : null,
          trial_end: sub.trial_end ? Math.floor(sub.trial_end) : null,
          current_period_start: item?.current_period_start != null ? Math.floor(item.current_period_start) : null,
          current_period_end: item?.current_period_end != null ? Math.floor(item.current_period_end) : null,
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
          plan_amount: price?.unit_amount ?? null,
          plan_currency: price?.currency ?? null,
          plan_interval: price?.recurring?.interval ?? null,
          plan_name: price?.nickname ?? price?.id ?? null,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('subscriptions')
          .upsert(record, { onConflict: 'user_id' });

        if (error) {
          console.error('Supabase upsert error:', error);
          res.status(500).json({ error: 'Database error' });
          return;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata?.user_id as string) || null;
        if (!userId) break;

        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const subId = typeof subRef === 'string' ? subRef : subRef?.id;
        if (!subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        const userId = (sub.metadata?.user_id as string) || null;
        if (!userId) break;

        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'payment' || session.payment_status !== 'paid') break;
        const userId = (session.metadata?.user_id as string) || null;
        const offer = session.metadata?.offer as string | undefined;
        if (!userId || offer !== 'onetime') break;

        const farFuture = 4102444800; // Jan 1, 2100 (unix)
        const record = {
          user_id: userId,
          status: 'active',
          plan_name: 'Lifetime',
          stripe_subscription_id: null,
          stripe_customer_id: session.customer as string | null,
          stripe_price_id: null,
          trial_start: null,
          trial_end: null,
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: farFuture,
          cancel_at_period_end: false,
          plan_amount: 1900,
          plan_currency: 'usd',
          plan_interval: null,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('subscriptions')
          .upsert(record, { onConflict: 'user_id' });

        if (error) {
          console.error('Lifetime subscription upsert error:', error);
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
    return;
  }

  res.status(200).json({ received: true });
}
