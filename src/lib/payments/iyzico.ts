import {
  PaymentNotConfiguredError,
  type CheckoutRequest,
  type CheckoutResult,
  type PaymentProvider,
  type VerifyResult,
} from "./types";

/**
 * iyzico sağlayıcı iskeleti.
 *
 * Canlıya almak için:
 *   1) .env → IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL
 *      (sandbox: https://sandbox-api.iyzipay.com, canlı: https://api.iyzipay.com)
 *   2) `npm i iyzipay` ile resmi SDK'yı ekle veya aşağıdaki fetch akışını doldur.
 *   3) createCheckout içinde "Checkout Form Initialize" çağrısını yapıp
 *      dönen paymentPageUrl'i redirectUrl olarak döndür.
 *   4) verify içinde token ile "Checkout Form Retrieve" çağırıp
 *      paymentStatus === "SUCCESS" kontrolü yap.
 */
export class IyzicoProvider implements PaymentProvider {
  readonly id = "iyzico";

  private cfg() {
    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;
    const baseUrl = process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";
    const missing: string[] = [];
    if (!apiKey) missing.push("IYZICO_API_KEY");
    if (!secretKey) missing.push("IYZICO_SECRET_KEY");
    if (missing.length) throw new PaymentNotConfiguredError(this.id, missing);
    return { apiKey: apiKey!, secretKey: secretKey!, baseUrl };
  }

  async createCheckout(_req: CheckoutRequest): Promise<CheckoutResult> {
    this.cfg();
    // TODO: iyzico Checkout Form Initialize çağrısı.
    throw new Error(
      "iyzico createCheckout henüz uygulanmadı. Anahtarlar hazır; entegrasyon adımını tamamlayın.",
    );
  }

  async verify(_reference: string): Promise<VerifyResult> {
    this.cfg();
    // TODO: iyzico Checkout Form Retrieve çağrısı.
    throw new Error("iyzico verify henüz uygulanmadı.");
  }
}
