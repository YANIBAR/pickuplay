import { Alert, Linking, Platform } from "react-native";
import { t } from "i18next"; // adjust to your actual i18n import

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type PaymentMethod = "venmo" | "paypal" | "stripe";

export type DiscountType = "percentage" | "fixed";

export interface Competition {
  id: string;
  name: string;
  entryFee: number; // base price before any discount
}

export interface PromoCode {
  code: string;
  discountType: DiscountType;
  value: number; // percentage (0-100) or fixed amount, depending on discountType
  maxDiscount?: number; // caps a percentage discount, optional
  minAmount?: number; // minimum order amount required to use this code
  expiresAt?: string; // ISO date string
  usageLimit?: number;
  timesUsed?: number;
  active: boolean;
}

export interface PriceBreakdown {
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  total: number;
}

export interface PaymentResult {
  success: boolean;
  method: PaymentMethod;
  amount: number;
  error?: string;
}

// Minimal client contract for whatever talks to your backend
// (validate promo codes server-side, create Stripe payment intents, etc.)
export interface PaymentApiClient {
  validatePromoCode(code: string, competitionId: string, subtotal: number): Promise<PromoCode | null>;
  createStripePaymentIntent(amount: number, competitionId: string): Promise<{ clientSecret: string }>;
}

// ─────────────────────────────────────────────────────────────
// Errors
// ─────────────────────────────────────────────────────────────

export class PromoCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromoCodeError";
  }
}

// ─────────────────────────────────────────────────────────────
// Discount / Promo helpers
// ─────────────────────────────────────────────────────────────

/** Pure function: computes discount amount for a given subtotal and promo. Never returns more than the subtotal. */
export function calculateDiscount(subtotal: number, promo: PromoCode): number {
  if (!promo.active) {
    throw new PromoCodeError(t("payment.promo.inactive") || "This promo code is no longer active.");
  }

  if (promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now()) {
    throw new PromoCodeError(t("payment.promo.expired") || "This promo code has expired.");
  }

  if (promo.usageLimit != null && (promo.timesUsed ?? 0) >= promo.usageLimit) {
    throw new PromoCodeError(t("payment.promo.limitReached") || "This promo code has reached its usage limit.");
  }

  if (promo.minAmount != null && subtotal < promo.minAmount) {
    throw new PromoCodeError(
      t("payment.promo.minAmount", { amount: promo.minAmount }) ||
        `This promo code requires a minimum order of $${promo.minAmount}.`
    );
  }

  let discount =
    promo.discountType === "percentage" ? (subtotal * promo.value) / 100 : promo.value;

  if (promo.discountType === "percentage" && promo.maxDiscount != null) {
    discount = Math.min(discount, promo.maxDiscount);
  }

  return Math.min(discount, subtotal);
}

