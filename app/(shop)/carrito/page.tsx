"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCarrito } from "@/lib/store/carrito";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Package } from "lucide-react";

export default function CarritoPage() {
  const { items, quitar, actualizarCantidad, total } = useCarrito();
  const [removiendo, setRemoviendo] = useState<Set<string>>(new Set());

  const handleQuitar = (id: string) => {
    setRemoviendo((prev) => new Set(prev).add(id));
    setTimeout(() => {
      quitar(id);
      setRemoviendo((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }, 220);
  };

  if (!items.length) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center gap-5 text-center">
        <div className="w-20 h-20 rounded-full bg-[#F5F3EE] flex items-center justify-center">
          <ShoppingBag size={32} className="text-[#6B5B52]" />
        </div>
        <div>
          <p className="font-display text-2xl font-semibold text-[#1C0A0A]">Tu carrito está vacío</p>
          <p className="text-[#6B5B52] text-sm mt-1">Agrega productos para continuar</p>
        </div>
        <Link
          href="/productos"
          className="px-6 py-3 bg-[#6a0008] text-white rounded-md text-sm font-bold hover:bg-[#8C1A1A] transition-colors cursor-pointer"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-baseline gap-3 mb-8">
        <h1 className="font-display text-3xl font-semibold text-[#1C0A0A]">Mi carrito</h1>
        <span className="text-sm text-[#6B5B52] font-medium">
          {totalItems} {totalItems === 1 ? "producto" : "productos"}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Lista de items */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {items.map(({ producto, cantidad }) => {
            const saliendo = removiendo.has(producto.id);
            return (
              <div
                key={producto.id}
                className="bg-white rounded-lg shadow-ambient p-4 flex gap-4 items-center motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:ease-out"
                style={{
                  opacity: saliendo ? 0 : 1,
                  transform: saliendo ? "translateX(-8px) scale(0.98)" : "translateX(0) scale(1)",
                }}
              >
                {/* Imagen */}
                <Link href={`/producto/${producto.slug}`} className="flex-shrink-0">
                  <div className="relative w-[72px] h-[72px] rounded-md overflow-hidden bg-neutral-50 ring-1 ring-neutral-100">
                    {producto.imagenes?.[0] && (
                      <Image
                        src={producto.imagenes[0]}
                        alt={producto.nombre}
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                    )}
                  </div>
                </Link>

                {/* Nombre + precio unitario */}
                <div className="flex-1 min-w-0">
                  <Link href={`/producto/${producto.slug}`} className="block">
                    <p className="font-semibold text-sm text-[#1C0A0A] truncate hover:text-[#6a0008] motion-safe:transition-colors">
                      {producto.nombre}
                    </p>
                  </Link>
                  <p className="text-xs text-[#6B5B52] mt-0.5">
                    ${producto.precio_venta.toLocaleString("es-CO")} c/u
                  </p>
                </div>

                {/* Selector de cantidad */}
                <div className="flex items-center rounded-md border border-neutral-200 overflow-hidden flex-shrink-0">
                  <button
                    onClick={() => actualizarCantidad(producto.id, cantidad - 1)}
                    aria-label="Restar"
                    disabled={cantidad <= 1}
                    className="w-9 h-9 flex items-center justify-center hover:bg-neutral-50 motion-safe:transition-colors cursor-pointer text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-neutral-900 select-none">
                    {cantidad}
                  </span>
                  <button
                    onClick={() => actualizarCantidad(producto.id, cantidad + 1)}
                    aria-label="Sumar"
                    className="w-9 h-9 flex items-center justify-center hover:bg-neutral-50 motion-safe:transition-colors cursor-pointer text-neutral-600"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Subtotal */}
                <p className="font-bold text-sm text-[#1C0A0A] w-[4.5rem] text-right flex-shrink-0 tabular-nums">
                  ${(producto.precio_venta * cantidad).toLocaleString("es-CO")}
                </p>

                {/* Eliminar */}
                <button
                  onClick={() => handleQuitar(producto.id)}
                  aria-label="Eliminar producto"
                  className="p-2 text-neutral-300 hover:text-red-500 motion-safe:transition-colors cursor-pointer flex-shrink-0 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Panel de resumen */}
        <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-24 rounded-lg shadow-ambient p-5 flex flex-col gap-4 bg-white">
          <h2 className="font-display text-lg font-semibold text-[#1C0A0A]">Resumen del pedido</h2>

          {/* Desglose por item */}
          <div className="flex flex-col gap-2">
            {items.map(({ producto, cantidad }) => (
              <div key={producto.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-neutral-500 truncate">
                  {producto.nombre.split(" ").slice(0, 4).join(" ")}
                  {cantidad > 1 && (
                    <span className="ml-1 text-xs font-semibold text-neutral-400">×{cantidad}</span>
                  )}
                </span>
                <span className="text-neutral-700 font-medium whitespace-nowrap tabular-nums">
                  ${(producto.precio_venta * cantidad).toLocaleString("es-CO")}
                </span>
              </div>
            ))}
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Envío */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-neutral-500">
              <Package size={14} />
              <span>Envío</span>
            </div>
            <span className="text-[#6a0008] text-xs font-semibold">A coordinar</span>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#1C0A0A]">Total</span>
            <span className="text-xl font-bold text-[#1C0A0A] tabular-nums">
              ${total().toLocaleString("es-CO")}
            </span>
          </div>

          {/* CTA checkout */}
          <Link
            href="/checkout"
            className="w-full py-3.5 bg-[#6a0008] hover:bg-[#8C1A1A] text-white font-bold text-sm rounded-md text-center flex items-center justify-center gap-2 motion-safe:transition-colors active:scale-[0.97] motion-safe:transition-transform cursor-pointer"
          >
            Finalizar compra
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/productos"
            className="w-full py-2 text-[#6B5B52] hover:text-[#6a0008] text-sm font-medium text-center motion-safe:transition-colors cursor-pointer"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
