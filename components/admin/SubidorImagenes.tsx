"use client";

import { useRef, useState, useTransition } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { subirImagenesProducto } from "@/app/(admin)/admin/productos/actions";

interface Props {
  slug: string;
  onSubidas: (urls: string[]) => void;
}

export default function SubidorImagenes({ slug, onSubidas }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const subir = (archivos: FileList | File[]) => {
    const MAX_MB = 5;
    const lista = Array.from(archivos).filter((a) => {
      if (!a.type.startsWith("image/")) return false;
      if (a.size > MAX_MB * 1024 * 1024) {
        setError(`"${a.name}" supera los ${MAX_MB} MB permitidos.`);
        return false;
      }
      return true;
    });
    if (lista.length === 0) return;

    setError(null);
    const formData = new FormData();
    formData.set("slug", slug);
    lista.forEach((archivo) => formData.append("archivos", archivo));

    startTransition(async () => {
      try {
        const { urls } = await subirImagenesProducto(formData);
        if (urls.length > 0) onSubidas(urls);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudieron subir las imágenes");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          if (e.dataTransfer.files.length > 0) subir(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${
          arrastrando
            ? "border-[#8C1A1A] bg-[#8C1A1A]/5"
            : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) subir(e.target.files);
            e.target.value = "";
          }}
        />
        {pendiente ? (
          <Loader2 size={20} className="animate-spin text-[#8C1A1A]" />
        ) : (
          <UploadCloud size={20} className="text-neutral-400" />
        )}
        <p className="text-sm text-neutral-600">
          <span className="font-semibold text-[#8C1A1A]">Haz clic para subir</span> o arrastra imágenes aquí
        </p>
        <p className="text-xs text-neutral-400">JPG o PNG — se suben directo a Cloudinary</p>
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
