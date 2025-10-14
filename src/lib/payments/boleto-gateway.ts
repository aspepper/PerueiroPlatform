/**
 * Boleto payment integration primitives.
 *
 * The real gateway implementation will be plugged in at runtime by calling
 * {@link registerBoletoGateway}. Until then, the helper functions exposed here
 * provide a consistent contract for issuing boletos for existing payments and
 * verifying their settlement status with the financial institution.
 */

export type BoletoStatus =
  | "PENDING"
  | "ISSUED"
  | "REGISTERED"
  | "PAID"
  | "CANCELED"
  | "EXPIRED";

export type PaymentBoletoReference = {
  /** Primary key of the payment in our database. */
  paymentId: bigint;
  /** Identifier returned by the financial institution for the boleto. */
  boletoId: string;
};

export type IssueBoletoRequest = {
  payment: {
    id: bigint;
    /** Value expected by the gateway, expressed in cents. */
    amountCents: number;
    description?: string | null;
    dueDate: Date;
  };
  payer: {
    name: string;
    /** CPF or CNPJ stripped of special characters. */
    document: string;
    email?: string | null;
    phone?: string | null;
  };
  metadata?: Record<string, unknown>;
};

export type IssueBoletoResponse = PaymentBoletoReference & {
  status: BoletoStatus;
  /** Digitable line returned by the gateway (linha digitável). */
  digitableLine?: string | null;
  /** Numeric barcode representation, when available. */
  barcode?: string | null;
  /** Download URL (usually PDF) provided by the gateway. */
  pdfUrl?: string | null;
  /** Optional HTML link for rendering the boleto directly. */
  viewUrl?: string | null;
  issuedAt: Date;
  expiresAt: Date;
  /** Raw payload returned by the provider, useful for auditing/debugging. */
  raw?: unknown;
};

export type VerifyBoletoResponse = PaymentBoletoReference & {
  status: BoletoStatus;
  /**
   * Timestamp reported by the gateway when the boleto was settled.
   * May be `null` while the boleto is still pending.
   */
  paidAt: Date | null;
  /** Raw payload from the provider, to aid troubleshooting future integrations. */
  raw?: unknown;
};

export interface BoletoGateway {
  issueBoleto(request: IssueBoletoRequest): Promise<IssueBoletoResponse>;
  fetchStatus(reference: PaymentBoletoReference): Promise<VerifyBoletoResponse>;
}

let activeGateway: BoletoGateway | null = null;

export class MissingBoletoGatewayError extends Error {
  constructor() {
    super(
      "Nenhum gateway de boletos foi configurado. Utilize registerBoletoGateway para ativar uma integração.",
    );
    this.name = "MissingBoletoGatewayError";
  }
}

export function registerBoletoGateway(gateway: BoletoGateway | null) {
  activeGateway = gateway;
}

export function hasRegisteredBoletoGateway() {
  return activeGateway !== null;
}

function ensureGateway(): BoletoGateway {
  if (!activeGateway) {
    throw new MissingBoletoGatewayError();
  }

  return activeGateway;
}

export async function generatePaymentBoleto(
  request: IssueBoletoRequest,
): Promise<IssueBoletoResponse> {
  const gateway = ensureGateway();
  return gateway.issueBoleto(request);
}

export async function verifyPaymentBoleto(
  reference: PaymentBoletoReference,
): Promise<VerifyBoletoResponse> {
  const gateway = ensureGateway();
  return gateway.fetchStatus(reference);
}
