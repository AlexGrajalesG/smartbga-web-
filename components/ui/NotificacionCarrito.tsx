"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Check, ShoppingBag } from "lucide-react";
import { useNotificacionCarrito } from "@/lib/store/notificacion-carrito";
import type { Producto } from "@/types";

const DURACION_MS = 4000;

const SHADOW =
  "0px 0px 0px 1px rgba(0,0,0,0.08), 0px 4px 12px -2px rgba(0,0,0,0.12), 0px 16px 32px -4px rgba(0,0,0,0.10)";

const KEYFRAMES = `
  @keyframes toast-in {
    from { opacity: 0; transform: translateY(-10px) scale(0.96); filter: blur(4px); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0px); }
  }
  @keyframes toast-out {
    from { opacity: 1; transform: translateY(0)   scale(1);    filter: blur(0px); }
    to   { opacity: 0; transform: translateY(-8px) scale(0.97); filter: blur(3px); }
  }
  @keyframes progress-bar {
    from { transform: scaleX(1); }
    to   { transform: scaleX(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .toast-in  { animation: none !important; opacity: 1 !important; }
    .toast-out { animation: none !important; opacity: 0 !important; }
    .toast-progress { animation: none !important; }
  }
`;

function ToastInner({ producto, onDismiss }: { producto: Producto; onDismiss: () => void }) {
  const [saliendo, setSaliendo] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, DURACION_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaliendo(true);
    setTimeout(onDismiss, 240);
  };

  const tieneDescuento =
    producto.precio_anterior != null && producto.precio_anterior > producto.precio_venta;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        boxShadow: SHADOW,
        animation: saliendo
          ? "toast-out 240ms cubic-bezier(0.4,0,1,1) forwards"
          : "toast-in  300ms cubic-bezier(0.16,1,0.3,1) forwards",
      }}
      className="w-[min(310px,calc(100vw-2rem))] bg-white rounded-2xl overflow-hidden border-l-[3px] border-green-500"
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-[18px] h-[18px] rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check size={10} className="text-green-600" strokeWidth={3.5} />
          </span>
          <span className="text-[13px] font-semibold text-neutral-700">Añadido al carrito</span>
        </div>
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors rounded-lg hover:bg-neutral-100 cursor-pointer"
        >
          <X size={13} />
        </button>
      </div>

      {/* Producto */}
      <div className="flex items-center gap-3 px-4 pb-3 border-t border-neutral-100 pt-2.5">
        <div className="relative w-[52px] h-[52px] rounded-xl overflow-hidden bg-neutral-50 ring-1 ring-neutral-100 flex-shrink-0">
          {producto.imagenes?.[0] ? (
            <Image
              src={producto.imagenes[0]}
              alt={producto.nombre}
              fill
              className="object-cover"
              sizes="52px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={18} className="text-neutral-300" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-neutral-900 leading-snug line-clamp-2">
            {producto.nombre}
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-[13px] font-bold text-neutral-900">
              ${producto.precio_venta.toLocaleString("es-CO")}
            </span>
            {tieneDescuento && (
              <span className="text-[11px] text-neutral-400 line-through">
                ${producto.precio_anterior!.toLocaleString("es-CO")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-3.5">
        <Link
          href="/carrito"
          onClick={dismiss}
          className="block w-full py-2.5 bg-[#8C1A1A] hover:bg-[#6B1313] text-white text-[13px] font-bold rounded-xl text-center transition-colors cursor-pointer"
        >
          Ver carrito →
        </Link>
      </div>

      {/* Barra de progreso */}
      <div
        className="toast-progress h-0.5 bg-[#8C1A1A] origin-left"
        style={{ animation: `progress-bar ${DURACION_MS}ms linear forwards` }}
      />
    </div>
  );
}

export default function NotificacionCarrito() {
  const producto = useNotificacionCarrito((s) => s.producto);
  const seq      = useNotificacionCarrito((s) => s._seq);
  const ocultar  = useNotificacionCarrito((s) => s.ocultar);

  return (
    <>
      <style>{KEYFRAMES}</style>
      {/* top-20 = 80px, por debajo del navbar de 64px */}
      <div className="fixed top-20 right-4 z-[200] pointer-events-none">
        {producto && (
          <div className="pointer-events-auto">
            <ToastInner key={seq} producto={producto} onDismiss={ocultar} />
          </div>
        )}
      </div>
    </>
  );
}
