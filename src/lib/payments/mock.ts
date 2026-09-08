import { randomUUID } from "crypto";
import type {
  CheckoutRequest,
  CheckoutResult,
  PaymentProvider,
  VerifyResult,
} from "./types";

/**
 * Test/geliştirme sağlayıcısı — tahsilatı anında başarılı sayar.
 * PAYMENT_PROVIDER tanımlı değilken varsayılan budur.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly id = "mock";

  async createCheckout(_req: CheckoutRequest): Promise<CheckoutResult> {
    return { status: "paid", reference: `mock_${randomUUID()}` };
  }

  async verify(reference: string): Promise<VerifyResult> {
    return { paid: true, reference };
  }
}
