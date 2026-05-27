"use client";

import { useState } from "react";
import Image from "next/image";

export default function GaleriaImagenes({
  imagenes,
  nombre,
}: {
  imagenes: string[];
  nombre: string;
}) {
  const [activa, setActiva] = useState(0);

  if (!imagenes.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-50">
        <Image
          src={imagenes[activa]}
          alt={nombre}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {imagenes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imagenes.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiva(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                activa === i ? "border-neutral-900" : "border-transparent"
              }`}
            >
              <Image src={img} alt={`${nombre} ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
