# Stripe Price IDs Setup Guide

## Overview
This guide will help you create the necessary Stripe products and price IDs for the DEPO Goal Tracker subscription plans.

## Step 1: Create Products in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Click "Add Product" for each plan below

## Step 2: Create the Following Products

### Product 1: Monthly Plan
- **Name**: DEPO Goal Tracker - Monthly
- **Description**: Perfect for getting started
- **Pricing**: $3.99/month recurring
- **Copy the Price ID** (starts with `price_`)

### Product 2: Family Plan
- **Name**: DEPO Goal Tracker - Family Plan
- **Description**: Up to 5 users
- **Pricing**: $12.99/month recurring
- **Copy the Price ID**

### Product 3: Annual Plan
- **Name**: DEPO Goal Tracker - Annual
- **Description**: Save $18 per year
- **Pricing**: $29.99/year recurring
- **Copy the Price ID**

### Product 4: 2-Year Plan
- **Name**: DEPO Goal Tracker - 2-Year
- **Description**: Best value - Save $56
- **Pricing**: $39.99 every 2 years recurring
- **Copy the Price ID**

## Step 3: Update PricingSection.tsx

Replace the placeholder price IDs in `src/components/PricingSection.tsx`:

```typescript
const plans = [
  {
    name: 'Monthly',
    priceId: 'price_YOUR_MONTHLY_PRICE_ID', // Replace this
    // ... rest of config
  },
  {
    name: 'Family Plan',
    priceId: 'price_YOUR_FAMILY_PRICE_ID', // Replace this
    // ... rest of config
  },
  // ... etc
];
```

## Step 4: Enable Customer Portal (Optional)

For users to manage their own subscriptions:

1. Go to [Customer Portal Settings](https://dashboard.stripe.com/settings/billing/portal)
2. Enable customer portal
3. Configure allowed actions (cancel, update payment method, etc.)

## Testing

Use Stripe test mode with test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any billing ZIP code

## Notes

- The 7-day free trial is configured in the edge function
- Webhooks are already set up to handle subscription events
- The subscription data is stored in the `subscriptions` table
