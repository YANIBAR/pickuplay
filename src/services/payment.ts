import { Alert, Linking, Platform } from "react-native";
import { t } from "i18next";
import {
  initPaymentSheet,
  presentPaymentSheet,
  PaymentSheetError,
} from "@stripe/stripe-react-native";
import { authenticatedApi } from "@services/api";
import { authPaymentApi } from "./paymentApi";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type PaymentMethod = "venmo" | "paypal" | "stripe";
export type DiscountType = "percentage" | "fixed";

export interface Competition {
  id: string;
  name: string;
  /** Price per player, before any discount. */
  entryFee: number;
}

export interface PromoCode {
  code: string;
  discountType: DiscountType;
  /** Percentage (0-100) or fixed amount, depending on discountType. */
  value: number;
  /** Caps a percentage discount. */
  maxDiscount?: number;
  /** Minimum order amount required to use this code. */
  minAmount?: number;
  /** ISO date string. */
  expiresAt?: string;
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
  /** Stripe only: id of the PaymentIntent, to send to the backend when joining. */
  paymentIntentId?: string;
  /** True when the user dismissed the payment UI themselves (not an error). */
  canceled?: boolean;
  error?: string;
}

export interface StripeIntent {
  clientSecret: string;
  paymentIntentId?: string;
}

/** Contract for whatever talks to your backend. Secrets stay on the server. */
export interface PaymentApiClient {
  validatePromoCode(code: string, competitionId: string, subtotal: number): Promise<PromoCode | null>;
  createStripePaymentIntent(amountInCents: number, competitionId: string): Promise<StripeIntent>;
}

export class PromoCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromoCodeError";
  }
}

// ─────────────────────────────────────────────────────────────
// Config & small helpers
// ─────────────────────────────────────────────────────────────

const VENMO_RECIPIENT = "yanibar"; // Venmo username, no @
const PAYPAL_RECIPIENT = "yanibar"; // PayPal.me handle
const MERCHANT_NAME = "PickuPlay";
const PAYMENT_NOTE_PREFIX = "Pickuplay";

/** i18next returns the key when a translation is missing, so use defaultValue instead of `||`. */
const tr = (key: string, defaultValue: string, options?: Record<string, unknown>): string =>
  t(key, { defaultValue, ...options }) as string;

const round2 = (value: number): number => Math.round(value * 100) / 100;
const toCents = (value: number): number => Math.round(value * 100);

// ─────────────────────────────────────────────────────────────
// Pricing / promo helpers (pure)
// ─────────────────────────────────────────────────────────────

/** Computes the discount for a subtotal. Throws PromoCodeError if the code can't be used. Never exceeds the subtotal. */
export function calculateDiscount(subtotal: number, promo: PromoCode): number {
  if (!promo.active) {
    throw new PromoCodeError(tr("payment.promo.inactive", "This promo code is no longer active."));
  }
  if (promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now()) {
    throw new PromoCodeError(tr("payment.promo.expired", "This promo code has expired."));
  }
  if (promo.usageLimit != null && (promo.timesUsed ?? 0) >= promo.usageLimit) {
    throw new PromoCodeError(tr("payment.promo.limitReached", "This promo code has reached its usage limit."));
  }
  if (promo.minAmount != null && subtotal < promo.minAmount) {
    throw new PromoCodeError(
      tr("payment.promo.minAmount", `This promo code requires a minimum order of $${promo.minAmount}.`, {
        amount: promo.minAmount,
      })
    );
  }

  let discount = promo.discountType === "percentage" ? (subtotal * promo.value) / 100 : promo.value;
  if (promo.discountType === "percentage" && promo.maxDiscount != null) {
    discount = Math.min(discount, promo.maxDiscount);
  }
  return Math.min(discount, subtotal);
}

/** Full price breakdown, rounded to cents. */
export function buildPriceBreakdown(subtotal: number, promo?: PromoCode | null): PriceBreakdown {
  const discountAmount = promo ? calculateDiscount(subtotal, promo) : 0;
  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
    promoCode: promo?.code,
    total: Math.max(0, round2(subtotal - discountAmount)),
  };
}

/**
 * Like buildPriceBreakdown, but if the promo stops being valid (e.g. the player
 * count dropped below its minimum) it falls back to the undiscounted price
 * instead of throwing. Handy for render-time use.
 */
