import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { ArrowRight, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Órdenes — Admin SmartBga" };

const ESTADOS = [
  { key: "",            label: "Todas"       },
  { key: "pendiente",   label: "Pendiente"   },
  { key: "confirmada",  label: "Confirmada"  },
  { key: "en_despacho", label: "En despacho" },
  { key: "entregada",   label: "Entregada"   },
  { key: "cancelada",   label: "Cancelada"   },
];

const BADGE: Record<string, string> = {
  pendiente:   "bg-amber-100 text-amber-700",
  confirmada:  "bg-blue-100 text-blue-700",
  en_despacho: "bg-violet-100 text-violet-700",
  entregada:   "bg-green-100 text-green-700",
  cancelada:   "bg-neutral-100 text-neutral-500",
};

const METODO: Record<string, string> = {
  efectivo:       "Contraentrega",
  transferencia:  "Transferencia",
  addi:           "Addi",
  addi_presencial:"Addi presencial",
  sistecredito:   "Sistecrédito",
  wompi:          "Wompi",
};

function tiempoRelativo(fecha: string) {
  const diff = Date.now() - new Date(fecha).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 60)  return `hace ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24)    return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export default async function OrdenesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado: filtro = "" } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("ordenes")
    .select("id, estado, total, metodo_pago, canal, created_at, usuarios(nombre, celular)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (filtro) query = query.eq("estado", filtro);

  const { data: ordenes } = await query;

  // conteo por estado para badges del filtro
  const { data: conteos } = await admin
    .from("ordenes")
    .select("estado");
  const porEstado = (conteos ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.estado] = (acc[o.estado] ?? 0) + 1;
    return acc;
  }, {});
  const total = conteos?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Cabecera */}
      <div>
        <p className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase mb-1">Ventas online</p>
        <h1 className="text-3xl font-bold text-neutral-900">Órdenes</h1>
      </div>

      {/* Filtros por estado */}
      <div className="flex gap-2 flex-wrap">
        {ESTADOS.map(({ key, label }) => {
          const count = key ? (porEstado[key] ?? 0) : total;
          const activo = filtro === key;
          return (
            <Link
              key={key}
              href={key ? `/admin/ordenes?estado=${key}` : "/admin/ordenes"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activo
                  ? "bg-[#8C1A1A] text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activo ? "bg-white/20 text-white" : "bg-white text-neutral-500"}`}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Lista */}
      {!ordenes?.length ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
            <ShoppingBag size={28} className="text-neutral-400" />
          </div>
          <p className="text-neutral-500 text-sm">
            {filtro ? `No hay órdenes con estado "${filtro}"` : "Aún no hay órdenes"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {ordenes.map((orden) => {
            const usuario = Array.isArray(orden.usuarios) ? orden.usuarios[0] : orden.usuarios;
            return (
              <Link
                key={orden.id}
                href={`/admin/ordenes/${orden.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 border border-neutral-100 hover:border-[#8C1A1A]/30 hover:shadow-sm transition-all cursor-pointer group"
              >
                {/* ID corto */}
                <span className="text-xs font-mono text-neutral-400 w-16 flex-shrink-0">
                  #{orden.id.slice(0, 6)}
                </span>

                {/* Cliente */}
                <span className="flex-1 min-w-0 text-sm font-semibold text-neutral-800 truncate">
                  {(usuario as { nombre?: string } | null)?.nombre ?? "—"}
                </span>

                {/* Estado */}
                <span className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${BADGE[orden.estado] ?? ""}`}>
                  {orden.estado.replace("_", " ")}
                </span>

                {/* Método */}
                <span className="hidden sm:block flex-shrink-0 text-xs text-neutral-400 w-28 text-right">
                  {METODO[orden.metodo_pago ?? ""] ?? orden.metodo_pago ?? "—"}
                </span>

                {/* Total */}
                <span className="flex-shrink-0 text-sm font-bold text-neutral-900 w-24 text-right tabular-nums">
                  ${Number(orden.total).toLocaleString("es-CO")}
                </span>

                {/* Tiempo */}
                <span className="hidden md:block flex-shrink-0 text-xs text-neutral-400 w-16 text-right">
                  {tiempoRelativo(orden.created_at)}
                </span>

                <ArrowRight size={15} className="flex-shrink-0 text-neutral-300 group-hover:text-[#8C1A1A] transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
