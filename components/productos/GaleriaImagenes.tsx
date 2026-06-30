"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GaleriaImagenes({
  imagenes,
  nombre,
}: {
  imagenes: string[];
  nombre: string;
}) {
  const [activa, setActiva] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  const ir = useCallback((idx: number) => {
    setActiva(idx);
    setFadeKey((k) => k + 1);
  }, []);

  const anterior = () => ir((activa - 1 + imagenes.length) % imagenes.length);
  const siguiente = () => ir((activa + 1) % imagenes.length);

  if (!imagenes.length) return null;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Imagen principal */}
      <div className="relative rounded-2xl overflow-hidden bg-neutral-50 group flex-1 min-h-[380px] lg:min-h-[520px]">
        <div key={fadeKey} className="absolute inset-0 animate-fade-in-fast">
          <Image
            src={imagenes[activa]}
            alt={`${nombre} - foto ${activa + 1}`}
            fill
            className="object-contain p-3"
            priority={activa === 0}
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        </div>

        {/* Flechas */}
        {imagenes.length > 1 && (
          <>
            <button
              onClick={anterior}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:bg-white hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={18} className="text-neutral-800" />
            </button>
            <button
              onClick={siguiente}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:bg-white hover:scale-110 active:scale-95"
            >
              <ChevronRight size={18} className="text-neutral-800" />
            </button>

            {/* Puntos */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imagenes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => ir(i)}
                  aria-label={`Foto ${i + 1}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    i === activa
                      ? "w-5 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {imagenes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {imagenes.map((img, i) => (
            <button
              key={i}
              onClick={() => ir(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`relative flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
                activa === i
                  ? "ring-2 ring-[#8C1A1A] ring-offset-1"
                  : "opacity-50 hover:opacity-80"
              }`}
            >
              <Image
                src={img}
                alt={`${nombre} ${i + 1}`}
                fill
                className="object-contain p-1"
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
