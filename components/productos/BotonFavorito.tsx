"use client";

import { useState, useEffect } from "react";
import { useWishlist } from "@/lib/store/wishlist";
import type { Producto } from "@/types";
import { Heart } from "lucide-react";

interface Props {
  producto: Producto;
  size?: "sm" | "md";
  className?: string;
}

export default function BotonFavorito({ producto, size = "sm", className = "" }: Props) {
  const toggle = useWishlist((s) => s.toggle);
  const favoritoGuardado = useWishlist((s) => s.esFavorito(producto.id));

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // En SSR el wishlist (persistido en localStorage) siempre esta vacio —
  // se fuerza "no favorito" hasta hidratar para evitar el mismatch.
  const esFavorito = mounted && favoritoGuardado;

  const dim = size === "sm" ? 16 : 20;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(producto);
      }}
      aria-label={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`group flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer active:scale-90 ${
        size === "sm"
          ? "w-8 h-8 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white"
          : "w-10 h-10 border border-neutral-200 hover:border-[#8C1A1A] hover:bg-red-50"
      } ${className}`}
    >
      <Heart
        size={dim}
        strokeWidth={2}
        className={`transition-all duration-200 ${
          esFavorito
            ? "fill-[#8C1A1A] text-[#8C1A1A] scale-110"
            : "text-neutral-400 group-hover:text-[#8C1A1A]"
        }`}
      />
    </button>
  );
}
