/**
 * Ödeme sağlayıcı geçidi (gateway) — soyutlama.
 *
 * Amaç: kontör satın alma, ilan planı ve emanet tahsilatını tek bir
 * arayüz üzerinden yürütmek. Şu an "mock" sağlayıcı otomatik başarı döner;
 * env ile PAYMENT_PROVIDER=iyzico | paytr seçildiğinde gerçek tahsilat
 * devreye girer (anahtarlar tanımlıysa).
 */

export type PaymentPurpose = "credits" | "job_plan" | "escrow";

export type CheckoutRequest = {
  /** Tahsil edilecek tutar (kuruş değil, TL — tam sayı). */
  amount: number;
  /** Neden ödendiği (raporlama/log için). */
  purpose: PaymentPurpose;
  /** Ödeyen kullanıcı. */
  userId: string;
  /** İşlem sonrası dönülecek URL (3D/redirect akışı için). */
  callbackUrl: string;
  /** Serbest açıklama. */
  description?: string;
  /** Sağlayıcıya iletilecek ek alanlar (sepet, kart tokenı vb.). */
  metadata?: Record<string, string | number>;
};

export type CheckoutResult =
  | {
      status: "redirect";
      /** Kullanıcının yönlendirileceği ödeme sayfası (3D Secure vb.). */
      redirectUrl: string;
      /** Sağlayıcı işlem referansı. */
      reference: string;
    }
  | {
      status: "paid";
      /** Anında başarı (mock veya saklı kart). */
      reference: string;
    };

export type VerifyResult = {
  paid: boolean;
  reference: string;
  amount?: number;
  raw?: unknown;
};

export interface PaymentProvider {
  readonly id: string;
  /** Ödeme başlatır (redirect ya da anında başarı). */
  createCheckout(req: CheckoutRequest): Promise<CheckoutResult>;
  /** Callback/webhook sonrası ödemeyi doğrular. */
  verify(reference: string, payload?: unknown): Promise<VerifyResult>;
}

export class PaymentNotConfiguredError extends Error {
  constructor(providerId: string, missing: string[]) {
    super(
      `${providerId} ödeme sağlayıcısı için ortam değişkenleri eksik: ${missing.join(", ")}`,
    );
    this.name = "PaymentNotConfiguredError";
  }
}
