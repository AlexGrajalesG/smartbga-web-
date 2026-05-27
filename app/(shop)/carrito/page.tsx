"use client";

import Image from "next/image";
import Link from "next/link";
import { useCarrito } from "@/lib/store/carrito";
import { Trash2 } from "lucide-react";

export default function CarritoPage() {
  const { items, quitar, actualizarCantidad, total } = useCarrito();

  if (!items.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center">
        <p className="text-neutral-400 text-lg">Tu carrito está vacío.</p>
        <Link
          href="/productos"
          className="px-6 py-3 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-700 transition-colors"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Carrito</h1>

      <div className="flex flex-col gap-4">
        {items.map(({ producto, cantidad }) => (
          <div key={producto.id} className="flex gap-4 items-center py-4 border-b border-neutral-100">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0">
              {producto.imagenes?.[0] && (
                <Image
                  src={producto.imagenes[0]}
                  alt={producto.nombre}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{producto.nombre}</p>
              <p className="text-sm text-neutral-500 mt-0.5">
                ${producto.precio.toLocaleString("es-CO")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => actualizarCantidad(producto.id, cantidad - 1)}
                className="w-7 h-7 rounded-lg border border-neutral-200 text-sm font-bold hover:border-neutral-900 transition-colors"
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{cantidad}</span>
              <button
                onClick={() => actualizarCantidad(producto.id, cantidad + 1)}
                className="w-7 h-7 rounded-lg border border-neutral-200 text-sm font-bold hover:border-neutral-900 transition-colors"
              >
                +
              </button>
            </div>

            <p className="font-semibold text-sm w-24 text-right">
              ${(producto.precio * cantidad).toLocaleString("es-CO")}
            </p>

            <button onClick={() => quitar(producto.id)} className="text-neutral-400 hover:text-red-500 transition-colors ml-2">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="flex items-center justify-between w-full md:w-72">
          <span className="text-neutral-500">Total</span>
          <span className="text-xl font-bold">${total().toLocaleString("es-CO")}</span>
        </div>
        <Link
          href="/checkout"
          className="w-full md:w-72 py-3.5 bg-neutral-900 text-white font-semibold text-sm rounded-xl text-center hover:bg-neutral-700 transition-colors"
        >
          Ir al checkout →
        </Link>
      </div>
    </div>
  );
}
