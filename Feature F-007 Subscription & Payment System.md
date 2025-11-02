# Feature F-007: Subscription & Payment System

**Priority:** P1 (Should Have)  
**Status:** MVP  
**Dependencies:** F-001 (Authentication)  
**Estimated Effort:** 2 weeks

---

## Overview
Stripe-powered subscription system with three tiers (Free, Premium, Family) offering different storage limits and feature access.

---

## Requirements

### Subscription Tiers
- **F-007.1:** Free tier (5GB storage, 1 tree, 50 members max)
- **F-007.2:** Premium tier ($4.99/month):
  - 100GB storage
  - Unlimited trees
  - 200 members per tree
  - Advanced AI features
  - Priority support
- **F-007.3:** Family tier ($9.99/month):
  - 500GB shared storage
  - Unlimited trees
  - Unlimited members
  - All premium features
  - 5 admin accounts

### Subscription Management
- **F-007.4:** Subscription management:
  - Upgrade/downgrade plans
  - Cancel anytime
  - Billing history
  - Payment method updates
- **F-007.5:** Stripe integration for payments
- **F-007.6:** Free trial (14 days, no credit card required)

---

## Technical Implementation

### Tech Stack
- **Payment Processor:** Stripe
- **Stripe Products:** Subscriptions, Customer Portal
- **Webhooks:** Supabase Edge Functions
- **Database:** PostgreSQL

### Database Schema
```sql
-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  plan_tier TEXT NOT NULL DEFAULT 'free', -- free, premium, family
  status TEXT NOT NULL, -- active, trialing, past_due, canceled, incomplete
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription History (for analytics)
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- created, upgraded, downgraded, canceled, renewed
  from_tier TEXT,
  to_tier TEXT,
  stripe_event_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Methods
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- card, bank_account
  last4 TEXT,
  brand TEXT, -- visa, mastercard, etc.
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  amount_paid INTEGER, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- paid, open, void, uncollectible
  invoice_pdf TEXT, -- URL to PDF
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own subscription"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users see own payment methods"
  ON payment_methods FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users see own invoices"
  ON invoices FOR SELECT
  USING (user_id = auth.uid());
```

### API Endpoints
```typescript
// Subscription
POST   /api/subscription/create-checkout  // Create Stripe checkout session
POST   /api/subscription/portal           // Create customer portal session
GET    /api/subscription/current          // Get current subscription
POST   /api/subscription/upgrade          // Upgrade plan
POST   /api/subscription/downgrade        // Downgrade plan
POST   /api/subscription/cancel           // Cancel subscription

// Billing
GET    /api/billing/invoices              // List invoices
GET    /api/billing/usage                 // Get usage stats (storage, etc.)

// Webhooks
POST   /api/webhooks/stripe               // Stripe webhook handler
```

### Stripe Configuration
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create products in Stripe Dashboard
Products:
  - Lore Premium ($4.99/month)
    Price ID: price_premium_monthly
  - Lore Family ($9.99/month)
    Price ID: price_family_monthly

// Create checkout session
async function createCheckoutSession(userId: string, priceId: string) {
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    client_reference_id: userId,
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    subscription_data: {
      trial_period_days: 14, // 14-day free trial
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
  });

  return session.url;
}

// Create customer portal session
async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/settings/billing`,
  });

  return session.url;
}
```

### Webhook Handler (Supabase Edge Function)
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.0.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return new Response(String(err), { status: 400 });
  }
});

