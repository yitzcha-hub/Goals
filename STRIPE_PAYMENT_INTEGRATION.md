# Stripe Payment Integration (Monthly & Annual)

This project uses Stripe for subscriptions with **monthly** and **annual** plans only.

## Setup

### 1. Environment Variables

Add to `.env` (and Vercel Dashboard for production):

| Variable | Description | Client/Server |
|----------|-------------|---------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Client |
| `VITE_STRIPE_PRICE_ID_MONTHLY` | Monthly plan price ID | Client |
| `VITE_STRIPE_PRICE_ID_ANNUAL` | Annual plan price ID | Client |
| `STRIPE_SECRET_KEY` or `VITE_STRIPE_SECRET_KEY` | Stripe secret key | Server only |
| `STRIPE_WEBHOOK_SECRET` or `VITE_STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Server only |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) | Server only, for webhook |

**Note:** The webhook needs `SUPABASE_SERVICE_ROLE_KEY` to insert subscription records. Find it in Supabase Dashboard → Settings → API → service_role key. For production, use `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` (no `VITE_` prefix) so they are not exposed to the client.

### 2. Webhook Endpoint

**Production:** `https://yourdomain.com/api/webhooks`

**Local development:** Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks:

```bash
stripe listen --forward-to localhost:8080/api/webhooks
```

Then run the app with **Vercel CLI** so the API routes are available:

```bash
npm i -g vercel
vercel dev --listen 8080
```

This runs both the frontend and API on `localhost:8080`. The webhook URL for Stripe CLI will be `http://localhost:8080/api/webhooks`.

### 3. Configure Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://yourdomain.com/api/webhooks` (or the URL from `stripe listen` for local testing)
3. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy the signing secret and add it as `STRIPE_WEBHOOK_SECRET`

## Flow

1. User clicks "Subscribe" on Monthly or Annual plan → frontend calls `/api/create-checkout-session`
2. API creates Stripe Checkout session with 7-day trial, redirects to Stripe
3. User completes payment on Stripe
4. Stripe sends webhooks to `/api/webhooks`
5. Webhook handler upserts the `subscriptions` table in Supabase
6. User is redirected to `/payment-success`

## Test Cards (Stripe Test Mode)

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry, any CVC, any ZIP
