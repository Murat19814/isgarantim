import {
  PaymentNotConfiguredError,
  type CheckoutRequest,
  type CheckoutResult,
  type PaymentProvider,
  type VerifyResult,
} from "./types";

/**
 * PayTR sağlayıcı iskeleti.
 *
 * Canlıya almak için:
 *   1) .env → PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT
 *   2) createCheckout içinde "get-token" isteğiyle iframe token'ı al,
 *      redirectUrl = https://www.paytr.com/odeme/guvenli/<token>
 *   3) verify: PayTR callback POST'unda gelen hash'i
 *      merchant_key + merchant_salt ile doğrula (status === "success").
 */
export class PaytrProvider implements PaymentProvider {
  readonly id = "paytr";

  private cfg() {
    const merchantId = process.env.PAYTR_MERCHANT_ID;
    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;
    const missing: string[] = [];
    if (!merchantId) missing.push("PAYTR_MERCHANT_ID");
    if (!merchantKey) missing.push("PAYTR_MERCHANT_KEY");
    if (!merchantSalt) missing.push("PAYTR_MERCHANT_SALT");
    if (missing.length) throw new PaymentNotConfiguredError(this.id, missing);
    return { merchantId: merchantId!, merchantKey: merchantKey!, merchantSalt: merchantSalt! };
  }

  async createCheckout(_req: CheckoutRequest): Promise<CheckoutResult> {
    this.cfg();
    // TODO: PayTR get-token çağrısı.
    throw new Error(
      "PayTR createCheckout henüz uygulanmadı. Anahtarlar hazır; entegrasyon adımını tamamlayın.",
    );
  }

  async verify(_reference: string): Promise<VerifyResult> {
    this.cfg();
    // TODO: PayTR callback hash doğrulaması.
    throw new Error("PayTR verify henüz uygulanmadı.");
  }
}