export function buildPriceBreakdownSafe(subtotal: number, promo?: PromoCode | null): PriceBreakdown {
  try {
    return buildPriceBreakdown(subtotal, promo);
  } catch (error) {
    if (error instanceof PromoCodeError) return buildPriceBreakdown(subtotal);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// Default backend client
// NOTE: endpoint paths are assumptions, adjust to your Java API.
// ─────────────────────────────────────────────────────────────

const defaultApiClient: PaymentApiClient = {
  async validatePromoCode(code, competitionId, subtotal) {
    try {
      const { data } = await authenticatedApi.post<PromoCode>("payments/promo/validate", {
        code,
        competitionId,
        subtotal,
      });
      return data ?? null;
    } catch (error: any) {
      if (error?.response?.status === 404) return null; // unknown code
      throw error;
    }
  },

  async createStripePaymentIntent(amountInCents) {
    // Backend responds: { type, message, data: "pi_xxx_secret_yyy" }
    
    const response = await authPaymentApi.post("create-intent", {"ItemType":"game","ItemId":"3","amountInCents":amountInCents});
    const clientSecret: string | undefined = response?.data?.data;

    if (!clientSecret) {
      throw new Error("Backend did not return a client secret.");
    }

    return {
      clientSecret,
      paymentIntentId: clientSecret.split("_secret_")[0],
    };
  },
};

// ─────────────────────────────────────────────────────────────
// Payment service
// ─────────────────────────────────────────────────────────────

class PaymentService {
  private api: PaymentApiClient = defaultApiClient;

  /** Override the backend client (tests, different environments). */
  configure(api: PaymentApiClient) {
    this.api = api;
  }

  // ── Pricing ──────────────────────────────────────────────

  /** Price breakdown with no promo, for the initial render. */
  getBaseBreakdown(competition: Competition, quantity = 1): PriceBreakdown {
    return buildPriceBreakdown(competition.entryFee * quantity);
  }

  /** Validates a code with the backend (source of truth) and checks it applies to this order. */
  async validatePromoCode(code: string, competition: Competition, quantity = 1): Promise<PromoCode> {
    const trimmed = code.trim();
    if (!trimmed) {
      throw new PromoCodeError(tr("payment.promo.empty", "Enter a promo code."));
    }

    const subtotal = round2(competition.entryFee * quantity);
    const promo = await this.api.validatePromoCode(trimmed, competition.id, subtotal);
    if (!promo) {
      throw new PromoCodeError(tr("payment.promo.invalid", "That promo code isn't valid."));
    }

    calculateDiscount(subtotal, promo); // throws if expired / below minimum / etc.
    return promo;
  }

  /** Convenience: validate a code and return the resulting breakdown. */
  async applyPromoCode(code: string, competition: Competition, quantity = 1): Promise<PriceBreakdown> {
    const promo = await this.validatePromoCode(code, competition, quantity);
    return buildPriceBreakdown(competition.entryFee * quantity, promo);
  }

  // ── Dispatch ─────────────────────────────────────────────

  async pay(method: PaymentMethod, amount: number, competition: Competition): Promise<PaymentResult> {
    switch (method) {
      case "venmo":
        return this.payWithVenmo(amount, competition);
      case "paypal":
        return this.payWithPayPal(amount, competition);
      default: {
        const exhaustiveCheck: never = method;
        throw new Error(`Unsupported payment method: ${exhaustiveCheck}`);
      }
    }
  }

  // ── Venmo ────────────────────────────────────────────────

  async payWithVenmo(amount: number, competition: Competition): Promise<PaymentResult> {
    const note = encodeURIComponent(`${PAYMENT_NOTE_PREFIX} - ${competition.name}`);
    const formatted = amount.toFixed(2);

    const appUrl = `venmo://paycharge?txn=pay&recipients=${VENMO_RECIPIENT}&amount=${formatted}&note=${note}`;
    const webUrl = `https://venmo.com/${VENMO_RECIPIENT}?txn=pay&amount=${formatted}&note=${note}`;

    return this.openPaymentLink("venmo", amount, webUrl, appUrl);
  }

  // ── PayPal ───────────────────────────────────────────────

  async payWithPayPal(amount: number, competition: Competition): Promise<PaymentResult> {
    const note = encodeURIComponent(`${PAYMENT_NOTE_PREFIX} - ${competition.name}`);

    // paypal.me is a universal link: opens the PayPal app if installed, browser otherwise.
    const webUrl = `https://paypal.me/${PAYPAL_RECIPIENT}/${amount.toFixed(2)}?note=${note}`;

    return this.openPaymentLink("paypal", amount, webUrl);
  }

  // ── Stripe ───────────────────────────────────────────────

  /**
   * Full Stripe flow: create the PaymentIntent on the backend, initialise the
   * PaymentSheet and present it. The secret key never touches the app.
   */
  async payWithStripe(clientSecret: string): Promise<PaymentResult> {
    const method: PaymentMethod = "stripe";
    try {
      const paymentIntentId = clientSecret.split("_secret_")[0];
      console.log(`[payment:${method}] Starting payment with intent ${paymentIntentId}...`);
      const init = await initPaymentSheet({
        merchantDisplayName: MERCHANT_NAME,
        paymentIntentClientSecret: clientSecret,
      });
      if (init.error) {
        return this.fail(
          method,
          init.error.message,
          tr("payment.stripe.failedToCreateIntent", "Could not start the payment. Please try again.")
        );
      }

      const { error } = await presentPaymentSheet();
      if (error) {
        if (error.code === PaymentSheetError.Canceled) {
          return { success: false, method, canceled: true } as PaymentResult; // silent, no alert
        }
        return this.fail(method, error.message, error.message);
      }

      return { success: true, method, paymentIntentId };
    } catch (error: any) {
      return this.fail(
        method,
        error?.message ?? "Unknown error",
        tr("payment.stripe.failedToCreateIntent", "Could not start the payment. Please try again.")
      );
    }
  }

  // ── Internal ─────────────────────────────────────────────

  /** Opens the app deep link when available (native only), otherwise the web URL. */
  private async openPaymentLink(
    method: "venmo" | "paypal",
    amount: number,
    webUrl: string,
    appUrl?: string
  ): Promise<PaymentResult> {
    try {
      const useApp = !!appUrl && Platform.OS !== "web" && (await Linking.canOpenURL(appUrl));
      await Linking.openURL(useApp ? appUrl! : webUrl);
      return { success: true, method, amount };
    } catch (error: any) {
      const label = method === "venmo" ? "Venmo" : "PayPal";
      return this.fail(
        method,
        amount,
        error?.message ?? "Unknown error",
        tr(`payment.${method}.failedToOpen`, `Could not open ${label}.`)
      );
    }
  }

  /** Logs the technical reason, shows a user-facing alert, and returns a failed result. */
  private fail(method: PaymentMethod, amount: number, reason: string, userMessage?: string): PaymentResult {
    console.warn(`[payment:${method}]`, reason);
    Alert.alert(tr("common.error", "Error"), userMessage ?? reason);
    return { success: false, method, amount, error: userMessage ?? reason };
  }
}

export default new PaymentService();