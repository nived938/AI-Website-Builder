# VEYRA Studio Billing System & Credit Ledger Specification

## 1. Credit Structure & Hierarchy

Users have three buckets of credits:
1. **Daily Free Credits**: 200 credits granted automatically to every free user. Resets at 00:00 UTC daily. Expire daily.
2. **Subscription Credits**: Monthly recurring credits granted upon active plan renewal. Expire at the end of the monthly billing cycle.
3. **Purchased Credits (Pay-as-you-go)**: Top-up credit bundles. Never expire.

### Priority of Consumption:
When a billable AI action is executed, credits are deducted in order:
`Daily Free Credits` -> `Subscription Credits` -> `Purchased Credits`

## 2. Multi-Effort Multipliers

| Effort Level | Credit Multiplier | Verification & Depth | Eligible Plans |
| :--- | :--- | :--- | :--- |
| **LOW** | 1.0x | Single-pass generation, basic diffing | All (Free, Starter, Pro, Ultimate) |
| **MEDIUM** | 2.0x | Multi-file inspection, CSS validation | Starter, Pro, Ultimate |
| **HIGH** | 4.0x | In-depth planning, component checking | Pro, Ultimate |
| **MAX** | 8.0x | Deep RAG research, multi-stage review | Ultimate |

## 3. Atomic Reservation & Settlement Lifecycle
```
[User Request]
      |
[Cost Estimate: Base Tokens * Effort Multiplier]
      |
[Atomic Credit Reservation: credit_reservations table]
      |
      +---> Insufficient Funds? -> Throw 402 Payment Required
      |
[Execute Ollama AI Generation]
      |
      +---> Success? -> Settle actual consumed credits in credit_ledger, release diff.
      |
      +---> Model Error / Cancelled? -> Fully release reserved hold (zero charge).
```

## 4. Plans & Limits Configuration

| Tier | Price (INR/mo) | Monthly Credits | Daily Free | Allowed Effort | File Upload Limit | Max Projects |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Free** | ₹0 | 0 | 200 | LOW | 5 files (25MB total) | 3 |
| **Starter** | ₹999 | 2,500 | 200 | LOW, MED | 20 files (100MB) | 10 |
| **Pro** | ₹2,499 | 10,000 | 200 | LOW, MED, HIGH | 100 files (500MB) | Unlimited |
| **Ultimate**| ₹5,999 | 30,000 | 200 | ALL (LOW to MAX)| 500 files (2GB) | Unlimited |
