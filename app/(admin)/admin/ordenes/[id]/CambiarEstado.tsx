"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { cambiarEstadoOrden } from "../actions";

type Estado = "pendiente" | "confirmada" | "en_despacho" | "entregada" | "cancelada";

const FLUJO: Record<Estado, { label: string; estado: Estado; color: string }[]> = {
  pendiente:   [
    { estado: "confirmada",  label: "Confirmar pedido",  color: "bg-blue-600 hover:bg-blue-700 text-white" },
    { estado: "cancelada",   label: "Cancelar",          color: "bg-neutral-100 hover:bg-neutral-200 text-neutral-600" },
  ],
  confirmada:  [
    { estado: "en_despacho", label: "Marcar en despacho", color: "bg-violet-600 hover:bg-violet-700 text-white" },
    { estado: "cancelada",   label: "Cancelar",            color: "bg-neutral-100 hover:bg-neutral-200 text-neutral-600" },
  ],
  en_despacho: [
    { estado: "entregada",   label: "Marcar entregada",   color: "bg-green-600 hover:bg-green-700 text-white" },
  ],
  entregada:   [],
  cancelada:   [],
};

export default function CambiarEstado({
  ordenId,
  estadoActual,
}: {
  ordenId: string;
  estadoActual: string;
}) {
  const [pending, startTransition] = useTransition();
  const acciones = FLUJO[estadoActual as Estado] ?? [];

  if (!acciones.length) return null;

  const handleClick = (estado: Estado) => {
    startTransition(async () => {
      await cambiarEstadoOrden(ordenId, estado);
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {pending && <Loader2 size={16} className="animate-spin text-neutral-400" />}
      {acciones.map(({ estado, label, color }) => (
        <button
          key={estado}
          onClick={() => handleClick(estado)}
          disabled={pending}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer ${color}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
