import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: { method?: string; body?: { session_id?: string } },
  res: { status: (n: number) => { json: (o: unknown) => void }; setHeader: (k: string, v: string) => void }
) {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).json({});
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? process.env.VITE_STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
    res.status(500).json({ error: 'Server not configured for checkout confirmation' });
    return;
  }

  const sessionId = typeof req.body?.session_id === 'string' ? req.body.session_id.trim() : null;
  if (!sessionId) {
    res.status(400).json({ error: 'Missing session_id' });
    return;
  }

  const stripe = new Stripe(stripeSecretKey);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      res.status(400).json({ error: 'Session not paid or complete', status: session.status });
      return;
    }

    // One-time payment (e.g. lifetime offer) — webhook already created subscription; just confirm success
    if (session.mode === 'payment' && session.metadata?.offer === 'lifetime_1000') {
      const userId = (session.metadata.user_id as string) || null;
      if (userId) {
        const farFuture = 4102444800;
        await supabase
          .from('subscriptions')
          .upsert(
            {
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
              plan_amount: 1999,
              plan_currency: 'usd',
              plan_interval: null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
      }
      res.status(200).json({ success: true, subscription_id: null });
      return;
    }

    const sub = session.subscription;
    if (!sub || typeof sub !== 'object' || !('id' in sub)) {
      res.status(400).json({ error: 'No subscription on session' });
      return;
    }

    const subscription = sub as Stripe.Subscription;
    const userId = (subscription.metadata?.user_id as string) || null;
    if (!userId) {
      res.status(400).json({ error: 'Subscription missing user_id in metadata' });
      return;
    }

    const item = subscription.items.data[0];
    const price = item?.price;
    const status = subscription.status as 'active' | 'trialing' | 'canceled' | 'past_due' | 'unpaid';

    const record = {
      user_id: userId,
      status,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      stripe_price_id: price?.id ?? null,
      trial_start: subscription.trial_start ? Math.floor(subscription.trial_start) : null,
      trial_end: subscription.trial_end ? Math.floor(subscription.trial_end) : null,
      current_period_start: item?.current_period_start != null ? Math.floor(item.current_period_start) : null,
      current_period_end: item?.current_period_end != null ? Math.floor(item.current_period_end) : null,
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
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
      console.error('Confirm checkout: Supabase upsert error', error);
      res.status(500).json({ error: 'Failed to save subscription' });
      return;
    }

    res.status(200).json({ success: true, subscription_id: subscription.id });
  } catch (err) {
    console.error('Confirm checkout error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to confirm checkout', detail: message });
  }
}
