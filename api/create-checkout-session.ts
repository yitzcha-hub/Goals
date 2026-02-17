import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const MONTHLY_PRICE_ID = process.env.VITE_STRIPE_PRICE_ID_MONTHLY;
const ANNUAL_PRICE_ID = process.env.VITE_STRIPE_PRICE_ID_ANNUAL;
const LIFETIME_PRICE_ID = process.env.VITE_STRIPE_PRICE_ID_LIFETIME ?? process.env.STRIPE_PRICE_ID_LIFETIME;
const VALID_PRICE_IDS = [MONTHLY_PRICE_ID, ANNUAL_PRICE_ID].filter(Boolean);

const LIFETIME_SUBSCRIBER_CAP = 1000;

export default async function handler(
  req: { method?: string; body?: { priceId?: string; userId?: string; offer?: string } },
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
  if (!stripeSecretKey) {
    res.status(500).json({ error: 'Stripe not configured' });
    return;
  }

  const { priceId, userId, offer } = req.body ?? {};

  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'Missing userId' });
    return;
  }

  const baseUrl = process.env.VITE_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const stripe = new Stripe(stripeSecretKey);

  // First 1,000 subscribers — lifetime $19.99
  if (offer === 'lifetime_1000') {
    if (!LIFETIME_PRICE_ID) {
      res.status(500).json({ error: 'Lifetime offer not configured. Set VITE_STRIPE_PRICE_ID_LIFETIME or STRIPE_PRICE_ID_LIFETIME.' });
      return;
    }
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { count, error } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .like('plan_name', 'Lifetime%');
      if (!error && count != null && count >= LIFETIME_SUBSCRIBER_CAP) {
        res.status(400).json({ error: 'The first 1,000 lifetime spots are now full. Please choose a monthly or annual plan.' });
        return;
      }
    }
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: LIFETIME_PRICE_ID, quantity: 1 }],
        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing`,
        metadata: { user_id: userId, offer: 'lifetime_1000' },
      });
      res.status(200).json({ url: session.url });
    } catch (err) {
      console.error('Lifetime checkout error:', err);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
    return;
  }

  // Subscription plans (monthly / annual)
  if (!priceId || typeof priceId !== 'string') {
    res.status(400).json({ error: 'Missing priceId or offer' });
    return;
  }

  if (!VALID_PRICE_IDS.includes(priceId)) {
    res.status(400).json({ error: 'Invalid priceId. Only monthly and annual plans are supported.' });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
      subscription_data: {
        metadata: { user_id: userId },
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
