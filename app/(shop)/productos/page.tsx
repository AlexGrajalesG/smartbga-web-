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
    ? categorias.find((c) => c.slug === categoria) ?? null
    : null;

  return (
    <div className="bg-[#FAF7F4] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-neutral-400 mb-6">
          <Link href="/" className="hover:text-[#6a0008] transition-colors">
            Inicio
          </Link>
          <ChevronRight size={14} />
          <Link href="/productos" className={categoriaActiva ? "hover:text-[#6a0008] transition-colors" : "text-neutral-700 font-medium"}>
            Productos
          </Link>
          {categoriaActiva && (
            <>
              <ChevronRight size={14} />
              <span className="text-neutral-700 font-medium">{categoriaActiva.nombre}</span>
            </>
          )}
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#1C0A0A]">
            {categoriaActiva ? categoriaActiva.nombre : "Todos los productos"}
          </h1>
          <p className="text-neutral-400 text-sm mt-1.5">
            {productos.length === 0
              ? "Sin resultados"
              : `${productos.length} ${productos.length === 1 ? "producto" : "productos"}${categoriaActiva ? ` en ${categoriaActiva.nombre}` : " disponibles"}`}
          </p>
        </div>

        {/* Filtros */}
        <Suspense>
          <FiltrosCategorias categorias={categorias} />
        </Suspense>

        {/* Grid / Estado vacío */}
        {productos.length === 0 ? (
          <div className="mt-24 flex flex-col items-center gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
              <PackageSearch size={36} className="text-neutral-300" />
            </div>
            <div>
              <p className="text-neutral-600 font-semibold text-lg">
                No hay productos{categoriaActiva ? ` en "${categoriaActiva.nombre}"` : " aquí"}
              </p>
              <p className="text-neutral-400 text-sm mt-1">
                Prueba con otra categoría o revisa más tarde.
              </p>
            </div>
            <Link
              href="/productos"
              className="mt-2 px-6 py-2.5 bg-[#1C0A0A] text-white text-sm font-semibold rounded-md hover:bg-[#6a0008] transition-colors"
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
    </div>
  );
}
