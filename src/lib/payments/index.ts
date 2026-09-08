import { MockPaymentProvider } from "./mock";
import { IyzicoProvider } from "./iyzico";
import { PaytrProvider } from "./paytr";
import type { PaymentProvider } from "./types";

export * from "./types";

/**
 * Aktif ödeme sağlayıcısını döndürür.
 * PAYMENT_PROVIDER = mock (varsayılan) | iyzico | paytr
 *
 * Kullanım:
 *   const gw = getPaymentProvider();
 *   const res = await gw.createCheckout({ amount, purpose, userId, callbackUrl });
 *   if (res.status === "redirect") return NextResponse.redirect(res.redirectUrl);
 */
export function getPaymentProvider(): PaymentProvider {
  const id = (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase();
  switch (id) {
    case "iyzico":
      return new IyzicoProvider();
    case "paytr":
      return new PaytrProvider();
    case "mock":
    default:
      return new MockPaymentProvider();
  }
}

/** Gerçek (mock olmayan) bir sağlayıcı aktif mi? */
export function isLivePaymentEnabled(): boolean {
  const id = (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase();
  return id === "iyzico" || id === "paytr";
}
