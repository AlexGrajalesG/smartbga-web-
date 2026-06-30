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
    data: { transaction: { id: string; status: string; reference: string; amount_in_cents: number } };
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

  const { id: txId, status, reference: ordenId, amount_in_cents } = data.transaction;

  if (!ordenId || !txId) {
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();

  if (status === "APPROVED") {
    // Obtener la orden para validar que el monto pagado coincide con el total esperado
    const { data: orden } = await admin
      .from("ordenes")
      .select("total")
      .eq("id", ordenId)
      .eq("metodo_pago", "wompi")
      .single();

    if (!orden) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    const montoEsperado = Math.round(Number(orden.total)) * 100;
    if (amount_in_cents !== montoEsperado) {
      // Monto no coincide — no confirmar la orden
      console.error(`Wompi monto inválido para orden ${ordenId}: esperado ${montoEsperado}, recibido ${amount_in_cents}`);
      return NextResponse.json({ error: "Monto no coincide" }, { status: 400 });
    }

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
