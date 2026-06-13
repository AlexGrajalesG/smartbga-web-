import crypto from "crypto";

export type WompiTransactionStatus = "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";

export interface WompiTransaction {
  id: string;
  status: WompiTransactionStatus;
  reference: string;
  amount_in_cents: number;
  currency: string;
  payment_method_type: string;
  customer_email: string | null;
  payment_method: Record<string, unknown> | null;
}

function wompiApiBase() {
  return process.env.WOMPI_ENV === "production"
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";
}

export function buildWompiCheckoutUrl(params: {
  reference: string;
  amountInCents: number;
  redirectUrl: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
}): string {
  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY;
  if (!publicKey || !integrityKey) {
    throw new Error("WOMPI_PUBLIC_KEY y WOMPI_INTEGRITY_KEY son obligatorios");
  }

  const integrity = crypto
    .createHash("sha256")
    .update(`${params.reference}${params.amountInCents}COP${integrityKey}`)
    .digest("hex");

  const url = new URL("https://checkout.wompi.co/p/");
  url.searchParams.set("public-key", publicKey);
  url.searchParams.set("currency", "COP");
  url.searchParams.set("amount-in-cents", String(params.amountInCents));
  url.searchParams.set("reference", params.reference);
  url.searchParams.set("signature:integrity", integrity);
  url.searchParams.set("redirect-url", params.redirectUrl);
  if (params.customerEmail) url.searchParams.set("customer-data:email", params.customerEmail);
  if (params.customerName) url.searchParams.set("customer-data:full-name", params.customerName);
  if (params.customerPhone) url.searchParams.set("customer-data:phone-number", params.customerPhone);

  return url.toString();
}

export async function getWompiTransaction(
  transactionId: string
): Promise<WompiTransaction | null> {
  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  if (!privateKey) return null;

  try {
    const res = await fetch(`${wompiApiBase()}/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${privateKey}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as WompiTransaction;
  } catch {
    return null;
  }
}

export function verifyWompiWebhookSignature(
  body: string,
  receivedSignature: string
): boolean {
  const eventsKey = process.env.WOMPI_EVENTS_KEY;
  if (!eventsKey) return false;

  try {
    const payload = JSON.parse(body);
    const { id: eventId, occurred_at, type, data } = payload;
    const txId = data?.transaction?.id ?? "";
    const txStatus = data?.transaction?.status ?? "";
    const txAmount = data?.transaction?.amount_in_cents ?? "";
    const txCurrency = data?.transaction?.currency ?? "";

    const raw = `${eventId}${type}${occurred_at}${txId}${txStatus}${txAmount}${txCurrency}${eventsKey}`;
    const expected = crypto.createHash("sha256").update(raw).digest("hex");
    return expected === receivedSignature;
  } catch {
    return false;
  }
}
