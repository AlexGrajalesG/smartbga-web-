import Link from "next/link";
import Image from "next/image";
import { getProductos, getCategorias } from "@/lib/supabase/queries";
import Hero from "@/components/home/Hero";
import Reveal from "@/components/home/Reveal";
import Marquee from "@/components/home/Marquee";
import MagneticLink from "@/components/home/MagneticLink";
import AnimatedCounter from "@/components/home/AnimatedCounter";
import OfertasFlash from "@/components/home/OfertasFlash";
import SeleccionExclusiva from "@/components/home/SeleccionExclusiva";
import EpicentroTrust from "@/components/home/EpicentroTrust";
import { ShoppingBag, ArrowRight, BadgeCheck, Zap, RotateCcw } from "lucide-react";

/* ── Marquee items ──────────────────────────────────────────── */
const TRUST_ITEMS = [
  "Entrega hoy en Bucaramanga",
  "Productos 100% verificados",
  "6+ años de experiencia",
  "Garantía en todo",
  "Paga con Addi",
  "Soporte directo por Instagram",
  "No somos una tienda genérica",
  "El epicentro del comercio BGA",
];

const STATS = [
  { value: "6+",   label: "Años en el mercado",     icon: BadgeCheck },
  { value: "50+",  label: "Productos disponibles",  icon: ShoppingBag },
  { value: "Hoy",  label: "Te llega en BGA",        icon: Zap },
  { value: "100%", label: "Garantía en tu compra",  icon: RotateCcw },
];

