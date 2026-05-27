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

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => filtrar(null)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
          !categoriaActual
            ? "bg-neutral-900 text-white border-neutral-900"
            : "border-neutral-300 text-neutral-600 hover:border-neutral-900"
        }`}
      >
        Todos
      </button>
      {categorias.map((cat) => (
        <button
          key={cat.id}
          onClick={() => filtrar(cat.slug)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            categoriaActual === cat.slug
              ? "bg-neutral-900 text-white border-neutral-900"
              : "border-neutral-300 text-neutral-600 hover:border-neutral-900"
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  );
}
