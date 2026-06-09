"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useCarrito } from "@/lib/store/carrito";
import type { Producto } from "@/types";

export default function BtnCarritoCard({ producto }: { producto: Producto }) {
  const agregar = useCarrito((s) => s.agregar);
  const [agregado, setAgregado] = useState(false);

  const handleAgregar = () => {
    agregar(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  if (producto.stock === 0) {
    return (
      <button disabled className="mt-1 w-full text-xs font-semibold py-2.5 rounded-xl border-2 border-neutral-200 text-neutral-400 opacity-40 cursor-not-allowed">
        Agotado
      </button>
    );
  }

  return (
    <button
      onClick={handleAgregar}
      disabled={agregado}
      className={`mt-1 w-full text-xs font-semibold py-2.5 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
        agregado
          ? "border-green-600 bg-green-600 text-white"
          : "border-[#111111] text-[#111111] hover:bg-[#8C1A1A] hover:border-[#8C1A1A] hover:text-white"
      }`}
    >
      {agregado ? <><Check size={12} strokeWidth={3} /> Agregado</> : "Agregar al carrito"}
    </button>
  );
}
