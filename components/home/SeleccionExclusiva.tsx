import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Zap,
  Headphones,
  Watch,
  Home,
  Smartphone,
  Laptop,
  Camera,
  Gamepad2,
  Package,
} from "lucide-react";
import type { Producto, Categoria } from "@/types";
import Reveal from "./Reveal";
import ProductoCard from "@/components/productos/ProductoCard";
import BotonFavorito from "@/components/productos/BotonFavorito";
import BtnCarritoCircular from "@/components/productos/BtnCarritoCircular";

function getCategoriaIcon(nombre: string) {
  const n = nombre.toLowerCase();
  if (/audio|audífono|auricular|parlante|sonido/.test(n)) return Headphones;
  if (/reloj|watch|smartwatch/.test(n)) return Watch;
  if (/hogar|casa|cocina|electrodom/.test(n)) return Home;
  if (/celular|tel[eé]fono|smartphone|m[oó]vil/.test(n)) return Smartphone;
  if (/computador|laptop|port[aá]til|\bpc\b/.test(n)) return Laptop;
  if (/c[aá]mara|foto/.test(n)) return Camera;
  if (/juego|gaming|consola/.test(n)) return Gamepad2;
  return Package;
}

export default function SeleccionExclusiva({
  destacado,
  secundario,
  categorias,
  masProductos,
}: {
  destacado?: Producto;
  secundario?: Producto;
  categorias: Categoria[];
  masProductos: Producto[];
}) {
  const categoriasBento = categorias.slice(0, 2);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#1C0A0A] leading-tight mb-2">
            Selección Exclusiva
          </h2>
          <p className="text-[#6B5B52]">Tecnología importada. Curada para ti.</p>
        </div>
        <Link
          href="/productos"
          className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#6a0008] hover:text-[#8C1A1A] transition-colors group cursor-pointer"
        >
          Ver todos los productos
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Tarjeta destacada grande */}
        {destacado && (
          <Reveal className="md:col-span-8">
            <Link
              href={`/producto/${destacado.slug}`}
              className="group relative block min-h-[400px] h-full rounded-lg overflow-hidden shadow-ambient bg-neutral-100"
            >
              <Image
                src={destacado.imagenes?.[0] ?? "/placeholder.png"}
                alt={destacado.nombre}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C0A0A]/80 via-[#1C0A0A]/20 to-transparent" />

              <div className="absolute inset-0 p-6 md:p-8 flex items-end justify-between gap-4">
                <div className="text-white max-w-md">
                  <span className="inline-flex items-center gap-1 bg-[#C9A84C] text-[#1C0A0A] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-3">
                    <Zap size={12} /> Entrega Hoy
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold mb-1 leading-tight">
                    {destacado.nombre}
                  </h3>
                  {destacado.descripcion && (
                    <p className="text-sm text-white/80 mb-3 line-clamp-2">{destacado.descripcion}</p>
                  )}
                  <p className="text-[#C9A84C] font-semibold">
                    ${destacado.precio_venta.toLocaleString("es-CO")}
                  </p>
                </div>
                <BtnCarritoCircular producto={destacado} />
              </div>
            </Link>
          </Reveal>
        )}

        {/* Tarjeta secundaria */}
        {secundario && (
          <Reveal delay={0.08} className="md:col-span-4">
            <div className="relative h-full min-h-[400px] flex flex-col p-6 bg-white rounded-lg shadow-ambient">
              <div className="absolute top-4 right-4 z-10">
                <BotonFavorito producto={secundario} size="md" />
              </div>
              <Link
                href={`/producto/${secundario.slug}`}
                className="group relative flex-1 overflow-hidden rounded-md mb-6 bg-neutral-50"
              >
                <Image
                  src={secundario.imagenes?.[0] ?? "/placeholder.png"}
                  alt={secundario.nombre}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </Link>
              <div>
                <h4 className="font-display text-xl font-medium text-[#1C0A0A] mb-1 line-clamp-1">
                  {secundario.nombre}
                </h4>
                {secundario.categoria?.nombre && (
                  <p className="text-xs text-[#6B5B52] mb-3">{secundario.categoria.nombre}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#6a0008]">
                    ${secundario.precio_venta.toLocaleString("es-CO")}
                  </span>
                  <Link
                    href={`/producto/${secundario.slug}`}
                    className="text-sm font-medium text-[#1C0A0A] hover:text-[#6a0008] underline underline-offset-4 transition-colors"
                  >
                    Comprar
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Tarjetas de categoría */}
        {categoriasBento.map((c, i) => {
          const Icon = getCategoriaIcon(c.nombre);
          return (
            <Reveal
              key={c.id}
              delay={0.16 + i * 0.08}
              className={categoriasBento.length === 1 ? "md:col-span-12" : "md:col-span-6"}
            >
              <Link
                href={`/productos?categoria=${c.slug}`}
                className="group flex items-center justify-between gap-6 p-8 h-full bg-white rounded-lg shadow-ambient border border-neutral-100 hover:border-[#6a0008]/30 transition-colors cursor-pointer"
              >
                <div>
                  <Icon size={32} className="text-[#6a0008] mb-4" />
                  <h3 className="font-display text-xl md:text-2xl text-[#1C0A0A] mb-2">{c.nombre}</h3>
                  {c.descripcion && <p className="text-sm text-[#6B5B52]">{c.descripcion}</p>}
                </div>
                <div className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-[#6a0008] group-hover:text-white group-hover:border-[#6a0008] transition-all shrink-0">
                  <ArrowRight size={18} />
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      {/* Más productos */}
      {masProductos.length > 0 && (
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {masProductos.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.08}>
              <ProductoCard producto={p} />
            </Reveal>
          ))}
        </div>
      )}

      <div className="mt-10 text-center sm:hidden">
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1C0A0A] text-white font-semibold rounded-md hover:bg-[#8C1A1A] transition-colors duration-200 cursor-pointer"
        >
          Ver catálogo completo
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
