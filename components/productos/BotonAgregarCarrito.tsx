"use client";

import { useState } from "react";
import { useCarrito } from "@/lib/store/carrito";
import { ShoppingBag, Check } from "lucide-react";
import type { Producto } from "@/types";

export default function BotonAgregarCarrito({ producto }: { producto: Producto }) {
  const agregar = useCarrito((s) => s.agregar);
  const [agregado, setAgregado] = useState(false);

  const handleClick = () => {
    agregar(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  if (producto.stock === 0) {
    return (
      <button
        disabled
        className="w-full py-4 rounded-xl bg-neutral-100 text-neutral-400 font-semibold text-sm cursor-not-allowed"
      >
        Agotado
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full py-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.97] ${
        agregado
          ? "bg-green-600 text-white"
          : "bg-[#8C1A1A] hover:bg-[#6B1313] text-white shadow-md hover:shadow-lg active:shadow-sm"
      }`}
    >
      {agregado ? (
        <>
          <Check size={17} strokeWidth={2.5} />
          Agregado al carrito
        </>
      ) : (
        <>
          <ShoppingBag size={17} strokeWidth={2} />
          Agregar al carrito
        </>
      )}
    </button>
  );
}