async function handleSubscriptionUpdate(subscription) {
  const { id, customer, status, current_period_end, items } = subscription;
  
  // Determine plan tier from price ID
  const priceId = items.data[0].price.id;
  const planTier = getPlanTierFromPriceId(priceId);

  // Update subscription in database
  await supabaseAdmin
    .from('subscriptions')
    .upsert({
      stripe_customer_id: customer,
      stripe_subscription_id: id,
      plan_tier: planTier,
      status: status,
      current_period_end: new Date(current_period_end * 1000),
      updated_at: new Date(),
    }, {
      onConflict: 'stripe_subscription_id'
    });
}
```

---

## User Flows

### Upgrade Flow
1. User clicks "Upgrade" on free tier limit warning
2. Redirected to pricing page
3. User selects "Premium" plan
4. Stripe Checkout opens in modal/redirect
5. User enters payment details
6. Trial starts immediately (14 days free)
7. User redirected back with success message
8. Features unlocked immediately
9. Email confirmation sent

### Manage Subscription Flow
1. User navigates to Settings > Billing
2. Clicks "Manage Subscription"
3. Stripe Customer Portal opens
4. User can:
   - Update payment method
   - View invoices
   - Cancel subscription
   - Upgrade/downgrade
5. Changes sync via webhook
6. User returned to app

### Cancellation Flow
1. User clicks "Cancel Subscription" in portal
2. Confirmation modal: "Cancel immediately or at period end?"
3. User selects "At period end"
4. Subscription marked for cancellation
5. User retains access until end of billing period
6. Email sent confirming cancellation
7. On period end, downgraded to free tier

---

## UI/UX Requirements

### Pricing Page
```
┌─────────────────────────────────────────┐
│  Choose Your Plan                       │
├─────────────────────────────────────────┤
│  ┌───────────┐ ┌───────────┐ ┌────────┐│
│  │   FREE    │ │  PREMIUM  │ │ FAMILY ││
│  │           │ │  $4.99/mo │ │ $9.99/mo││
│  │  5GB      │ │  100GB    │ │ 500GB  ││
│  │  1 tree   │ │  Unlimited│ │ Unlimit││
│  │  50 max   │ │  200 max  │ │ Unlimit││
│  │           │ │  AI Plus  │ │ AI Plus││
│  │ [Current] │ │ [Upgrade] │ │[Upgrade]││
│  └───────────┘ └───────────┘ └────────┘│
└─────────────────────────────────────────┘
```

### Billing Settings Page
```
┌─────────────────────────────────────────┐
│  Billing & Subscription                 │
├─────────────────────────────────────────┤
│  Current Plan: Premium                  │
│  Status: Active                         │
│  Next billing: Jan 15, 2025             │
│  Amount: $4.99                          │
│                                         │
│  [Manage Subscription]                  │
│  [View Invoices]                        │
│                                         │
│  Usage:                                 │
│  Storage: 23GB / 100GB  [=====----]     │
│  Trees: 5 / Unlimited                   │
│  Members: 124 / 200 per tree            │
└─────────────────────────────────────────┘
```

### Storage Limit Warning
```
┌─────────────────────────────────────────┐
│  ⚠️ Storage Almost Full                  │
│                                         │
│  You're using 4.5GB of your 5GB limit.  │
│  Upgrade to Premium for 100GB.          │
│                                         │
│  [Upgrade Now]  [Delete Old Files]      │
└─────────────────────────────────────────┘
```

---

## Feature Gating

### Enforcement Logic
```typescript
// Check if user can perform action based on plan
async function canPerformAction(userId: string, action: string) {
  const subscription = await getSubscription(userId);
  const limits = PLAN_LIMITS[subscription.plan_tier];

  switch (action) {
    case 'create_tree':
      const treeCount = await getTreeCount(userId);
      return treeCount < limits.maxTrees;

    case 'add_member':
      const memberCount = await getMemberCount(treeId);
      return memberCount < limits.maxMembersPerTree;

    case 'upload_file':
      const storageUsed = await getStorageUsage(userId);
      return storageUsed + fileSize < limits.storageLimit;

    case 'use_ai_advanced':
      return limits.advancedAI;

    default:
      return true;
  }
}

const PLAN_LIMITS = {
  free: {
    storageLimit: 5 * 1024 * 1024 * 1024,     // 5GB
    maxTrees: 1,
    maxMembersPerTree: 50,
    advancedAI: false,
  },
  premium: {
    storageLimit: 100 * 1024 * 1024 * 1024,   // 100GB
    maxTrees: Infinity,
    maxMembersPerTree: 200,
    advancedAI: true,
  },
  family: {
    storageLimit: 500 * 1024 * 1024 * 1024,   // 500GB
    maxTrees: Infinity,
    maxMembersPerTree: Infinity,
    advancedAI: true,
  },
};
```

---

## Validation Rules

### Payment Method
- Card number: Validated by Stripe
- Expiration: Must be in future
- CVC: 3-4 digits

### Downgrade Rules
- Can downgrade anytime
- Takes effect at end of billing period
- If over new limits, features restricted but data preserved
- Warning shown before downgrade

---

## Acceptance Criteria

✅ Users can upgrade to Premium via Stripe Checkout  
✅ 14-day free trial starts immediately  
✅ Payment method saved securely in Stripe  
✅ Webhooks update subscription status in real-time  
✅ Customer Portal allows cancellation and updates  
✅ Invoices accessible in billing settings  
✅ Feature gating enforces limits correctly  
✅ Storage usage accurately tracked  
✅ Downgrade doesn't lose user data  
✅ Email notifications sent for payment events  

---

## Testing Checklist

### Unit Tests
- [ ] Feature gating logic
- [ ] Plan limit calculations
- [ ] Storage quota enforcement

### Integration Tests
- [ ] Create checkout session
- [ ] Process webhook events
- [ ] Update subscription status
- [ ] Generate customer portal link

### E2E Tests
- [ ] Complete upgrade flow (test mode)
- [ ] Manage subscription in portal
- [ ] Cancel and reactivate subscription
- [ ] Downgrade and verify limits

### Webhook Tests
- [ ] subscription.created
- [ ] subscription.updated
- [ ] subscription.deleted
- [ ] invoice.paid
- [ ] invoice.payment_failed

---

## Error Handling

| Error | Message | Action |
|-------|---------|--------|
| Payment failed | "Payment failed. Please update your payment method." | Retry + portal link |
| Card declined | "Card declined. Try a different payment method." | Show card form |
| Webhook failed | Log error, retry automatically | Admin notification |
| Downgrade warning | "Downgrading will limit features. Continue?" | Confirmation modal |

---

## Success Metrics

- Free to Premium conversion: >5%
- Free to Family conversion: >2%
- Trial to paid conversion: >30%
- Churn rate: <5% monthly
- Average revenue per user (ARPU): >$3
- Customer lifetime value (LTV): >$120

---

## Future Enhancements (Post-MVP)

- Annual plans (20% discount)
- Gift subscriptions
- Team/Enterprise plans
- Add-ons (extra storage, extra admin seats)
- Referral program (free month for referrals)
- Student/educator discounts
- Non-profit pricing

---

## Notes

- Stripe handles PCI compliance (no card data stored on our servers)
- Customer Portal simplifies subscription management
- Always use test mode during development
- Monitor webhook delivery in Stripe dashboard
- Consider adding usage-based billing for enterprise later