import Link from "next/link";
import Image from "next/image";
import type { Producto } from "@/types";
import Reveal from "./Reveal";
import CountdownTimer from "./CountdownTimer";

export default function OfertasFlash({ productos }: { productos: Producto[] }) {
  if (productos.length === 0) return null;

  return (
    <section id="ofertas-flash" className="max-w-6xl mx-auto px-4 py-16 md:py-20 scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-8 bg-[#6a0008] rounded-full" />
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#1C0A0A]">
            Ofertas Flash
          </h2>
        </div>
        <CountdownTimer />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((p, i) => {
          const descuentoPct = Math.round((1 - p.precio_venta / p.precio_anterior!) * 100);
          const pctVendido = Math.min(95, Math.max(35, 100 - p.stock * 8));
          const stockLabel = p.stock <= 3 ? "¡Últimas unidades!" : `Quedan ${p.stock}`;

          return (
            <Reveal key={p.id} delay={i * 0.1}>
              <Link
                href={`/producto/${p.slug}`}
                className="group block bg-white rounded-lg p-4 shadow-ambient border border-neutral-100 transition-transform duration-500 hover:-translate-y-1.5"
              >
                <div className="relative aspect-square rounded-md overflow-hidden bg-neutral-50 mb-4">
                  <span className="absolute top-2 left-2 z-10 bg-[#C9A84C] text-[#1C0A0A] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                    -{descuentoPct}%
                  </span>
                  <Image
                    src={p.imagenes?.[0] ?? "/placeholder.png"}
                    alt={p.nombre}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                <h3 className="font-display text-lg text-[#1C0A0A] mb-1 line-clamp-1">{p.nombre}</h3>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[#6a0008] font-bold">
                    ${p.precio_venta.toLocaleString("es-CO")}
                  </span>
                  <span className="text-neutral-400 text-sm line-through">
                    ${p.precio_anterior!.toLocaleString("es-CO")}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#6B5B52]">{pctVendido}% vendido</span>
                    <span className="text-[#6a0008]">{stockLabel}</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#6a0008] rounded-full" style={{ width: `${pctVendido}%` }} />
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
