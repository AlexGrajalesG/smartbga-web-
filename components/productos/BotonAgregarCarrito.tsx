"use client";

import { useCarrito } from "@/lib/store/carrito";
import type { Producto } from "@/types";

export default function BotonAgregarCarrito({ producto }: { producto: Producto }) {
  const agregar = useCarrito((s) => s.agregar);

  return (
    <button
      onClick={() => agregar(producto)}
      disabled={producto.stock === 0}
      className="w-full py-3.5 rounded-xl bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {producto.stock === 0 ? "Agotado" : "Agregar al carrito"}
    </button>
  );
}
