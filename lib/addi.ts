// Addi — BNPL (compra ahora, paga después) para Colombia

function addiAuthUrl() {
  return process.env.ADDI_ENV === "production"
    ? "https://auth.addi.com"
    : "https://auth.addi-staging.com";
}

function addiApiUrl() {
  return process.env.ADDI_ENV === "production"
    ? "https://api.addi.com"
    : "https://api.addi-staging.com";
}

async function getAddiToken(): Promise<string> {
  const clientId = process.env.ADDI_CLIENT_ID;
  const clientSecret = process.env.ADDI_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("ADDI_CLIENT_ID y ADDI_CLIENT_SECRET son obligatorios");
  }

  const res = await fetch(`${addiAuthUrl()}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Addi auth error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.access_token as string;
}

export interface AddiOrderParams {
  orderId: string;
  totalAmount: number;
  currency?: string;
  items: { sku: string; unitPrice: number; quantity: number; description: string }[];
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  successUrl: string;
  declinedUrl: string;
  canceledUrl: string;
}

export async function createAddiApplication(params: AddiOrderParams): Promise<{ applicationUrl: string; addiOrderId: string }> {
  const token = await getAddiToken();
  const allySlug = process.env.ADDI_ALLY_SLUG;
  if (!allySlug) throw new Error("ADDI_ALLY_SLUG es obligatorio");

  const body = {
    allySlug,
    orderId: params.orderId,
    totalAmount: params.totalAmount,
    currency: params.currency ?? "COP",
    items: params.items.map((item) => ({
      sku: item.sku,
      name: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    client: {
      firstName: params.customerFirstName,
      lastName: params.customerLastName || params.customerFirstName,
      email: params.customerEmail,
      cellPhone: params.customerPhone.replace(/\D/g, "").slice(-10),
    },
    urls: {
      successUrl: params.successUrl,
      declinedUrl: params.declinedUrl,
      canceledUrl: params.canceledUrl,
    },
  };

  const res = await fetch(`${addiApiUrl()}/api/v1/credit-applications`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Addi order error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const applicationUrl: string = data.applicationUrl ?? data.application_url ?? data.url ?? "";
  const addiOrderId: string = data.id ?? data.orderId ?? params.orderId;

  return { applicationUrl, addiOrderId };
}
