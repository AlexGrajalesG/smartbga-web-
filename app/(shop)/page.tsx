import Link from "next/link";
import { getProductos } from "@/lib/supabase/queries";
import ProductoCard from "@/components/productos/ProductoCard";

export default async function HomePage() {
  const productos = await getProductos();
  const destacados = productos.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="bg-neutral-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Smart<span className="text-[#e5c87a]">Bga</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-md">
            Los mejores productos, directo a tu puerta en Bucaramanga.
          </p>
          <Link
            href="/productos"
            className="px-8 py-3 bg-[#e5c87a] text-black font-semibold rounded-xl hover:bg-yellow-300 transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      </section>

      {/* Productos destacados */}
      {destacados.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Productos</h2>
            <Link href="/productos" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {destacados.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
