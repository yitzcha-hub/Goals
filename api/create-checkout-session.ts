import Stripe from 'stripe';

const MONTHLY_PRICE_ID = process.env.VITE_STRIPE_PRICE_ID_MONTHLY;
const ANNUAL_PRICE_ID = process.env.VITE_STRIPE_PRICE_ID_ANNUAL;
const VALID_PRICE_IDS = [MONTHLY_PRICE_ID, ANNUAL_PRICE_ID].filter(Boolean);

export default async function handler(
  req: { method?: string; body?: { priceId?: string; userId?: string } },
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

  const { priceId, userId } = req.body ?? {};
  if (!priceId || typeof priceId !== 'string') {
    res.status(400).json({ error: 'Missing priceId' });
    return;
  }

  if (!VALID_PRICE_IDS.includes(priceId)) {
    res.status(400).json({ error: 'Invalid priceId. Only monthly and annual plans are supported.' });
    return;
  }

  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'Missing userId' });
    return;
  }

  const baseUrl = process.env.VITE_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const stripe = new Stripe(stripeSecretKey);

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