export default async function HomePage() {
  let productos: Awaited<ReturnType<typeof getProductos>> = [];
  let categorias: Awaited<ReturnType<typeof getCategorias>> = [];
  const categoryImages = new Map<string, string>();
  try {
    const [prods, cats] = await Promise.all([getProductos(), getCategorias()]);
    for (const p of prods) {
      if (p.categoria_id && p.imagenes?.[0] && !categoryImages.has(p.categoria_id)) {
        categoryImages.set(p.categoria_id, p.imagenes[0]);
      }
    }
    productos = prods.slice(0, 12);
    categorias = cats;
  } catch {
    // schema pendiente
  }

  const [destacado, secundario] = productos;
  const ofertas = productos
    .filter((p) => p.precio_anterior && p.precio_anterior > p.precio_venta)
    .slice(0, 3);
  const idsUsados = new Set([destacado?.id, secundario?.id, ...ofertas.map((p) => p.id)]);
  const masProductos = productos.filter((p) => !idsUsados.has(p.id)).slice(0, 8);

  return (
    <div className="font-body">

      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <Hero
        stats={STATS.map(({ value, label }) => ({ value, label }))}
        images={productos.slice(0, 2).map((p) => ({
          src: p.imagenes?.[0] ?? "/placeholder.png",
          alt: p.nombre,
          price: p.precio_venta,
        }))}
      />

      {/* ════════════════════════════════════════════════════════
          MARQUEE — Franja de confianza de ancho completo
      ════════════════════════════════════════════════════════ */}
      <Marquee items={TRUST_ITEMS} />

      {/* ════════════════════════════════════════════════════════
          CATEGORÍAS — Galería visual con scroll horizontal
      ════════════════════════════════════════════════════════ */}
      {categorias.length > 0 && (
        <section className="pt-16 md:pt-24 pb-6">
          <div className="max-w-6xl mx-auto px-4 mb-6">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#1C0A0A]">
              Explora por categoría
            </h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 px-4 max-w-6xl mx-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] snap-x snap-mandatory">
            <Reveal className="shrink-0 snap-start">
              <Link
                href="/productos"
                className="group relative block w-40 sm:w-48 md:w-56 aspect-[3/4] rounded-lg overflow-hidden bg-[#1C0A0A] flex items-end p-5"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#8C1A1A]/70 via-[#8C1A1A]/10 to-transparent" />
                <span className="relative z-10 font-display text-xl font-semibold text-white">
                  Todo
                </span>
              </Link>
            </Reveal>

            {categorias.map((c, i) => {
              const img = categoryImages.get(c.id);
              return (
                <Reveal key={c.id} delay={(i + 1) * 0.05} className="shrink-0 snap-start">
                  <Link
                    href={`/productos?categoria=${c.slug}`}
                    className="group relative block w-40 sm:w-48 md:w-56 aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100 flex items-end p-5"
                  >
                    {img && (
                      <Image
                        src={img}
                        alt={c.nombre}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="240px"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <span className="relative z-10 font-display text-lg md:text-xl font-semibold text-white">
                      {c.nombre}
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          OFERTAS FLASH — Countdown + descuentos con barra de progreso
      ════════════════════════════════════════════════════════ */}
      <OfertasFlash productos={ofertas} />

      {/* ════════════════════════════════════════════════════════
          SELECCIÓN EXCLUSIVA — Bento grid de productos destacados
      ════════════════════════════════════════════════════════ */}
      {productos.length > 0 && (
        <SeleccionExclusiva
          destacado={destacado}
          secundario={secundario}
          categorias={categorias}
          masProductos={masProductos}
        />
      )}

      {/* ════════════════════════════════════════════════════════
          DIFERENCIADORES — 3 pilares
      ════════════════════════════════════════════════════════ */}
      <section id="nosotros" className="bg-[#FAF7F4] border-y border-neutral-100 mt-6 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-28">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">

            {[
              {
                num:  "01",
                title: "Verificamos cada producto",
                desc: "Nada llega a nuestro catálogo sin pasar por nuestra revisión. Cero sorpresas al recibirlo.",
              },
              {
                num:  "02",
                title: "Te llega hoy en BGA",
                desc: "La logística más rápida de la ciudad. Pedido hoy, entrega hoy. Sin excusas.",
              },
              {
                num:  "03",
                title: "Respaldo real, no un bot",
                desc: "Soporte directo por Instagram. Una persona real que resuelve tu duda hoy.",
              },
            ].map(({ num, title, desc }, i) => (
              <Reveal
                key={num}
                delay={i * 0.12}
                className={`bg-white rounded-lg p-8 md:p-10 shadow-ambient flex flex-col gap-4 md:flex-1 ${
                  i === 0
                    ? "md:-rotate-2 md:z-10"
                    : i === 1
                    ? "md:rotate-1 md:-ml-6 md:mt-6 md:z-20"
                    : "md:-rotate-1 md:-ml-6 md:mt-12 md:z-30"
                }`}
              >
                <span className="font-display text-5xl font-light text-[#8C1A1A]/25 leading-none">
                  {num}
                </span>
                <h3 className="font-display text-2xl font-semibold text-[#1C0A0A] leading-tight">
                  {title}
                </h3>
                <p className="text-sm text-[#6B5B52] leading-relaxed">{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          EPICENTRO DE CONFIANZA — Sección de credibilidad
      ════════════════════════════════════════════════════════ */}
      <EpicentroTrust />

      {/* ════════════════════════════════════════════════════════
          SOCIAL PROOF — Banda drenched con números animados
      ════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#8C1A1A] py-20 md:py-28 overflow-hidden">
        <span
          aria-hidden
          className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-6 font-display text-[140px] sm:text-[220px] md:text-[320px] font-bold text-white/[0.04] leading-none whitespace-nowrap select-none pointer-events-none"
        >
          Bucaramanga
        </span>

        <div className="relative max-w-6xl mx-auto px-4 md:flex md:items-center md:justify-between md:gap-16">
          <Reveal className="md:max-w-md">
            <h2 className="font-display text-4xl md:text-6xl font-semibold text-white leading-[1.05] mb-4">
              El comercio que Bucaramanga
              <span className="italic text-[#C9A84C]"> merece</span>.
            </h2>
            <p className="text-white/70 text-base leading-relaxed max-w-sm">
              Seis años construyendo confianza, una entrega a la vez.
            </p>
          </Reveal>

          <div className="mt-12 md:mt-0 grid grid-cols-2 gap-4 md:gap-5 md:shrink-0">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <Reveal
                key={label}
                delay={i * 0.08}
                className={`bg-white/[0.06] border border-white/10 rounded-lg p-6 backdrop-blur-sm ${
                  i % 2 === 0 ? "md:-rotate-2" : "md:rotate-2"
                }`}
              >
                <Icon size={20} className="text-[#C9A84C] mb-3" />
                <p className="font-display text-3xl md:text-4xl font-bold text-white">
                  <AnimatedCounter value={value} />
                </p>
                <p className="text-sm text-white/60 mt-1">{label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CTA FINAL — Urgencia de compra
      ════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#1C0A0A] overflow-hidden noise">
        {/* Acento diagonal */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #8C1A1A18 0%, transparent 45%)",
          }}
        />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#C9A84C] opacity-[0.03] blur-3xl pointer-events-none" />

        <Reveal className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 md:grid md:grid-cols-[1.3fr_1fr] md:gap-12 md:items-center">
          <h2 className="font-display text-5xl sm:text-6xl md:text-8xl font-semibold text-white leading-[0.95] text-left">
            Tu próxima compra
            <span className="block italic text-[#C9A84C]">te espera hoy.</span>
          </h2>

          <div className="mt-10 md:mt-0 flex flex-col items-start gap-6">
            <span className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase">
              Pedidos abiertos ahora
            </span>
            <p className="text-neutral-400 text-base max-w-md leading-relaxed text-left">
              Productos verificados, entrega el mismo día, garantía real.
              Esto es SmartBga: el epicentro del comercio en Bucaramanga.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <MagneticLink
                href="/productos"
                className="btn-beam group inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-[#6a0008] hover:bg-[#8C1A1A] text-white font-semibold text-base rounded-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#6a0008]/30 cursor-pointer"
              >
                Comprar ahora
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </MagneticLink>
              <a
                href="https://www.instagram.com/smart.bga"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 border border-white/20 hover:border-white/50 text-white/70 hover:text-white font-semibold text-base rounded-md transition-all duration-200 cursor-pointer"
              >
                Síguenos en Instagram
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
