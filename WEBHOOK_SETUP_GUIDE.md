# Stripe Webhooks Setup Guide

## Overview
This guide shows you how to configure Stripe webhooks to automatically sync subscription status to your Supabase database in real-time.

## Part 1: Understanding the Webhook Function

The `stripe-webhooks` edge function handles these events:
- ✅ `customer.subscription.created` - New subscription
- ✅ `customer.subscription.updated` - Subscription changes
- ✅ `customer.subscription.deleted` - Cancellation
- ✅ `customer.subscription.trial_will_end` - Trial ending notification
- ✅ `invoice.payment_failed` - Payment issues

## Part 2: Get Your Webhook Endpoint URL

Your webhook endpoint is:
```
https://xphaqwuqfirixskqjhjr.supabase.co/functions/v1/stripe-webhooks
```

## Part 3: Configure Webhook in Stripe Dashboard

### Step 1: Go to Webhooks
1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **Webhooks**
3. Click **Add endpoint**

### Step 2: Add Endpoint URL
- **Endpoint URL**: `https://xphaqwuqfirixskqjhjr.supabase.co/functions/v1/stripe-webhooks`
- **Description**: "Subscription sync to Supabase"

### Step 3: Select Events to Listen To
Select these events:
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `customer.subscription.trial_will_end`
- ✅ `invoice.payment_failed`

### Step 4: Save and Get Signing Secret
1. Click **Add endpoint**
2. Click on your new endpoint
3. Click **Reveal** under "Signing secret"
4. Copy the secret (starts with `whsec_`)

## Part 4: Add Webhook Secret to Supabase

The webhook secret is already configured in your Supabase project as:
```
STRIPE_WEBHOOK_SECRET
```

If you need to update it:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Edge Functions**
4. Find `STRIPE_WEBHOOK_SECRET` and update the value
5. Paste your webhook signing secret from Stripe

## Part 5: Test the Webhook

### Using Stripe CLI (Recommended)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local endpoint (for testing)
stripe listen --forward-to https://xphaqwuqfirixskqjhjr.supabase.co/functions/v1/stripe-webhooks

# Trigger a test event
stripe trigger customer.subscription.created
```

### Using Stripe Dashboard
1. Go to **Developers** → **Webhooks**
2. Click on your endpoint
3. Click **Send test webhook**
4. Select `customer.subscription.created`
5. Click **Send test webhook**

## Part 6: Verify Webhook is Working

### Check Stripe Dashboard
1. Go to your webhook endpoint in Stripe
2. Click the **Logs** tab
3. You should see successful responses (200 status)

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click **Edge Functions** → **stripe-webhooks**
3. Click **Logs**
4. Look for "Processing event:" messages

### Check Database
```sql
-- Run this in Supabase SQL Editor
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
```

You should see subscription records being created/updated.

## Part 7: What Happens Automatically

### When a Customer Subscribes
1. Stripe sends `customer.subscription.created` event
2. Webhook creates record in `subscriptions` table
3. Record includes: status, price_id, period dates, trial info

### When Subscription Updates
1. Stripe sends `customer.subscription.updated` event
2. Webhook updates the subscription record
3. Status changes (active → past_due → canceled)

### When Payment Fails
1. Stripe sends `invoice.payment_failed` event
2. Webhook sets status to `past_due`
3. Your app can show payment retry UI

### When Subscription Cancels
1. Stripe sends `customer.subscription.deleted` event
2. Webhook sets status to `canceled`
3. User loses access at period end

## Part 8: Troubleshooting

### Webhook Returns 400 Error
- Check that `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify the secret matches your Stripe dashboard
- Check Supabase logs for detailed error messages

### Subscriptions Not Updating
- Verify webhook events are selected in Stripe
- Check that `user_id` is in subscription metadata
- Ensure subscriptions table exists in Supabase

### Signature Verification Failed
- Webhook secret is wrong or missing
- Update `STRIPE_WEBHOOK_SECRET` in Supabase
- Make sure you're using the signing secret, not API key

## Part 9: Production Checklist

- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] All 5 events selected
- [ ] Webhook signing secret added to Supabase
- [ ] Test webhook sent successfully
- [ ] Database records updating correctly
- [ ] Logs showing successful processing
- [ ] Repeat setup for production Stripe account

## Part 10: Subscription Metadata

When creating checkout sessions (in stripe-payments function), always include:
```javascript
subscription_data: {
  metadata: {
    user_id: userId, // CRITICAL: Required for webhook to work
  },
}
```

Without `user_id` in metadata, the webhook can't link subscriptions to users!

## Security Notes

✅ Signature verification prevents unauthorized webhook calls
✅ Only Stripe can trigger database updates
✅ Service role key used for database access
✅ All webhook attempts are logged

## Need Help?

Common issues:
- **401 Unauthorized**: Check Supabase service role key
- **400 Bad Request**: Check webhook secret
- **404 Not Found**: Verify endpoint URL
- **500 Server Error**: Check Supabase logs for details

Your webhook system is now live and will automatically sync all subscription changes! 🎉
