"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cambiarEstadoProducto } from "@/app/(admin)/admin/productos/actions";

export default function BotonEstadoProducto({ productoId, activo }: { productoId: string; activo: boolean }) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();

  const alternar = () => {
    startTransition(async () => {
      await cambiarEstadoProducto(productoId, !activo);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={pendiente}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
        activo
          ? "bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-700"
          : "bg-neutral-100 text-neutral-500 hover:bg-green-50 hover:text-green-700"
      }`}
    >
      {pendiente && <Loader2 size={12} className="animate-spin" />}
      {activo ? "Activo" : "Archivado"}
    </button>
  );
}
