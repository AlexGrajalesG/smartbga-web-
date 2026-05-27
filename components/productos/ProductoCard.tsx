"use client";

import Image from "next/image";
import Link from "next/link";
import type { Producto } from "@/types";
import { useCarrito } from "@/lib/store/carrito";

export default function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCarrito((s) => s.agregar);
  const imagen = producto.imagenes?.[0] ?? "/placeholder.png";
  const tieneDescuento = producto.precio_anterior && producto.precio_anterior > producto.precio;

  return (
    <div className="group flex flex-col">
      <Link href={`/producto/${producto.slug}`} className="block overflow-hidden rounded-xl bg-neutral-50 aspect-square relative">
        <Image
          src={imagen}
          alt={producto.nombre}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {tieneDescuento && (
          <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            OFERTA
          </span>
        )}
        {producto.stock === 0 && (
          <span className="absolute inset-0 bg-white/60 flex items-center justify-center text-sm font-medium text-neutral-500">
            Agotado
          </span>
        )}
      </Link>

      <div className="mt-3 flex flex-col gap-1">
        <Link href={`/producto/${producto.slug}`} className="text-sm font-medium hover:underline line-clamp-2">
          {producto.nombre}
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            ${producto.precio.toLocaleString("es-CO")}
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
          className="mt-2 w-full text-xs font-semibold py-2 rounded-lg border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {producto.stock === 0 ? "Agotado" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}
