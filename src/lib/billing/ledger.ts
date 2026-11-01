export interface CreditBalance {
  userId: string;
  dailyFreeCredits: number;
  dailyResetDate: string; // YYYY-MM-DD
  subscriptionCredits: number;
  purchasedCredits: number;
  totalAvailable: number;
  lifetimeUsedCredits: number;
}

export interface CreditLedgerEntry {
  id: string;
  userId: string;
  amount: number; // positive = added, negative = deducted
  balanceType: "daily_free" | "subscription" | "purchased";
  actionType:
    | "daily_reset"
    | "subscription_grant"
    | "purchase"
    | "ai_generation"
    | "ai_reservation_refund"
    | "admin_adjustment";
  description: string;
  referenceId?: string;
  idempotencyKey?: string;
  createdAt: string;
}

export interface ReservationHold {
  reservationId: string;
  userId: string;
  amount: number;
  settled: boolean;
}

export class CreditLedgerService {
  /**
   * Resets daily free credits if current date exceeds daily_reset_date.
   */
  checkAndApplyDailyReset(balance: CreditBalance): {
    balance: CreditBalance;
    resetApplied: boolean;
  } {
    const today = new Date().toISOString().split("T")[0];
    if (balance.dailyResetDate !== today) {
      const updatedBalance: CreditBalance = {
        ...balance,
        dailyFreeCredits: 200,
        dailyResetDate: today,
        totalAvailable: 200 + balance.subscriptionCredits + balance.purchasedCredits,
      };
      return { balance: updatedBalance, resetApplied: true };
    }
    return { balance, resetApplied: false };
  }

  /**
   * Atomically checks if user has sufficient funds for reservation.
   * Priority: daily_free -> subscription -> purchased
   */
  canAfford(balance: CreditBalance, requiredCredits: number): boolean {
    const total =
      balance.dailyFreeCredits +
      balance.subscriptionCredits +
      balance.purchasedCredits;
    return total >= requiredCredits;
  }

  /**
   * Deducts credits respecting consumption hierarchy:
   * 1. Daily free
   * 2. Subscription
   * 3. Purchased
   */
  deductCredits(
    balance: CreditBalance,
    amountToDeduct: number,
    description: string,
    referenceId?: string
  ): {
    updatedBalance: CreditBalance;
    ledgerEntries: Array<Omit<CreditLedgerEntry, "id" | "createdAt">>;
  } {
    if (amountToDeduct <= 0) {
      return { updatedBalance: balance, ledgerEntries: [] };
    }

    let remaining = amountToDeduct;
    let dailyFree = balance.dailyFreeCredits;
    let subscription = balance.subscriptionCredits;
    let purchased = balance.purchasedCredits;
    const ledgerEntries: Array<Omit<CreditLedgerEntry, "id" | "createdAt">> = [];

    // 1. Deduct from Daily Free
    if (dailyFree > 0 && remaining > 0) {
      const takeDaily = Math.min(dailyFree, remaining);
      dailyFree -= takeDaily;
      remaining -= takeDaily;
      ledgerEntries.push({
        userId: balance.userId,
        amount: -takeDaily,
        balanceType: "daily_free",
        actionType: "ai_generation",
        description: `${description} (Daily free credits)`,
        referenceId,
      });
    }

    // 2. Deduct from Subscription
    if (subscription > 0 && remaining > 0) {
      const takeSub = Math.min(subscription, remaining);
      subscription -= takeSub;
      remaining -= takeSub;
      ledgerEntries.push({
        userId: balance.userId,
        amount: -takeSub,
        balanceType: "subscription",
        actionType: "ai_generation",
        description: `${description} (Subscription allowance)`,
        referenceId,
      });
    }

    // 3. Deduct from Purchased
    if (purchased > 0 && remaining > 0) {
      const takePurchased = Math.min(purchased, remaining);
      purchased -= takePurchased;
      remaining -= takePurchased;
      ledgerEntries.push({
        userId: balance.userId,
        amount: -takePurchased,
        balanceType: "purchased",
        actionType: "ai_generation",
        description: `${description} (Purchased top-up)`,
        referenceId,
      });
    }

    if (remaining > 0) {
      throw new Error(`Insufficient credits: needed ${amountToDeduct}, deficit of ${remaining}.`);
    }

    const updatedBalance: CreditBalance = {
      ...balance,
      dailyFreeCredits: dailyFree,
      subscriptionCredits: subscription,
      purchasedCredits: purchased,
      totalAvailable: dailyFree + subscription + purchased,
      lifetimeUsedCredits: balance.lifetimeUsedCredits + amountToDeduct,
    };

    return { updatedBalance, ledgerEntries };
  }

  /**
   * Adds credits (e.g. from subscription grant, top-up purchase, or admin adjustment).
   */
  addCredits(
    balance: CreditBalance,
    amount: number,
    balanceType: "subscription" | "purchased" | "daily_free",
    actionType: CreditLedgerEntry["actionType"],
    description: string,
    idempotencyKey?: string
  ): {
    updatedBalance: CreditBalance;
    ledgerEntry: Omit<CreditLedgerEntry, "id" | "createdAt">;
  } {
    const updated = { ...balance };
    if (balanceType === "subscription") {
      updated.subscriptionCredits += amount;
    } else if (balanceType === "purchased") {
      updated.purchasedCredits += amount;
    } else {
      updated.dailyFreeCredits += amount;
    }

    updated.totalAvailable =
      updated.dailyFreeCredits +
      updated.subscriptionCredits +
      updated.purchasedCredits;

    const ledgerEntry: Omit<CreditLedgerEntry, "id" | "createdAt"> = {
      userId: balance.userId,
      amount,
      balanceType,
      actionType,
      description,
      idempotencyKey,
    };

    return { updatedBalance: updated, ledgerEntry };
  }
}

export const creditLedgerService = new CreditLedgerService();
