"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Categoria } from "@/types";

export default function FiltrosCategorias({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoriaActual = searchParams.get("categoria");

  function filtrar(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("categoria", slug);
    } else {
      params.delete("categoria");
    }
    router.push(`/productos?${params.toString()}`);
  }

  if (categorias.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap mb-2">
      <button
        onClick={() => filtrar(null)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
          !categoriaActual
            ? "bg-[#1C0A0A] text-white border-[#1C0A0A]"
            : "border-neutral-200 text-neutral-500 hover:border-[#1C0A0A] hover:text-[#1C0A0A]"
        }`}
      >
        Todos
      </button>
      {categorias.map((cat) => (
        <button
          key={cat.id}
          onClick={() => filtrar(cat.slug)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
            categoriaActual === cat.slug
              ? "bg-[#1C0A0A] text-white border-[#1C0A0A]"
              : "border-neutral-200 text-neutral-500 hover:border-[#1C0A0A] hover:text-[#1C0A0A]"
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  );
}
