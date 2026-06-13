import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyWompiWebhookSignature } from "@/lib/wompi";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-event-checksum") ?? "";

  if (!verifyWompiWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let payload: {
    event: string;
    data: { transaction: { id: string; status: string; reference: string } };
  };

  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { event, data } = payload;
  if (event !== "transaction.updated") {
    return NextResponse.json({ ok: true });
  }

  const { id: txId, status, reference: ordenId } = data.transaction;

  if (!ordenId || !txId) {
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();

  if (status === "APPROVED") {
    await admin
      .from("ordenes")
      .update({ estado: "confirmada", wompi_transaction_id: txId })
      .eq("id", ordenId)
      .eq("metodo_pago", "wompi");
  } else if (status === "DECLINED" || status === "VOIDED" || status === "ERROR") {
    // Deja el pedido en pendiente — el admin puede gestionarlo manualmente
    await admin
      .from("ordenes")
      .update({ wompi_transaction_id: txId })
      .eq("id", ordenId)
      .eq("metodo_pago", "wompi");
  }

  return NextResponse.json({ ok: true });
}
