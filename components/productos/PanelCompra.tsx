"use client";

import { useState } from "react";
import { useCarrito } from "@/lib/store/carrito";
import { useNotificacionCarrito } from "@/lib/store/notificacion-carrito";
import { ShoppingBag, Check, Minus, Plus, MessageCircle, Star, Zap, Wallet } from "lucide-react";
import BotonFavorito from "./BotonFavorito";
import type { Producto, NivelPrecio } from "@/types";

const GARANTIAS = [
  { label: "Garantía total" },
  { label: "Envío en BGA" },
  { label: "Pago seguro" },
  { label: "Devolución fácil" },
];

const NIVELES_PRECIO: { key: NivelPrecio; label: string; nota: string }[] = [
  { key: "contraentrega", label: "Contraentrega", nota: "Efectivo o transferencia al recibir" },
  { key: "tarjeta", label: "Tarjeta o PSE", nota: "Pago en línea seguro" },
  { key: "addi", label: "Addi", nota: "Llévatelo hoy y paga después · sin cuota inicial" },
  { key: "sistecredito", label: "Sistecrédito", nota: "Llévatelo hoy y paga después · sin cuota inicial" },
];

export default function PanelCompra({ producto }: { producto: Producto }) {
  const agregar = useCarrito((s) => s.agregar);
  const actualizarCantidad = useCarrito((s) => s.actualizarCantidad);
  const items = useCarrito((s) => s.items);
  const mostrarNotificacion = useNotificacionCarrito((s) => s.mostrar);

  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<NivelPrecio | null>(null);

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
    mostrarNotificacion(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  };

  const dec = () => setCantidad((c) => Math.max(1, c - 1));
  const inc = () => setCantidad((c) => Math.min(producto.stock, c + 1));

  return (
    <div className="flex flex-col gap-6">

      {/* Categoría */}
      {producto.categoria && (
        <span className="text-xs font-bold tracking-widest text-[#6a0008] uppercase">
          {producto.categoria.nombre}
        </span>
      )}

      {/* Nombre */}
      <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight text-[#1C0A0A] tracking-tight">
        {producto.nombre}
      </h1>

      {/* Estrellas (social proof estático) */}
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
          ))}
        </div>
        <span className="text-xs text-[#6B5B52] font-medium">4.9 · 38 reseñas</span>
      </div>

      {/* Precio */}
      <div className="flex items-end gap-3">
        <span className="text-4xl font-black text-[#1C0A0A] tracking-tight">
          ${producto.precio_venta.toLocaleString("es-CO")}
        </span>
        {tieneDescuento && (
          <>
            <span className="text-xl text-[#6B5B52] line-through mb-0.5">
              ${producto.precio_anterior!.toLocaleString("es-CO")}
            </span>
            <span className="mb-1 text-sm font-bold bg-[#6a0008] text-white px-2.5 py-1 rounded-full">
              -{descuentoPct}% OFF
            </span>
          </>
        )}
      </div>

      {/* Desglose de precios por método de pago */}
      {producto.precios && Object.keys(producto.precios).length > 0 && (() => {
        const disponibles = NIVELES_PRECIO
          .map(({ key, label, nota }) => ({ key, label, nota, precio: producto.precios?.[key] }))
          .filter(
            (n): n is { key: NivelPrecio; label: string; nota: string; precio: number } =>
              n.precio != null
          )
          .sort((a, b) => a.precio - b.precio);

        if (disponibles.length === 0) return null;

        // Anclar el ahorro contra la opcion mas costosa hace que el precio de
        // contado se sienta como una ganancia concreta, no solo "el mas barato".
        const masBarato = disponibles[0];
        const masCaro = disponibles[disponibles.length - 1];
        const ahorro = masCaro.precio - masBarato.precio;
        const activo = disponibles.find((d) => d.key === metodoSeleccionado) ?? masBarato;
        const subtotal = activo.precio * cantidad;

        return (
          <div className="rounded-lg bg-[#F5F3EE] overflow-hidden">
            <div className="flex items-center gap-2 px-4 pt-3.5 pb-1">
              <Wallet size={14} className="text-[#6a0008]" />
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
                Elige tu método de pago
              </span>
            </div>
            <div className="flex flex-col">
              {disponibles.map(({ key, label, nota, precio }, i) => {
                const esMasBarato = key === masBarato.key && ahorro > 0;
                const esActivo = key === activo.key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMetodoSeleccionado(key)}
                    aria-pressed={esActivo}
                    className={`flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                      i !== disponibles.length - 1 ? "border-b border-neutral-200/70" : ""
                    } ${esActivo ? "bg-[#6a0008]/[0.06]" : esMasBarato ? "bg-[#6a0008]/[0.04]" : "hover:bg-neutral-100/70"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          esActivo ? "border-[#6a0008]" : "border-neutral-300"
                        }`}
                      >
                        {esActivo && <span className="w-2 h-2 rounded-full bg-[#6a0008]" />}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-[#1C0A0A]">{label}</p>
                          {esMasBarato && (
                            <span className="text-[10px] font-bold uppercase tracking-wide bg-[#6a0008] text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                              Mejor precio
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6B5B52]">{nota}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-[#1C0A0A] whitespace-nowrap">
                        ${precio.toLocaleString("es-CO")}
                      </span>
                      {esMasBarato && (
                        <p className="text-[11px] font-semibold text-green-600 whitespace-nowrap">
                          Ahorras ${ahorro.toLocaleString("es-CO")}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-t border-neutral-200/70">
              <span className="text-xs font-medium text-[#6B5B52]">
                Subtotal · {cantidad} {cantidad === 1 ? "unidad" : "unidades"} con {activo.label}
              </span>
              <span className="text-base font-black text-[#1C0A0A] whitespace-nowrap">
                ${subtotal.toLocaleString("es-CO")}
              </span>
            </div>
            <p className="px-4 py-2.5 text-[11px] text-[#6B5B52] bg-white border-t border-neutral-100 leading-relaxed">
              💡 Es el mismo producto — la diferencia es solo la forma de pago. Pagando de
              contado siempre obtienes el precio más bajo.
            </p>
          </div>
        );
      })()}

      {/* Urgencia */}
      {producto.stock > 0 && producto.stock <= 10 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-md px-4 py-3">
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
            <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden">
              <button
                onClick={dec}
                aria-label="Restar"
                className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer text-neutral-600 disabled:opacity-30"
                disabled={cantidad <= 1}
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-semibold text-[#1C0A0A]">
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
            <span className="ml-auto text-sm text-[#6B5B52]">
              Total{" "}
              <strong className="text-[#1C0A0A] font-bold">
                ${(producto.precio_venta * cantidad).toLocaleString("es-CO")}
              </strong>
            </span>
          </div>

          {/* Botón agregar */}
          <button
            onClick={handleAgregar}
            className={`w-full py-4 rounded-md font-bold text-base cursor-pointer active:scale-[0.97] relative overflow-hidden shadow-ambient motion-safe:transition-[background-color] motion-safe:duration-300 ${
              agregado
                ? "bg-green-600 text-white"
                : "bg-[#6a0008] hover:bg-[#8C1A1A] text-white"
            }`}
          >
            {/* Estado: no agregado */}
            <span
              className="absolute inset-0 flex items-center justify-center gap-3 motion-safe:transition-[opacity,filter,transform] motion-safe:duration-200"
              style={{
                opacity: agregado ? 0 : 1,
                filter: agregado ? "blur(4px)" : "blur(0px)",
                transform: agregado ? "scale(0.85)" : "scale(1)",
              }}
              aria-hidden={agregado}
            >
              <ShoppingBag size={20} strokeWidth={2} />
              Agregar al carrito
            </span>

            {/* Estado: agregado */}
            <span
              className="absolute inset-0 flex items-center justify-center gap-3 motion-safe:transition-[opacity,filter,transform] motion-safe:duration-200"
              style={{
                opacity: agregado ? 1 : 0,
                filter: agregado ? "blur(0px)" : "blur(4px)",
                transform: agregado ? "scale(1)" : "scale(0.85)",
              }}
              aria-hidden={!agregado}
            >
              <Check size={20} strokeWidth={2.5} />
              ¡Agregado al carrito!
            </span>

            {/* Espaciador invisible */}
            <span className="invisible flex items-center justify-center gap-3" aria-hidden>
              <ShoppingBag size={20} strokeWidth={2} />
              Agregar al carrito
            </span>
          </button>

          {/* Botón Instagram + Favorito */}
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/smart.bga"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 rounded-md border-2 border-neutral-200 text-sm font-semibold text-center flex items-center justify-center gap-2.5 hover:border-[#6a0008] hover:text-[#6a0008] transition-all duration-200 cursor-pointer text-neutral-700"
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
          className="w-full py-4 rounded-md bg-neutral-100 text-neutral-400 font-bold text-base cursor-not-allowed"
        >
          Producto agotado
        </button>
      )}

      {/* Garantías */}
      <div className="grid grid-cols-2 gap-2">
        {GARANTIAS.map(({ label }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-xs text-[#6B5B52] bg-[#F5F3EE] rounded-md px-3 py-2.5"
          >
            <Check size={12} className="text-[#6a0008] flex-shrink-0" strokeWidth={2.5} />
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Texto confianza */}
      <p className="text-xs text-[#6B5B52] text-center leading-relaxed">
        Producto verificado · SmartBga lleva más de <strong className="text-[#1C0A0A]">6 años</strong> seleccionando calidad para Bucaramanga.
      </p>
    </div>
  );
}
