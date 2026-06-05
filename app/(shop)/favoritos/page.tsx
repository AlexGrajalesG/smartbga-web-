"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/lib/store/wishlist";
import { useCarrito } from "@/lib/store/carrito";
import BotonFavorito from "@/components/productos/BotonFavorito";
import { ShoppingBag, Heart, ArrowRight } from "lucide-react";

export default function FavoritosPage() {
  const items         = useWishlist((s) => s.items);
  const agregarCarrito = useCarrito((s) => s.agregar);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 min-h-[60vh]">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs text-[#8C1A1A] font-bold tracking-widest uppercase mb-2">
          Tu lista
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-[#1C0A0A]">
          Lista de deseos
          {items.length > 0 && (
            <span className="ml-3 text-2xl font-light text-neutral-400">
              ({items.length})
            </span>
          )}
        </h1>
      </div>

      {/* Vacía */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center">
            <Heart size={32} className="text-neutral-300" />
          </div>
          <div>
            <p className="font-semibold text-neutral-800 mb-1">Aún no tienes favoritos</p>
            <p className="text-sm text-neutral-400">
              Guarda los productos que te gusten y cómpralos cuando quieras.
            </p>
          </div>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#8C1A1A] text-white font-semibold rounded-2xl hover:bg-[#6B1313] transition-colors cursor-pointer"
          >
            Explorar productos
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Grid de favoritos */}
      {items.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {items.map((producto) => {
              const tieneDescuento =
                producto.precio_anterior && producto.precio_anterior > producto.precio_venta;
              const imagen = producto.imagenes?.[0] ?? "/placeholder.png";

              return (
                <div key={producto.id} className="group flex flex-col animate-fade-up">
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
                    {tieneDescuento && (
                      <span className="absolute top-2 left-2 bg-[#8C1A1A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        OFERTA
                      </span>
                    )}
                    {producto.stock === 0 && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-sm font-semibold text-neutral-500">Agotado</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
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
                      onClick={() => agregarCarrito(producto)}
                      disabled={producto.stock === 0}
                      className="mt-1 w-full text-xs font-semibold py-2.5 rounded-xl border-2 border-[#111111] text-[#111111] hover:bg-[#8C1A1A] hover:border-[#8C1A1A] hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag size={13} strokeWidth={2} />
                      {producto.stock === 0 ? "Agotado" : "Agregar al carrito"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA mover todo al carrito */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
            <div>
              <p className="font-semibold text-neutral-900">
                {items.length} producto{items.length !== 1 ? "s" : ""} guardado{items.length !== 1 ? "s" : ""}
              </p>
              <p className="text-sm text-neutral-500">Agrégalos al carrito para comprarlos ahora.</p>
            </div>
            <button
              onClick={() => items.forEach((p) => p.stock > 0 && agregarCarrito(p))}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#8C1A1A] text-white font-semibold rounded-2xl hover:bg-[#6B1313] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap shadow-lg shadow-[#8C1A1A]/20"
            >
              <ShoppingBag size={17} />
              Agregar todo al carrito
            </button>
          </div>
        </>
      )}
    </div>
  );
}
