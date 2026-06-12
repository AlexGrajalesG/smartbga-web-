import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductoBySlug } from "@/lib/supabase/queries";
import { normalizarVideoEmbed } from "@/lib/video";
import GaleriaImagenes from "@/components/productos/GaleriaImagenes";
import PanelCompra from "@/components/productos/PanelCompra";
import { ChevronRight, Zap, RotateCcw, ShieldCheck, Headphones } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);
  if (!producto) return { title: "Producto no encontrado" };
  return {
    title: `${producto.nombre} — SmartBga`,
    description: producto.descripcion?.slice(0, 155) ?? undefined,
    openGraph: { images: producto.imagenes?.[0] ? [producto.imagenes[0]] : [] },
  };
}

const BENEFICIOS = [
  {
    icon: Zap,
    titulo: "Entrega rápida",
    desc: "Domicilios en Bucaramanga el mismo día o al día siguiente.",
  },
  {
    icon: ShieldCheck,
    titulo: "Garantía real",
    desc: "Todos nuestros productos pasan por verificación de calidad.",
  },
  {
    icon: RotateCcw,
    titulo: "Cambios sin drama",
    desc: "Si algo no está bien, lo solucionamos sin complicaciones.",
  },
  {
    icon: Headphones,
    titulo: "Soporte directo",
    desc: "Respuesta por Instagram en menos de 24 horas.",
  },
];

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);
  if (!producto) notFound();

  // Parsear párrafos del description para mostrarlos mejor
  const parrafos = producto.descripcion
    ? producto.descripcion.split("\n\n").filter(Boolean)
    : [];

  const videoEmbed = producto.video_url
    ? normalizarVideoEmbed(producto.video_url)
    : null;

  return (
    <div id="top" className="bg-white">

      {/* ─── ZONA PRINCIPAL: galería sticky + panel de compra ─── */}
      <section className="max-w-7xl mx-auto px-4 pt-6 pb-0">

        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-xs text-neutral-400 mb-8 animate-fade-up"
          aria-label="Ruta de navegación"
        >
          <Link href="/" className="hover:text-neutral-700 transition-colors cursor-pointer">Inicio</Link>
          <ChevronRight size={11} />
          <Link href="/productos" className="hover:text-neutral-700 transition-colors cursor-pointer">Productos</Link>
          {producto.categoria && (
            <>
              <ChevronRight size={11} />
              <span className="text-neutral-500">{producto.categoria.nombre}</span>
            </>
          )}
          <ChevronRight size={11} />
          <span className="text-neutral-700 font-medium truncate max-w-[160px]">
            {producto.nombre}
          </span>
        </nav>

        {/* Layout dos columnas */}
        <div className="lg:grid lg:grid-cols-[55%_45%] lg:gap-12 lg:items-start">

          {/* Galería — sticky en desktop */}
          <div className="lg:sticky lg:top-20 lg:self-start animate-fade-up">
            <GaleriaImagenes imagenes={producto.imagenes} nombre={producto.nombre} />
          </div>

          {/* Panel de compra */}
          <div className="mt-8 lg:mt-0 animate-fade-up-delay-1 lg:py-2">
            <PanelCompra producto={producto} />
          </div>
        </div>
      </section>

      {/* ─── SEPARADOR ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mt-16">
        <div className="h-px bg-neutral-100" />
      </div>

      {/* ─── DESCRIPCIÓN ───────────────────────────────────────── */}
      {parrafos.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-14 animate-fade-up">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">
            Sobre este producto
          </h2>
          <div className="flex flex-col gap-5">
            {parrafos.map((p, i) => (
              <p
                key={i}
                className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line"
              >
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ─── BENEFICIOS ────────────────────────────────────────── */}
      <section className="bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-xl font-bold text-neutral-900 mb-8 text-center">
            ¿Por qué comprar en SmartBga?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFICIOS.map(({ icon: Icon, titulo, desc }) => (
              <div
                key={titulo}
                className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-[#8C1A1A]/8 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#8C1A1A]" />
                </div>
                <p className="font-semibold text-sm text-neutral-900 mb-1">{titulo}</p>
                <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INSTAGRAM REEL ────────────────────────────────────── */}
      {videoEmbed && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">

            {/* Texto izquierda */}
            <div className="flex-1 lg:max-w-sm">
              <span className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase">
                Míralo en acción
              </span>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-neutral-900 leading-tight">
                El resultado habla por sí solo
              </h2>
              <p className="mt-4 text-sm text-neutral-500 leading-relaxed">
                Nuestro equipo probó el producto antes de publicarlo. Así se ve en uso real, sin filtros ni edición.
              </p>
              <a
                href="https://www.instagram.com/smart.bga"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8C1A1A] hover:text-[#6B1313] transition-colors cursor-pointer"
              >
                Ver más en @smart.bga
                <ChevronRight size={15} />
              </a>
            </div>

            {/* Reel */}
            <div className="flex-shrink-0 w-full max-w-[320px] mx-auto lg:mx-0">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-neutral-200 bg-black border border-neutral-100">
                <iframe
                  src={videoEmbed}
                  className="w-full"
                  style={{ height: "560px", border: "none" }}
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title={`Reel de ${producto.nombre}`}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA FINAL ─────────────────────────────────────────── */}
      <section className="bg-[#111111]">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-[#8C1A1A] text-sm font-bold tracking-widest uppercase mb-3">
            SmartBga
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
            ¿Listo para llevarte el tuyo?
          </h2>
          <p className="text-neutral-400 mb-8 text-sm max-w-md mx-auto leading-relaxed">
            Más de 6 años llevando calidad a Bucaramanga. Garantía, soporte y envío incluidos.
          </p>
          <a
            href="#top"
            className="inline-block px-10 py-4 bg-[#8C1A1A] hover:bg-[#6B1313] text-white font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#8C1A1A]/30 cursor-pointer"
          >
            Agregar al carrito
          </a>
        </div>
      </section>
    </div>
  );
}
