"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Loader2, ImagePlus } from "lucide-react";
import SubidorImagenes from "./SubidorImagenes";
import type { Producto, Categoria, Proveedor, NivelPrecio } from "@/types";

const NIVELES: { key: NivelPrecio; label: string }[] = [
  { key: "contraentrega", label: "Contraentrega" },
  { key: "tarjeta", label: "Tarjeta o PSE" },
  { key: "addi", label: "Addi" },
  { key: "sistecredito", label: "Sistecrédito" },
];

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  producto?: Producto;
  categorias: Categoria[];
  proveedores?: Proveedor[];
  esAdmin: boolean;
  accion: (formData: FormData) => Promise<{ id: string } | void>;
}

export default function ProductoForm({ producto, categorias, proveedores, esAdmin, accion }: Props) {
  const router = useRouter();
  const editando = !!producto;

  const [slug, setSlug] = useState(producto?.slug ?? "");
  const [slugManual, setSlugManual] = useState(editando);
  const [imagenes, setImagenes] = useState<string[]>(producto?.imagenes ?? []);
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onNombreChange = (valor: string) => {
    if (!slugManual) setSlug(slugify(valor));
  };

  const quitarImagen = (idx: number) => setImagenes((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = (formData: FormData) => {
    setError(null);
    formData.set("slug", slug);
    formData.set("imagenes", JSON.stringify(imagenes));

    startTransition(async () => {
      try {
        const resultado = await accion(formData);
        if (resultado && "id" in resultado) {
          router.push(`/admin/productos/${resultado.id}`);
        } else {
          router.push("/admin/productos");
        }
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ocurrió un error al guardar");
      }
    });
  };

  return (
    <form action={onSubmit} className="flex flex-col gap-7 max-w-2xl">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Datos básicos */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase mb-1">
          Información básica
        </legend>

        <Campo label="Nombre del producto">
          <input
            name="nombre"
            defaultValue={producto?.nombre}
            onChange={(e) => onNombreChange(e.target.value)}
            required
            className="input"
          />
        </Campo>

        <Campo label="Slug (URL)" hint="Solo minúsculas, números y guiones — ej: cepillo-secador-vgr">
          <input
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugManual(true);
            }}
            required
            pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
            className="input font-mono text-sm"
          />
        </Campo>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Categoría">
            <select name="categoria_id" defaultValue={producto?.categoria_id ?? ""} className="input">
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </Campo>

          {esAdmin && proveedores && (
            <Campo label="Proveedor">
              <select name="proveedor_id" defaultValue={producto?.proveedor_id ?? ""} className="input">
                <option value="">Sin proveedor (propio)</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </Campo>
          )}
        </div>

        <Campo label="Descripción">
          <textarea
            name="descripcion"
            defaultValue={producto?.descripcion ?? ""}
            rows={6}
            className="input resize-y"
          />
        </Campo>

        <Campo label="Video (Instagram o TikTok)" hint="Pega el link tal cual lo copias de la app (con reel/, p/ o video/) — se ajusta solo para mostrarse en la página">
          <input
            name="video_url"
            type="url"
            defaultValue={producto?.video_url ?? ""}
            placeholder="https://www.instagram.com/reel/... o https://www.tiktok.com/..."
            className="input"
          />
        </Campo>
      </fieldset>

      {/* Precio y stock */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase mb-1">
          Precio y disponibilidad
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Campo label="Precio de venta" hint="El precio de referencia: el que se ve en catálogo y carrito">
            <input
              type="number"
              name="precio_venta"
              defaultValue={producto?.precio_venta}
              min={0}
              step="100"
              required
              className="input"
            />
          </Campo>
          <Campo label="Precio anterior" hint="Opcional — para mostrar descuento">
            <input
              type="number"
              name="precio_anterior"
              defaultValue={producto?.precio_anterior ?? ""}
              min={0}
              step="100"
              className="input"
            />
          </Campo>
          <Campo label="Stock">
            <input
              type="number"
              name="stock"
              defaultValue={producto?.stock ?? 0}
              min={0}
              required
              className="input"
            />
          </Campo>
        </div>
      </fieldset>

      {/* Precios por método de pago */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase mb-1">
          Precios por método de pago (opcional)
        </legend>
        <p className="text-xs text-neutral-400 -mt-2">
          Si los llenas, se muestran como desglose en la página del producto. Recomendado: que
          &quot;Precio de venta&quot; arriba coincida con el más bajo de estos (normalmente contraentrega).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {NIVELES.map(({ key, label }) => (
            <Campo key={key} label={label}>
              <input
                type="number"
                name={`precio_${key}`}
                defaultValue={producto?.precios?.[key] ?? ""}
                min={0}
                step="100"
                className="input"
              />
            </Campo>
          ))}
        </div>
      </fieldset>

      {/* Imágenes */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase mb-1">
          Imágenes
        </legend>

        {imagenes.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {imagenes.map((url, idx) => (
              <div key={url + idx} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 group">
                <Image src={url} alt={`Imagen ${idx + 1}`} fill className="object-cover" sizes="160px" />
                <button
                  type="button"
                  onClick={() => quitarImagen(idx)}
                  aria-label="Quitar imagen"
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/80"
                >
                  <X size={14} />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-white/90 text-neutral-700 px-2 py-0.5 rounded-full">
                    Portada
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <SubidorImagenes
          slug={slug || "producto"}
          onSubidas={(urls) => setImagenes((prev) => [...prev, ...urls])}
        />

        {imagenes.length === 0 && (
          <p className="text-xs text-neutral-400 flex items-center gap-1.5">
            <ImagePlus size={13} />
            La primera imagen que agregues será la portada del producto.
          </p>
        )}
      </fieldset>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pendiente}
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#8C1A1A] hover:bg-[#6B1313] text-white font-semibold rounded-2xl transition-colors disabled:opacity-50 cursor-pointer"
        >
          {pendiente && <Loader2 size={16} className="animate-spin" />}
          {editando ? "Guardar cambios" : "Publicar producto"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3.5 text-sm font-medium text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e5e5e5;
          border-radius: 0.875rem;
          padding: 0.7rem 1rem;
          font-size: 0.875rem;
          color: #171717;
          background: white;
          transition: border-color 0.15s;
        }
        .input:focus {
          outline: none;
          border-color: #8c1a1a;
        }
      `}</style>
    </form>
  );
}

function Campo({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
      {hint && <span className="text-xs text-neutral-400">{hint}</span>}
    </label>
  );
}
