import { Suspense } from "react";
import { getCategorias, getProductos } from "@/lib/supabase/queries";
import ProductoCard from "@/components/productos/ProductoCard";
import FiltrosCategorias from "@/components/productos/FiltrosCategorias";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Productos" };

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const [productos, categorias] = await Promise.all([
    getProductos(categoria),
    getCategorias(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Productos</h1>

      <Suspense>
        <FiltrosCategorias categorias={categorias} />
      </Suspense>

      {productos.length === 0 ? (
        <p className="mt-16 text-center text-neutral-400">
          No hay productos en esta categoría.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((p, i) => (
            <ProductoCard key={p.id} producto={p} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
