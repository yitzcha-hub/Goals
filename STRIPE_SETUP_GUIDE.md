# Complete Stripe Payment Setup Guide

## Overview
This guide walks you through connecting Stripe payments to your Goal Tracker app with 4 subscription plans.

---

## Part 1: Create Stripe Products (15 minutes)

### Step 1: Create Stripe Account
1. Go to https://stripe.com and sign up
2. Complete business verification
3. Switch to **Test Mode** (toggle in top-right)

### Step 2: Create Products & Prices

**Product 1: Monthly Plan**
1. Dashboard → Products → Add Product
2. Name: `Goal Tracker - Monthly`
3. Description: `Monthly subscription with unlimited goal tracking`
4. Pricing: Recurring → $3.99/month
5. Click **Save product**
6. Copy the **Price ID** (starts with `price_...`)

**Product 2: Family Plan**
1. Add Product → Name: `Goal Tracker - Family Plan`
2. Description: `Up to 5 users with shared goals`
3. Pricing: Recurring → $12.99/month
4. Save and copy **Price ID**

**Product 3: Annual Plan**
1. Add Product → Name: `Goal Tracker - Annual`
2. Description: `Annual subscription - Save $18/year`
3. Pricing: Recurring → $29.99/year
4. Save and copy **Price ID**

**Product 4: 2-Year Plan**
1. Add Product → Name: `Goal Tracker - 2 Year`
2. Description: `Best value - 2 year commitment`
3. Pricing: Recurring → Custom → $39.99 every 24 months
4. Save and copy **Price ID**

### Step 3: Add Free Trial (Optional)
For each product:
1. Click product → Pricing → Edit
2. Add trial period: 7 days
3. Save changes

---

## Part 2: Get Stripe API Keys (2 minutes)

1. Dashboard → Developers → API keys
2. Copy **Publishable key** (starts with `pk_test_...`)
3. Copy **Secret key** (starts with `sk_test_...`)
4. Keep these secure!

---

## Part 3: Configure Supabase Edge Functions (20 minutes)

### Step 1: Create Edge Function Files

**File: supabase/functions/stripe-payments/index.ts**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  const { action, priceId, subscriptionId } = await req.json()
  const origin = req.headers.get('origin') || 'http://localhost:5173'

  if (action === 'create-checkout-session') {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      subscription_data: { trial_period_days: 30 }
    })
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (action === 'cancel-subscription') {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })
    return new Response(JSON.stringify({ success: true }))
  }

  return new Response('Invalid action', { status: 400 })
})
```

### Step 2: Deploy Edge Function
```bash
supabase functions deploy stripe-payments --no-verify-jwt
```

### Step 3: Set Stripe Secret in Supabase
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
```

---

## Part 4: Update Frontend Code (5 minutes)

**File: src/components/PricingSection.tsx**

Replace lines 46, 62, 80, 96 with your real Stripe Price IDs:

```typescript
priceId: 'price_1ABC123...',  // Your Monthly price ID
priceId: 'price_1DEF456...',  // Your Family price ID
priceId: 'price_1GHI789...',  // Your Annual price ID
priceId: 'price_1JKL012...',  // Your 2-Year price ID
```

---

## Part 5: Test Payment Flow (10 minutes)

### Test Checkout
1. Run app: `npm run dev`
2. Click "Start Free Trial" on any plan
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. Complete checkout

### Verify in Stripe Dashboard
1. Customers → See new customer
2. Subscriptions → See active subscription
3. Check trial end date

### Test Cancellation
1. Go to app settings/subscription page
2. Click "Cancel Subscription"
3. Verify in Stripe: subscription set to cancel at period end

---

## Part 6: Go Live (Production)

### Switch to Live Mode
1. Stripe Dashboard → Toggle **Live Mode**
2. Create same 4 products with live prices
3. Get live API keys (pk_live_... and sk_live_...)
4. Update Supabase secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_your_key
   ```
5. Update frontend with live price IDs
6. Deploy to production

---

## Troubleshooting

**"Invalid API Key"**
- Check secret is set: `supabase secrets list`
- Verify key starts with `sk_test_` or `sk_live_`

**"Price not found"**
- Confirm price ID copied correctly
- Check you're in correct mode (test/live)

**Checkout not opening**
- Check browser console for errors
- Verify edge function deployed
- Check CORS settings

**Subscription not saving**
- Set up webhook handler (see Part 7)

---

## Part 7: Webhook Setup (Advanced)

Create `supabase/functions/stripe-webhooks/index.ts` to handle subscription updates automatically.

This syncs Stripe subscription status to your database in real-time.

---

## Support
- Stripe Docs: https://stripe.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
