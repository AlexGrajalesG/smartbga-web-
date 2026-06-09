import Link from "next/link";
import Image from "next/image";
import { getProductos, getCategorias } from "@/lib/supabase/queries";
import ProductoCard from "@/components/productos/ProductoCard";
import { ShoppingBag, ArrowRight, MapPin, BadgeCheck, Zap, RotateCcw } from "lucide-react";

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
  try {
    const [prods, cats] = await Promise.all([getProductos(), getCategorias()]);
    productos = prods.slice(0, 8);
    categorias = cats;
  } catch {
    // schema pendiente
  }

  const marqueeItems = [...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <div className="font-body">

      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#1C0A0A] min-h-[92vh] flex flex-col justify-center overflow-hidden noise">

        {/* Banda diagonal de acento */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, transparent 55%, #8C1A1A18 55%, #8C1A1A08 100%)",
          }}
        />

        {/* Orbe de fondo */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#8C1A1A] opacity-[0.06] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#C9A84C] opacity-[0.04] blur-3xl pointer-events-none" />

        {/* Líneas de grilla verticales */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {[20, 40, 60, 80].map((pct) => (
            <div
              key={pct}
              className="absolute top-0 bottom-0 w-px bg-white/[0.03]"
              style={{ left: `${pct}%` }}
            />
          ))}
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">

            {/* Eyebrow */}
            <div className="animate-slide-left flex items-center gap-2.5 mb-8">
              <MapPin size={13} className="text-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase">
                Bucaramanga · Epicentro comercial
              </span>
            </div>

            {/* Headline — Cormorant Garamond */}
            <h1 className="font-display animate-fade-up text-white leading-[1.05] tracking-tight">
              <span className="block text-6xl md:text-8xl font-semibold">
                Hoy lo pides.
              </span>
              <span className="block text-6xl md:text-8xl font-light text-[#C9A84C] italic mt-1">
                Hoy te llega.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="animate-fade-up-delay-1 mt-8 text-neutral-300 text-lg md:text-xl leading-relaxed max-w-xl">
              Productos importados verificados. La mejor logística de la ciudad.{" "}
              <span className="text-white font-semibold">
                No somos una tienda más — somos el epicentro.
              </span>
            </p>

            {/* CTAs */}
            <div className="animate-fade-up-delay-2 mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/productos"
                className="btn-beam group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#8C1A1A] hover:bg-[#6B1313] text-white font-semibold text-base rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#8C1A1A]/30 cursor-pointer"
              >
                <ShoppingBag size={18} strokeWidth={2} />
                Ver catálogo completo
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <a
                href="https://www.instagram.com/smart.bga"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 border border-white/20 hover:border-white/50 text-white/80 hover:text-white font-semibold text-base rounded-2xl transition-all duration-200 cursor-pointer backdrop-blur-sm"
              >
                @smart.bga
              </a>
            </div>

            {/* Mini stats */}
            <div className="animate-fade-up-delay-3 mt-14 flex flex-wrap gap-x-8 gap-y-4">
              {STATS.map(({ value, label }) => (
                <div key={label} className="flex flex-col">
                  <span className="font-display text-3xl font-bold text-white">{value}</span>
                  <span className="text-xs text-neutral-500 mt-0.5">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Borde inferior */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#8C1A1A]/60 to-transparent" />
      </section>

      {/* ════════════════════════════════════════════════════════
          MARQUEE — Señales de confianza en movimiento
      ════════════════════════════════════════════════════════ */}
      <div className="bg-[#8C1A1A] py-3.5 overflow-hidden">
        <div className="flex gap-0 animate-marquee whitespace-nowrap">
          {marqueeItems.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 px-6 text-white text-sm font-medium"
            >
              <span className="w-1 h-1 rounded-full bg-white/50 flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          CATEGORÍAS — Chips de filtro
      ════════════════════════════════════════════════════════ */}
      {categorias.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pt-12 pb-4">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/productos"
              className="px-4 py-2 rounded-full bg-[#1C0A0A] text-white text-sm font-medium hover:bg-[#8C1A1A] transition-colors duration-200 cursor-pointer"
            >
              Todo
            </Link>
            {categorias.map((c) => (
              <Link
                key={c.id}
                href={`/productos?categoria=${c.slug}`}
                className="px-4 py-2 rounded-full border border-neutral-200 text-neutral-600 text-sm font-medium hover:border-[#8C1A1A] hover:text-[#8C1A1A] transition-all duration-200 cursor-pointer"
              >
                {c.nombre}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          PRODUCTOS — Grid con stagger fade-up
      ════════════════════════════════════════════════════════ */}
      {productos.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs text-[#8C1A1A] font-bold tracking-widest uppercase mb-1">
                Catálogo
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#1C0A0A] leading-tight">
                Selección del día
              </h2>
            </div>
            <Link
              href="/productos"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#8C1A1A] hover:text-[#6B1313] transition-colors group cursor-pointer"
            >
              Ver todo
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {productos.map((p, i) => (
              <div
                key={p.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
              >
                <ProductoCard producto={p} priority={i < 4} />
              </div>
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1C0A0A] text-white font-semibold rounded-2xl hover:bg-[#8C1A1A] transition-colors duration-200 cursor-pointer"
            >
              Ver catálogo completo
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          DIFERENCIADORES — 3 pilares
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF7F4] border-y border-neutral-100 mt-6">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-neutral-200">

            {[
              {
                num:  "01",
                title: "Verificamos cada producto",
                desc: "Nada llega a nuestro catálogo sin pasar por nuestra revisión. Cero sorpresas al recibirlo.",
              },
              {
                num:  "02",
                title: "Te llega hoy en BGA",
                desc: "La logística más rápida de la ciudad. Pedido hoy, entrega hoy — sin excusas.",
              },
              {
                num:  "03",
                title: "Respaldo real, no un bot",
                desc: "Soporte directo por Instagram. Una persona real que resuelve tu duda hoy.",
              },
            ].map(({ num, title, desc }) => (
              <div key={num} className="px-0 md:px-10 first:pl-0 last:pr-0 flex flex-col gap-4">
                <span className="font-display text-5xl font-light text-[#8C1A1A]/25 leading-none">
                  {num}
                </span>
                <h3 className="font-display text-2xl font-semibold text-[#1C0A0A] leading-tight">
                  {title}
                </h3>
                <p className="text-sm text-[#6B5B52] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SOCIAL PROOF — Números grandes
      ════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-xs text-[#8C1A1A] font-bold tracking-widest uppercase mb-2">
            Por qué SmartBga
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#1C0A0A]">
            El comercio que Bucaramanga
            <span className="italic text-[#8C1A1A]"> merece</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="bg-[#FAF7F4] rounded-2xl p-6 text-center border border-neutral-100 hover:border-[#8C1A1A]/20 hover:shadow-md transition-all duration-300 group cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-[#8C1A1A]/8 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#8C1A1A]/12 transition-colors">
                <Icon size={18} className="text-[#8C1A1A]" />
              </div>
              <p className="font-display text-4xl font-bold text-[#1C0A0A] mb-1">{value}</p>
              <p className="text-xs text-[#6B5B52] leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CTA FINAL — Urgencia de compra
      ════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#1C0A0A] overflow-hidden">
        {/* Acento diagonal */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #8C1A1A18 0%, transparent 45%)",
          }}
        />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#C9A84C] opacity-[0.03] blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-[#C9A84C] text-xs font-bold tracking-[0.2em] uppercase mb-4">
            No esperes más
          </p>
          <h2 className="font-display text-5xl md:text-6xl font-semibold text-white leading-tight mb-6">
            Tu próxima compra
            <span className="block italic text-[#C9A84C]">te espera hoy.</span>
          </h2>
          <p className="text-neutral-400 text-base mb-10 max-w-md mx-auto leading-relaxed">
            Productos verificados, entrega el mismo día, garantía real.
            Esto es SmartBga — el epicentro del comercio en Bucaramanga.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="btn-beam group inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-[#8C1A1A] hover:bg-[#6B1313] text-white font-semibold text-base rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#8C1A1A]/30 cursor-pointer"
            >
              Comprar ahora
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://www.instagram.com/smart.bga"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 border border-white/20 hover:border-white/50 text-white/70 hover:text-white font-semibold text-base rounded-2xl transition-all duration-200 cursor-pointer"
            >
              Síguenos en Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
