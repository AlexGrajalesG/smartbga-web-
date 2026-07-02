import { Suspense } from "react";
import Link from "next/link";
import { getCategorias, getProductos } from "@/lib/supabase/queries";
import ProductoCard from "@/components/productos/ProductoCard";
import FiltrosCategorias from "@/components/productos/FiltrosCategorias";
import { ChevronRight, PackageSearch } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Productos — SmartBga" };

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

  const categoriaActiva = categoria
    ? categorias.find((c) => c.slug === categoria)
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">

      {/* Breadcrumb */}
      {categoriaActiva && (
        <nav className="flex items-center gap-1.5 text-sm text-neutral-400 mb-6">
          <Link href="/productos" className="hover:text-[#6a0008] transition-colors">
            Todos
          </Link>
          <ChevronRight size={14} />
          <span className="text-neutral-700 font-medium">{categoriaActiva.nombre}</span>
        </nav>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#1C0A0A]">
          {categoriaActiva ? categoriaActiva.nombre : "Todos los productos"}
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          {productos.length} {productos.length === 1 ? "producto" : "productos"}
          {categoriaActiva ? ` en ${categoriaActiva.nombre}` : " disponibles"}
        </p>
      </div>

      {/* Filtros */}
      <Suspense>
        <FiltrosCategorias categorias={categorias} />
      </Suspense>

      {/* Grid / Estado vacío */}
      {productos.length === 0 ? (
        <div className="mt-20 flex flex-col items-center gap-4 text-center">
          <PackageSearch size={48} className="text-neutral-200" />
          <p className="text-neutral-500 font-medium">
            No hay productos en{" "}
            {categoriaActiva ? `"${categoriaActiva.nombre}"` : "esta categoría"}.
          </p>
          <Link
            href="/productos"
            className="text-sm text-[#6a0008] hover:underline font-medium"
          >
            Ver todos los productos
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {productos.map((p, i) => (
            <ProductoCard key={p.id} producto={p} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
