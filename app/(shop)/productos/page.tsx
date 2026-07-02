import { Suspense } from "react";
import Link from "next/link";
import { getCategorias, getProductos } from "@/lib/supabase/queries";
import ProductoCard from "@/components/productos/ProductoCard";
import FiltroLateral from "@/components/productos/FiltroLateral";
import { ChevronRight, PackageSearch } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Productos — SmartBga" };

type SearchParams = {
  categoria?: string
  orden?: string
  precio_min?: string
  precio_max?: string
  q?: string
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const [productos, categorias] = await Promise.all([
    getProductos({
      categoria: params.categoria,
      busqueda: params.q,
      precioMin: params.precio_min ? Number(params.precio_min) : undefined,
      precioMax: params.precio_max ? Number(params.precio_max) : undefined,
      orden: params.orden,
    }),
    getCategorias(),
  ]);

  const categoriaActiva = params.categoria
    ? categorias.find((c) => c.slug === params.categoria) ?? null
    : null;

  const titulo = params.q
    ? `Resultados para "${params.q}"`
    : categoriaActiva
    ? categoriaActiva.nombre
    : "Todos los productos";

  return (
    <div className="bg-[#FAF7F4] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-neutral-400 mb-6">
          <Link href="/" className="hover:text-[#6a0008] transition-colors">Inicio</Link>
          <ChevronRight size={13} />
          <Link
            href="/productos"
            className={categoriaActiva || params.q
              ? "hover:text-[#6a0008] transition-colors"
              : "text-neutral-700 font-medium pointer-events-none"}
          >
            Productos
          </Link>
          {(categoriaActiva || params.q) && (
            <>
              <ChevronRight size={13} />
              <span className="text-neutral-700 font-medium truncate max-w-[200px]">
                {params.q ? `"${params.q}"` : categoriaActiva?.nombre}
              </span>
            </>
          )}
        </nav>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#1C0A0A]">
            {titulo}
          </h1>
          <p className="text-neutral-400 text-sm mt-1.5">
            {productos.length === 0
              ? "Sin resultados"
              : `${productos.length} ${productos.length === 1 ? "producto" : "productos"} encontrados`}
          </p>
        </div>

        {/* Layout: sidebar + grid */}
        <div className="flex gap-8 items-start">

          {/* Sidebar filter */}
          <Suspense fallback={null}>
            <FiltroLateral categorias={categorias} />
          </Suspense>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {productos.length === 0 ? (
              <div className="mt-16 flex flex-col items-center gap-5 text-center">
                <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
                  <PackageSearch size={36} className="text-neutral-300" />
                </div>
                <div>
                  <p className="text-neutral-600 font-semibold text-lg">Sin resultados</p>
                  <p className="text-neutral-400 text-sm mt-1">
                    Prueba con otros filtros o palabras clave.
                  </p>
                </div>
                <Link
                  href="/productos"
                  className="mt-1 px-6 py-2.5 bg-[#1C0A0A] text-white text-sm font-semibold rounded-md hover:bg-[#6a0008] transition-colors cursor-pointer"
                >
                  Ver todos los productos
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {productos.map((p, i) => (
                  <ProductoCard key={p.id} producto={p} priority={i < 4} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