/** Builds a full price breakdown from a base amount, optional promo. Rounds to cents. */
export function buildPriceBreakdown(subtotal: number, promo?: PromoCode | null): PriceBreakdown {
  const discountAmount = promo ? calculateDiscount(subtotal, promo) : 0;
  const total = Math.max(0, round2(subtotal - discountAmount));

  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
    promoCode: promo?.code,
    total,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// ─────────────────────────────────────────────────────────────
// Payment Service
// ─────────────────────────────────────────────────────────────

const VENMO_RECIPIENT = "yanibar"; // Venmo username, no @
const PAYPAL_RECIPIENT = "yanibar"; // PayPal.me handle, adjust as needed

class PaymentService {
  private api?: PaymentApiClient;

  /** Wire up a backend client (used for promo validation + Stripe intents). */
  configure(api: PaymentApiClient) {
    this.api = api;
  }

  // ── Promo codes ─────────────────────────────────────────

  /**
   * Validates a promo code against the backend (source of truth) and returns
   * the resulting price breakdown. Throws PromoCodeError with a user-facing
   * message on failure.
   */
  async applyPromoCode(code: string, competition: Competition): Promise<PriceBreakdown> {
    const trimmed = code.trim();
    if (!trimmed) {
      throw new PromoCodeError(t("payment.promo.empty") || "Enter a promo code.");
    }

    if (!this.api) {
      throw new PromoCodeError("PaymentService is not configured with an API client.");
    }

    const promo = await this.api.validatePromoCode(trimmed, competition.id, competition.entryFee);

    if (!promo) {
      throw new PromoCodeError(t("payment.promo.invalid") || "That promo code isn't valid.");
    }

    return buildPriceBreakdown(competition.entryFee, promo);
  }

  /** Local breakdown with no promo applied — useful for initial render before any code is entered. */
  getBaseBreakdown(competition: Competition): PriceBreakdown {
    return buildPriceBreakdown(competition.entryFee);
  }

  // ── Venmo ────────────────────────────────────────────────
  async handleVenmoPayment(amount: number, title: string): Promise<PaymentResult> {
    const note = encodeURIComponent(`Pickuplay - ${title}`);
    const formattedAmount = amount.toFixed(2);

    const venmoAppUrl = `venmo://paycharge?txn=pay&recipients=${VENMO_RECIPIENT}&amount=${formattedAmount}&note=${note}`;
    const venmoWebUrl = `https://venmo.com/${VENMO_RECIPIENT}?txn=pay&amount=${formattedAmount}&note=${note}`;

    return this.openPaymentLink("venmo", amount, venmoAppUrl, venmoWebUrl, "payment.venmo.failedToOpen");
  }

  // ── PayPal ───────────────────────────────────────────────

  async handlePayPalPayment(amount: number, competition: Competition): Promise<PaymentResult> {
    const formattedAmount = amount.toFixed(2);
    const note = encodeURIComponent(`Pickuplay - ${competition.name}`);

    // paypal.me deep link works both as app link (if installed) and web fallback
    const paypalAppUrl = `paypal://paypalme/${PAYPAL_RECIPIENT}/${formattedAmount}`;
    const paypalWebUrl = `https://www.paypal.me/${PAYPAL_RECIPIENT}/${formattedAmount}?description=${note}`;

    return this.openPaymentLink("paypal", amount, paypalAppUrl, paypalWebUrl, "payment.paypal.failedToOpen");
  }

  // ── Stripe ───────────────────────────────────────────────

  /**
   * Creates a PaymentIntent on your backend and returns the clientSecret so
   * the caller can hand it to @stripe/stripe-react-native's
   * `useConfirmPayment` / `initPaymentSheet` flow. Stripe requires an
   * SDK-driven UI (card field or PaymentSheet), so this service only handles
   * the intent creation, not URL opening.
   */
  async handleStripePayment(amount: number, competition: Competition): Promise<{ clientSecret: string }> {
    if (!this.api) {
      throw new Error("PaymentService is not configured with an API client.");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    try {
      return await this.api.createStripePaymentIntent(round2(amount), competition.id);
    } catch (error) {
      Alert.alert(
        t("common.error") || "Error",
        t("payment.stripe.failedToCreateIntent") || "Could not start the payment. Please try again."
      );
      throw error;
    }
  }

  // ── Shared dispatch ──────────────────────────────────────

  async pay(method: PaymentMethod, amount: number, competition: Competition) {
    switch (method) {
      case "venmo":
        return this.handleVenmoPayment(amount, competition);
      case "paypal":
        return this.handlePayPalPayment(amount, competition);
      case "stripe":
        return this.handleStripePayment(amount, competition);
      default: {
        const exhaustiveCheck: never = method;
        throw new Error(`Unsupported payment method: ${exhaustiveCheck}`);
      }
    }
  }

  // ── Internal helpers ─────────────────────────────────────

  private async openPaymentLink(
    method: "venmo" | "paypal",
    amount: number,
    appUrl: string,
    webUrl: string,
    errorKey: string
  ): Promise<PaymentResult> {
    try {
      const supported = Platform.OS !== "web" && (await Linking.canOpenURL(appUrl));
      await Linking.openURL(supported ? appUrl : webUrl);
      return { success: true, method, amount };
    } catch (error) {
      const message = t(errorKey) || `Could not open ${method}.`;
      Alert.alert(t("common.error") || "Error", message);
      return { success: false, method, amount, error: message };
    }
  }
}

export default new PaymentService();