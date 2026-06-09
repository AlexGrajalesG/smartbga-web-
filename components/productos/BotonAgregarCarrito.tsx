"use client";

import { useState } from "react";
import { useCarrito } from "@/lib/store/carrito";
import { useNotificacionCarrito } from "@/lib/store/notificacion-carrito";
import { ShoppingBag, Check } from "lucide-react";
import type { Producto } from "@/types";

export default function BotonAgregarCarrito({ producto }: { producto: Producto }) {
  const agregar = useCarrito((s) => s.agregar);
  const mostrar = useNotificacionCarrito((s) => s.mostrar);
  const [agregado, setAgregado] = useState(false);

  const handleClick = () => {
    agregar(producto);
    mostrar(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2200);
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
      className={`w-full py-4 rounded-xl font-semibold text-sm cursor-pointer active:scale-[0.97] relative overflow-hidden motion-safe:transition-[background-color,box-shadow] motion-safe:duration-300 ${
        agregado
          ? "bg-green-600 text-white shadow-md shadow-green-200"
          : "bg-[#8C1A1A] hover:bg-[#6B1313] text-white shadow-md hover:shadow-lg shadow-[#8C1A1A]/20"
      }`}
    >
      <span
        className="absolute inset-0 flex items-center justify-center gap-2.5 motion-safe:transition-[opacity,filter,transform] motion-safe:duration-200"
        style={{
          opacity: agregado ? 0 : 1,
          filter: agregado ? "blur(4px)" : "blur(0px)",
          transform: agregado ? "scale(0.85)" : "scale(1)",
        }}
        aria-hidden={agregado}
      >
        <ShoppingBag size={17} strokeWidth={2} />
        Agregar al carrito
      </span>

      <span
        className="absolute inset-0 flex items-center justify-center gap-2.5 motion-safe:transition-[opacity,filter,transform] motion-safe:duration-200"
        style={{
          opacity: agregado ? 1 : 0,
          filter: agregado ? "blur(0px)" : "blur(4px)",
          transform: agregado ? "scale(1)" : "scale(0.85)",
        }}
        aria-hidden={!agregado}
      >
        <Check size={17} strokeWidth={2.5} />
        ¡Agregado!
      </span>

      <span className="invisible flex items-center justify-center gap-2.5" aria-hidden>
        <ShoppingBag size={17} strokeWidth={2} />
        Agregar al carrito
      </span>
    </button>
  );
}
