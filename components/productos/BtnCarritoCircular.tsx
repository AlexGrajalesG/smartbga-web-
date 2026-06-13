"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCarrito } from "@/lib/store/carrito";
import type { Producto } from "@/types";

export default function BtnCarritoCircular({ producto }: { producto: Producto }) {
  const agregar = useCarrito((s) => s.agregar);
  const [agregado, setAgregado] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (producto.stock === 0) return;
    agregar(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={producto.stock === 0}
      aria-label="Agregar al carrito"
      className={`flex items-center justify-center w-12 h-12 rounded-full transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
        agregado ? "bg-green-600 text-white" : "bg-white text-[#1C0A0A] hover:bg-[#F9F7F2]"
      }`}
    >
      {agregado ? <Check size={20} strokeWidth={2.5} /> : <ShoppingCart size={20} />}
    </button>
  );
}
