import { notFound } from "next/navigation";
import { getProductoBySlug } from "@/lib/supabase/queries";
import GaleriaImagenes from "@/components/productos/GaleriaImagenes";
import BotonAgregarCarrito from "@/components/productos/BotonAgregarCarrito";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);
  if (!producto) return { title: "Producto no encontrado" };
  return { title: producto.nombre, description: producto.descripcion };
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);
  if (!producto) notFound();

  const tieneDescuento =
    producto.precio_anterior && producto.precio_anterior > producto.precio;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        <GaleriaImagenes imagenes={producto.imagenes} nombre={producto.nombre} />

        <div className="flex flex-col gap-5">
          {producto.categoria && (
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {producto.categoria.nombre}
            </span>
          )}

          <h1 className="text-2xl font-bold leading-tight">{producto.nombre}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold">
              ${producto.precio.toLocaleString("es-CO")}
            </span>
            {tieneDescuento && (
              <span className="text-base text-neutral-400 line-through">
                ${producto.precio_anterior!.toLocaleString("es-CO")}
              </span>
            )}
          </div>

          {producto.descripcion && (
            <p className="text-sm text-neutral-600 leading-relaxed">
              {producto.descripcion}
            </p>
          )}

          <div className="flex flex-col gap-3 mt-2">
            <BotonAgregarCarrito producto={producto} />

            <a
              href="https://www.instagram.com/smart.bga"
              target="_blank"
              className="w-full py-3.5 rounded-xl border border-neutral-300 text-sm font-semibold text-center hover:border-neutral-900 transition-colors"
            >
              Consultar por Instagram
            </a>
          </div>

          {producto.stock > 0 && producto.stock <= 5 && (
            <p className="text-xs text-amber-600 font-medium">
              ¡Solo quedan {producto.stock} disponibles!
            </p>
          )}

          {producto.video_url && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Video
              </p>
              <div className="rounded-xl overflow-hidden aspect-video bg-neutral-50">
                <iframe
                  src={producto.video_url}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
