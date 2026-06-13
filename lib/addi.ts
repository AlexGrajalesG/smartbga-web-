// Addi — BNPL (compra ahora, paga después) para Colombia
// Docs: https://addi.com/developers

const ADDI_API = process.env.ADDI_ENV === "production"
  ? "https://api.addi.com"
  : "https://api.addi.com"; // Addi usa las mismas URLs; sandbox es via credenciales test

async function getAddiToken(): Promise<string> {
  const clientId = process.env.ADDI_CLIENT_ID;
  const clientSecret = process.env.ADDI_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("ADDI_CLIENT_ID y ADDI_CLIENT_SECRET son obligatorios");
  }

  const res = await fetch(`${ADDI_API}/oauth/token`, {
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
  cancelUrl: string;
}

export async function createAddiApplication(params: AddiOrderParams): Promise<{ applicationUrl: string; addiOrderId: string }> {
  const token = await getAddiToken();
  const allySlug = process.env.ADDI_ALLY_SLUG;
  if (!allySlug) throw new Error("ADDI_ALLY_SLUG es obligatorio");

  const body = {
    ally_slug: allySlug,
    order: {
      order_id: params.orderId,
      total_amount: params.totalAmount,
      currency: params.currency ?? "COP",
      items: params.items.map((item) => ({
        sku: item.sku,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        tax_amount: 0,
        description: item.description,
        category: "generic",
      })),
    },
    client: {
      first_name: params.customerFirstName,
      last_name: params.customerLastName || params.customerFirstName,
      email: params.customerEmail,
      cellphone: params.customerPhone.replace(/\D/g, "").slice(-10),
      cellphone_country_code: "+57",
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  };

  const res = await fetch(`${ADDI_API}/v1/ally-management/orders`, {
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
  const addiOrderId: string = data.id ?? data.order_id ?? params.orderId;

  return { applicationUrl, addiOrderId };
}
