# Payment Setup & Razorpay Configuration Guide

VEYRA Studio features a mandatory dual-mode payment system toggled via the `TEST` environment variable.

## 1. Test Mode (`TEST=YES`)
When `TEST=YES`:
- No payment gateway keys are required.
- Simulated checkout dialog allows testing subscriptions and one-time credit packs with a single click.
- Immediately credits the user account and applies entitlements.
- Visible in billing history as "Simulated Test Transaction".

## 2. Real Payment Mode (`TEST=NO` - Razorpay)
When `TEST=NO`:
- Requires valid Razorpay credentials.
- Processes authentic INR payments and recurring subscriptions.

### Razorpay Credentials Setup:
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings** -> **API Keys**.
3. Generate your Key ID and Key Secret.
4. Set up a Webhook pointing to:
   `https://your-domain.com/api/billing/webhook/razorpay`
   - Select events:
     - `payment.captured`
     - `payment.failed`
     - `subscription.authenticated`
     - `subscription.activated`
     - `subscription.charged`
     - `subscription.cancelled`
5. Copy the generated Webhook Secret into your `.env.local`:
   ```env
   TEST=NO
   PAYMENT_PROVIDER=razorpay
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
   RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx
   ```

## 3. Security Requirements
- Client-side payment callbacks are treated as hints only.
- Entitlements and credit ledger entries are written strictly upon HMAC SHA256 signature verification on the server or through signed webhook events.
