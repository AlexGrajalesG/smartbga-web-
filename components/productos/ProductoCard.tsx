"use client";

import Image from "next/image";
import Link from "next/link";
import type { Producto } from "@/types";
import { useCarrito } from "@/lib/store/carrito";
import BotonFavorito from "./BotonFavorito";

export default function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCarrito((s) => s.agregar);
  const imagen = producto.imagenes?.[0] ?? "/placeholder.png";
  const tieneDescuento = producto.precio_anterior && producto.precio_anterior > producto.precio_venta;

  return (
    <div className="group flex flex-col">
      <Link
        href={`/producto/${producto.slug}`}
        className="block overflow-hidden rounded-2xl bg-neutral-50 aspect-square relative ring-1 ring-neutral-100 group-hover:ring-[#8C1A1A]/40 transition-all duration-300"
      >
        <Image
          src={imagen}
          alt={producto.nombre}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        {tieneDescuento && (
          <span className="absolute top-2 left-2 bg-[#8C1A1A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
            OFERTA
          </span>
        )}
        {producto.stock === 0 && (
          <span className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center text-sm font-semibold text-neutral-500">
            Agotado
          </span>
        )}
        {producto.stock > 0 && producto.stock <= 5 && (
          <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            Últimos {producto.stock}
          </span>
        )}

        {/* Botón favorito */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <BotonFavorito producto={producto} size="sm" />
        </div>
      </Link>

      <div className="mt-3 flex flex-col gap-1.5">
        <Link
          href={`/producto/${producto.slug}`}
          className="text-sm font-medium text-neutral-800 hover:text-[#8C1A1A] transition-colors line-clamp-2 leading-snug"
        >
          {producto.nombre}
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-900">
            ${producto.precio_venta.toLocaleString("es-CO")}
          </span>
          {tieneDescuento && (
            <span className="text-xs text-neutral-400 line-through">
              ${producto.precio_anterior!.toLocaleString("es-CO")}
            </span>
          )}
        </div>

        <button
          onClick={() => agregar(producto)}
          disabled={producto.stock === 0}
          className="mt-1 w-full text-xs font-semibold py-2.5 rounded-xl border-2 border-[#111111] text-[#111111] hover:bg-[#8C1A1A] hover:border-[#8C1A1A] hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {producto.stock === 0 ? "Agotado" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}
