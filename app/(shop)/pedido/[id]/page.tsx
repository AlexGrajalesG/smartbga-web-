import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ESTADO_ORDEN_LABEL, ESTADO_ORDEN_COLOR, METODO_PAGO_LABEL } from "@/lib/ordenes";
import { CheckCircle2, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

interface ItemConProducto {
  id: string;
  cantidad: number;
  precio_unitario: number;
  producto: { nombre: string; imagenes: string[]; slug: string } | null;
}

export const metadata: Metadata = { title: "Tu pedido — SmartBga" };

export default async function PedidoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/pedido/${id}`);

  const { data: orden } = await supabase
    .from("ordenes")
    .select("*, items:orden_items(*, producto:productos(nombre, imagenes, slug))")
    .eq("id", id)
    .single();

  if (!orden) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex flex-col items-center text-center gap-3 mb-10">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">¡Pedido recibido!</h1>
        <p className="text-sm text-neutral-500 max-w-md">
          Te contactaremos al número que dejaste para confirmar tu pedido y coordinar la entrega.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-5 flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-neutral-400 font-mono">Pedido #{orden.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {new Date(orden.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${ESTADO_ORDEN_COLOR[orden.estado as keyof typeof ESTADO_ORDEN_COLOR] ?? "bg-neutral-100 text-neutral-600"}`}>
            {ESTADO_ORDEN_LABEL[orden.estado as keyof typeof ESTADO_ORDEN_LABEL] ?? orden.estado}
          </span>
        </div>

        <div className="h-px bg-neutral-100" />

        <div className="flex flex-col gap-3">
          {((orden.items ?? []) as ItemConProducto[]).map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0">
                {item.producto?.imagenes?.[0] && (
                  <Image src={item.producto.imagenes[0]} alt={item.producto.nombre} fill className="object-cover" sizes="56px" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {item.producto?.slug ? (
                  <Link href={`/producto/${item.producto.slug}`} className="text-sm font-medium text-neutral-800 hover:text-[#8C1A1A] transition-colors truncate block">
                    {item.producto.nombre}
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-neutral-800 truncate">{item.producto?.nombre ?? "Producto"}</p>
                )}
                <p className="text-xs text-neutral-400">Cantidad: {item.cantidad} · ${item.precio_unitario.toLocaleString("es-CO")} c/u</p>
              </div>
              <p className="text-sm font-semibold text-neutral-900 whitespace-nowrap">
                ${(item.precio_unitario * item.cantidad).toLocaleString("es-CO")}
              </p>
            </div>
          ))}
        </div>

        <div className="h-px bg-neutral-100" />

        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-neutral-400">Dirección de envío</dt>
            <dd className="font-medium text-neutral-800">{orden.direccion_envio ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Método de pago</dt>
            <dd className="font-medium text-neutral-800">
              {orden.metodo_pago ? METODO_PAGO_LABEL[orden.metodo_pago as keyof typeof METODO_PAGO_LABEL] ?? orden.metodo_pago : "—"}
            </dd>
          </div>
          {orden.notas && (
            <div className="sm:col-span-2">
              <dt className="text-neutral-400">Notas</dt>
              <dd className="font-medium text-neutral-800">{orden.notas}</dd>
            </div>
          )}
        </dl>

        <div className="h-px bg-neutral-100" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Total</span>
          <span className="text-xl font-bold text-neutral-900">${orden.total.toLocaleString("es-CO")}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
        <Link
          href="/perfil"
          className="px-6 py-3 rounded-xl border-2 border-neutral-200 text-sm font-semibold text-center text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
        >
          Ver mis pedidos
        </Link>
        <Link
          href="/productos"
          className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-[#8C1A1A] hover:bg-[#6B1313] text-white text-sm font-semibold text-center transition-colors"
        >
          Seguir comprando
          <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
}
