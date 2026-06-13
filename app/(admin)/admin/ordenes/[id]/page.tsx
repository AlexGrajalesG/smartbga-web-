import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { ArrowLeft, Phone, Mail, MapPin, Package } from "lucide-react";
import CambiarEstado from "./CambiarEstado";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Detalle de orden — Admin SmartBga" };

const BADGE: Record<string, string> = {
  pendiente:   "bg-amber-100 text-amber-700 border-amber-200",
  confirmada:  "bg-blue-100 text-blue-700 border-blue-200",
  en_despacho: "bg-violet-100 text-violet-700 border-violet-200",
  entregada:   "bg-green-100 text-green-700 border-green-200",
  cancelada:   "bg-neutral-100 text-neutral-500 border-neutral-200",
};

const METODO: Record<string, string> = {
  efectivo:        "Contraentrega (efectivo)",
  transferencia:   "Transferencia o PSE",
  addi:            "Addi — paga después",
  addi_presencial: "Addi presencial",
  sistecredito:    "Sistecrédito — paga después",
  wompi:           "Tarjeta / PSE / Nequi (Wompi)",
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Bogota",
  });
}

export default async function OrdenDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: orden } = await admin
    .from("ordenes")
    .select(`
      *,
      usuarios(nombre, email, celular),
      orden_items(
        id, cantidad, precio_unitario, precio_costo,
        productos(nombre, imagenes)
      )
    `)
    .eq("id", id)
    .single();

  if (!orden) notFound();

  const usuario = Array.isArray(orden.usuarios) ? orden.usuarios[0] : orden.usuarios;
  const items   = Array.isArray(orden.orden_items) ? orden.orden_items : [];

  // Intentar extraer celular de contacto de la dirección si el usuario no tiene
  const celularDir = orden.direccion_envio?.match(/Contacto:\s*([\d\s]+)/)?.[1]?.trim();
  const celular = (usuario as { celular?: string } | null)?.celular ?? celularDir ?? null;
  const waLink = celular
    ? `https://wa.me/57${celular.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola! Te contactamos por tu pedido #${id.slice(0, 6)} en SmartBga.`)}`
    : null;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/admin/ordenes"
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors mb-3 cursor-pointer"
          >
            <ArrowLeft size={14} />
            Órdenes
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-neutral-900">
              Orden <span className="font-mono text-lg">#{id.slice(0, 8)}</span>
            </h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wide ${BADGE[orden.estado] ?? ""}`}>
              {orden.estado.replace("_", " ")}
            </span>
          </div>
          <p className="text-sm text-neutral-400 mt-1">{formatFecha(orden.created_at)}</p>
        </div>

        <CambiarEstado ordenId={id} estadoActual={orden.estado} />
      </div>

      {/* Grid: info + cliente */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Info del pedido */}
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5 flex flex-col gap-3">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Pedido</p>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Canal</span>
              <span className="font-medium capitalize">{orden.canal}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Método de pago</span>
              <span className="font-medium text-right">{METODO[orden.metodo_pago ?? ""] ?? orden.metodo_pago ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Total</span>
              <span className="font-bold text-neutral-900 tabular-nums">
                ${Number(orden.total).toLocaleString("es-CO")}
              </span>
            </div>
            {orden.notas && (
              <div className="pt-1 border-t border-neutral-200">
                <p className="text-neutral-400 text-xs mb-0.5">Notas</p>
                <p className="text-neutral-700 text-xs leading-relaxed">{orden.notas}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cliente */}
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5 flex flex-col gap-3">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Cliente</p>
          <div className="flex flex-col gap-2.5">
            <p className="font-semibold text-neutral-900">
              {(usuario as { nombre?: string } | null)?.nombre ?? "—"}
            </p>
            {celular && (
              <a
                href={waLink ?? `tel:${celular}`}
                target={waLink ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-green-600 transition-colors cursor-pointer"
              >
                <Phone size={14} />
                {celular}
                {waLink && <span className="text-xs text-green-600 font-semibold ml-1">WhatsApp →</span>}
              </a>
            )}
            {(usuario as { email?: string } | null)?.email && (
              <a
                href={`mailto:${(usuario as { email?: string }).email}`}
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-[#8C1A1A] transition-colors cursor-pointer"
              >
                <Mail size={14} />
                {(usuario as { email?: string }).email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Dirección */}
      {orden.direccion_envio && (
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5 flex gap-3">
          <MapPin size={16} className="text-[#8C1A1A] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-1">Dirección de entrega</p>
            <p className="text-sm text-neutral-700 leading-relaxed">{orden.direccion_envio}</p>
          </div>
        </div>
      )}

      {/* Productos */}
      <div className="rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-neutral-100 bg-neutral-50">
          <Package size={15} className="text-neutral-400" />
          <p className="text-sm font-semibold text-neutral-700">
            Productos · {items.length} {items.length === 1 ? "ítem" : "ítems"}
          </p>
        </div>

        <div className="divide-y divide-neutral-100">
          {(items as Array<{ id: string; cantidad: number; precio_unitario: number; productos: unknown }>).map((item) => {
            const prod = Array.isArray(item.productos) ? item.productos[0] : item.productos;
            const subtotal = Number(item.precio_unitario) * item.cantidad;
            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {(prod as { nombre?: string } | null)?.nombre ?? "Producto eliminado"}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {item.cantidad} × ${Number(item.precio_unitario).toLocaleString("es-CO")}
                  </p>
                </div>
                <p className="text-sm font-semibold text-neutral-900 tabular-nums whitespace-nowrap">
                  ${subtotal.toLocaleString("es-CO")}
                </p>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-neutral-200 bg-neutral-50">
          <span className="text-sm text-neutral-500">Total del pedido</span>
          <span className="text-lg font-bold text-neutral-900 tabular-nums">
            ${Number(orden.total).toLocaleString("es-CO")}
          </span>
        </div>
      </div>
    </div>
  );
}
