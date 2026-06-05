"use client";

import { useState } from "react";
import { useCarrito } from "@/lib/store/carrito";
import { ShoppingBag, Check, Minus, Plus, MessageCircle, Star, Zap } from "lucide-react";
import BotonFavorito from "./BotonFavorito";
import type { Producto } from "@/types";

const GARANTIAS = [
  { label: "Garantía total" },
  { label: "Envío en BGA" },
  { label: "Pago seguro" },
  { label: "Devolución fácil" },
];

export default function PanelCompra({ producto }: { producto: Producto }) {
  const agregar = useCarrito((s) => s.agregar);
  const actualizarCantidad = useCarrito((s) => s.actualizarCantidad);
  const items = useCarrito((s) => s.items);

  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  const enCarrito = items.find((i) => i.producto.id === producto.id);
  const tieneDescuento =
    producto.precio_anterior && producto.precio_anterior > producto.precio_venta;
  const descuentoPct = tieneDescuento
    ? Math.round((1 - producto.precio_venta / producto.precio_anterior!) * 100)
    : null;

  const handleAgregar = () => {
    if (producto.stock === 0) return;
    if (enCarrito) {
      actualizarCantidad(producto.id, enCarrito.cantidad + cantidad);
    } else {
      for (let i = 0; i < cantidad; i++) agregar(producto);
    }
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  };

  const dec = () => setCantidad((c) => Math.max(1, c - 1));
  const inc = () => setCantidad((c) => Math.min(producto.stock, c + 1));

  return (
    <div className="flex flex-col gap-6">

      {/* Categoría */}
      {producto.categoria && (
        <span className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase">
          {producto.categoria.nombre}
        </span>
      )}

      {/* Nombre */}
      <h1 className="text-3xl md:text-4xl font-bold leading-tight text-neutral-900 tracking-tight">
        {producto.nombre}
      </h1>

      {/* Estrellas (social proof estático) */}
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
          ))}
        </div>
        <span className="text-xs text-neutral-400 font-medium">4.9 · 38 reseñas</span>
      </div>

      {/* Precio */}
      <div className="flex items-end gap-3">
        <span className="text-4xl font-black text-neutral-900 tracking-tight">
          ${producto.precio_venta.toLocaleString("es-CO")}
        </span>
        {tieneDescuento && (
          <>
            <span className="text-xl text-neutral-400 line-through mb-0.5">
              ${producto.precio_anterior!.toLocaleString("es-CO")}
            </span>
            <span className="mb-1 text-sm font-bold bg-[#8C1A1A] text-white px-2.5 py-1 rounded-full">
              -{descuentoPct}% OFF
            </span>
          </>
        )}
      </div>

      {/* Urgencia */}
      {producto.stock > 0 && producto.stock <= 10 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Zap size={14} className="text-amber-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-700">
            ¡Últimas {producto.stock} unidades disponibles!
          </span>
        </div>
      )}

      {/* Separador */}
      <div className="h-px bg-neutral-100" />

      {/* Selector de cantidad + botón */}
      {producto.stock > 0 ? (
        <div className="flex flex-col gap-3">
          {/* Cantidad */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-600">Cantidad</span>
            <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden">
              <button
                onClick={dec}
                aria-label="Restar"
                className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer text-neutral-600 disabled:opacity-30"
                disabled={cantidad <= 1}
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-semibold text-neutral-900">
                {cantidad}
              </span>
              <button
                onClick={inc}
                aria-label="Sumar"
                className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer text-neutral-600 disabled:opacity-30"
                disabled={cantidad >= producto.stock}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Botón agregar */}
          <button
            onClick={handleAgregar}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer active:scale-[0.97] shadow-lg ${
              agregado
                ? "bg-green-600 text-white shadow-green-200"
                : "bg-[#8C1A1A] hover:bg-[#6B1313] text-white shadow-[#8C1A1A]/20 hover:shadow-[#8C1A1A]/30"
            }`}
          >
            {agregado ? (
              <>
                <Check size={20} strokeWidth={2.5} />
                ¡Agregado al carrito!
              </>
            ) : (
              <>
                <ShoppingBag size={20} strokeWidth={2} />
                Agregar al carrito
              </>
            )}
          </button>

          {/* Botón Instagram + Favorito */}
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/smart.bga"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 rounded-2xl border-2 border-neutral-200 text-sm font-semibold text-center flex items-center justify-center gap-2.5 hover:border-[#8C1A1A] hover:text-[#8C1A1A] transition-all duration-200 cursor-pointer text-neutral-700"
            >
              <MessageCircle size={17} strokeWidth={2} />
              Consultar por Instagram
            </a>
            <BotonFavorito producto={producto} size="md" />
          </div>
        </div>
      ) : (
        <button
          disabled
          className="w-full py-4 rounded-2xl bg-neutral-100 text-neutral-400 font-bold text-base cursor-not-allowed"
        >
          Producto agotado
        </button>
      )}

      {/* Garantías */}
      <div className="grid grid-cols-2 gap-2">
        {GARANTIAS.map(({ label }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 rounded-xl px-3 py-2.5 border border-neutral-100"
          >
            <Check size={12} className="text-[#8C1A1A] flex-shrink-0" strokeWidth={2.5} />
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Texto confianza */}
      <p className="text-xs text-neutral-400 text-center leading-relaxed">
        Producto verificado · SmartBga lleva más de <strong className="text-neutral-500">6 años</strong> seleccionando calidad para Bucaramanga.
      </p>
    </div>
  );
}
