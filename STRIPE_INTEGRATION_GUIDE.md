# 🚀 Stripe Integration Guide - NeuraSlide

## 📋 Overview

This guide explains how the Stripe payment integration works in NeuraSlide, from user clicking "Start Pro Trial" to completing payment and getting access to premium features.

## 🔄 Complete Payment Flow

### Step 1: User Initiates Payment

```
User clicks "Start Pro Trial" → Frontend calls createSubscription API
```

**Frontend Code:**

```typescript
// neura-front/src/stripe/hooks/usePayment.ts
const createSubscription = async (planId: string) => {
  const result = await callApi({
    apiFunction: stripeApi.createSubscription,
    data: planId,
    fallbackSuccessMessage: "Redirecting to payment...",
    fallbackErrorMessage: "Failed to create subscription",
  });

  if (result.success && result.data?.data?.data?.checkoutUrl) {
    window.location.href = result.data.data.data.checkoutUrl;
  }
};
```

### Step 2: Backend Creates Stripe Checkout Session

```
Frontend API call → Backend creates Stripe customer → Creates checkout session → Returns checkoutUrl
```

**Backend Code:**

```typescript
// backend/src/crystal/billing/billingService.ts
const session = await stripe.checkout.sessions.create({
  customer: stripeCustomerId,
  line_items: [{ price: plan.stripePriceId, quantity: 1 }],
  mode: "subscription",
  success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
  cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
  allow_promotion_codes: true,
  billing_address_collection: "auto",
  customer_update: { address: "auto", name: "auto" },
});

return { checkoutUrl: session.url, sessionId: session.id };
```

### Step 3: User Completes Payment on Stripe

```
Frontend redirects to Stripe Checkout → User enters card details → Stripe processes payment
```

**Test Card Details:**

- **Card Number:** `4242424242424242`
- **Expiry:** Any future date (e.g., `12/25`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

### Step 4: Stripe Sends Webhook

```
Payment successful → Stripe sends webhook to backend → Backend creates subscription
```

**Webhook Handler:**

```typescript
// backend/src/webhooks/stripe/stripeWebhookService.ts
case "checkout.session.completed":
  processingResult = await this.handleCheckoutSessionCompleted(
    event.data.object as StripeCheckoutSession
  );
  break;
```

### Step 5: Backend Creates Subscription

```
Webhook received → Create subscription in database → Initialize usage records → User redirected to dashboard
```

## 🧪 How to Test

### 1. Local Testing

```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd neura-front
npm run dev
```

### 2. Test Payment Flow

1. **Go to Pricing Page:** `http://localhost:3001/pricing`
2. **Click "Start Pro Trial"** on any paid plan
3. **You should see:** Success toast "Redirecting to payment..."
4. **You should be redirected** to Stripe Checkout page
5. **Enter test card:** `4242424242424242`
6. **Complete payment** on Stripe
7. **You should be redirected** back to dashboard

### 3. Check Backend Logs

```bash
# Watch backend logs for:
[INFO] Stripe checkout session created: { sessionId: "cs_test_...", customerId: "cus_...", planId: "..." }
[INFO] Stripe webhook event received: { eventType: "checkout.session.completed" }
[INFO] Subscription created successfully: { subscriptionId: "..." }
```

### 4. Check Database

```sql
-- Check if subscription was created
SELECT * FROM "Subscription" WHERE "userId" = 'your-user-id';

-- Check if usage records were initialized
SELECT * FROM "UsageRecord" WHERE "userId" = 'your-user-id';
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3001
```

**Frontend (.env):**

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Stripe Dashboard Setup

1. **Create Products & Prices:**

   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Create products for each plan
   - Create prices for monthly/yearly billing
   - Copy price IDs (e.g., `price_1S1TTuRreCqcRKInwWLKjitb`)

2. **Update Database Plans:**

   ```bash
   # Run the script to update plans with Stripe price IDs
   cd backend
   npx tsx scripts/create-test-plans.ts
   ```

3. **Set Up Webhooks:**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-backend.com/webhooks/stripe`
   - Select events: `checkout.session.completed`
   - Copy webhook secret to backend env

## 🚨 Common Issues & Solutions

### Issue 1: "User already has an active subscription"

**Solution:** Cancel existing subscription or use different test user

### Issue 2: "Plan does not have a Stripe price ID configured"

**Solution:** Update plans in database with correct Stripe price IDs

### Issue 3: "Failed to create subscription" toast

**Solution:** Check backend logs for specific error, usually missing Stripe keys

### Issue 4: No redirect to Stripe

**Solution:** Check if `checkoutUrl` is in response, verify frontend response handling

### Issue 5: Webhook not received

**Solution:**

- Verify webhook endpoint is accessible
- Check webhook secret in environment
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:5513/webhooks/stripe`

## 📊 Response Structures

### Backend API Response

```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
    "sessionId": "cs_test_..."
  },
  "message": "Subscription created successfully"
}
```

### Frontend Response Handling

```typescript
// The response goes through multiple layers:
// 1. Axios response: { data: { success: true, data: {...}, message: "..." } }
// 2. useApiCall result: { success: true, data: axiosResponse, message: "..." }
// 3. Final access: result.data.data.data.checkoutUrl
```

## 🎯 Key Files

### Frontend

- `neura-front/src/stripe/hooks/usePayment.ts` - Payment logic
- `neura-front/src/stripe/utils/api.ts` - API calls
- `neura-front/src/pages/pricing/Pricing.tsx` - Pricing page

### Backend

- `backend/src/crystal/billing/billingService.ts` - Business logic
- `backend/src/crystal/billing/billingController.ts` - API endpoints
- `backend/src/webhooks/stripe/stripeWebhookService.ts` - Webhook handling
- `backend/scripts/create-test-plans.ts` - Plan setup

## 🚀 Production Deployment

1. **Update Environment Variables:**

   - Use live Stripe keys (not test keys)
   - Set correct frontend URL
   - Configure webhook endpoint

2. **Test Production Flow:**

   - Use real credit cards (small amounts)
   - Verify webhooks are working
   - Check subscription creation

3. **Monitor:**
   - Stripe Dashboard for payments
   - Backend logs for errors
   - Database for subscription status

---

**🎉 Your Stripe integration is now complete and ready for production!**
