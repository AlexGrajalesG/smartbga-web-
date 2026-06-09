"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, Copy, Check, X, AlertCircle } from "lucide-react";
import { subirImagenesImportador } from "@/app/(admin)/admin/importar/actions";

interface ImagenSubida {
  nombre: string;
  url: string;
  copiada: boolean;
}

export default function UploadImagenesImportador() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imagenes, setImagenes] = useState<ImagenSubida[]>([]);
  const [errores, setErrores] = useState<string[]>([]);
  const [pendiente, startTransition] = useTransition();
  const [arrastrando, setArrastrando] = useState(false);

  const subirArchivos = (archivos: FileList | null) => {
    if (!archivos || archivos.length === 0) return;

    const formData = new FormData();
    Array.from(archivos).forEach((f) => formData.append("imagenes", f));

    setErrores([]);

    startTransition(async () => {
      const result = await subirImagenesImportador(formData);
      const nuevas: ImagenSubida[] = result.urls.map((url) => ({
        nombre: url.split("/").pop() ?? url,
        url,
        copiada: false,
      }));
      setImagenes((prev) => [...prev, ...nuevas]);
      if (result.errores.length > 0) setErrores(result.errores);
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  const copiar = (url: string) => {
    navigator.clipboard.writeText(url);
    setImagenes((prev) =>
      prev.map((img) => img.url === url ? { ...img, copiada: true } : img)
    );
    setTimeout(() => {
      setImagenes((prev) =>
        prev.map((img) => img.url === url ? { ...img, copiada: false } : img)
      );
    }, 2000);
  };

  const quitar = (url: string) => {
    setImagenes((prev) => prev.filter((img) => img.url !== url));
  };

  const copiarTodas = () => {
    const todas = imagenes.map((img) => img.url).join(";");
    navigator.clipboard.writeText(todas);
  };

  const claseZona = arrastrando
    ? "border-[#8C1A1A] bg-[#8C1A1A]/5"
    : "border-neutral-200 bg-neutral-50 hover:border-neutral-300";

  return (
    <div className="flex flex-col gap-4">
      {/* Zona de subida */}
      <label
        className={"flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 cursor-pointer transition-colors " + claseZona}
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          subirArchivos(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => subirArchivos(e.target.files)}
        />
        {pendiente ? (
          <Loader2 size={20} className="text-[#8C1A1A] animate-spin" />
        ) : (
          <ImagePlus size={20} className={arrastrando ? "text-[#8C1A1A]" : "text-neutral-300"} />
        )}
        <div>
          <p className="text-sm font-semibold text-neutral-700">
            {pendiente ? "Subiendo..." : arrastrando ? "Suelta las imagenes aqui" : "Arrastra las fotos aqui"}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            JPG, PNG, WebP — hasta 20 imagenes a la vez
          </p>
        </div>
      </label>

      {/* Errores */}
      {errores.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>No se pudo subir: {errores.join(", ")}</span>
        </div>
      )}

      {/* URLs resultantes */}
      {imagenes.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {imagenes.length} {imagenes.length === 1 ? "imagen subida" : "imagenes subidas"}
            </p>
            {imagenes.length > 1 && (
              <button
                type="button"
                onClick={copiarTodas}
                className="text-xs font-semibold text-[#8C1A1A] hover:underline cursor-pointer"
              >
                Copiar todas (separadas por ;)
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            {imagenes.map((img) => (
              <div
                key={img.url}
                className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-white px-3 py-2.5"
              >
                {/* Miniatura */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover shrink-0 bg-neutral-100"
                />

                {/* URL */}
                <span className="flex-1 text-xs text-neutral-500 font-mono truncate min-w-0">
                  {img.url}
                </span>

                {/* Copiar */}
                <button
                  type="button"
                  onClick={() => copiar(img.url)}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold transition-colors cursor-pointer hover:border-[#8C1A1A] hover:text-[#8C1A1A]"
                >
                  {img.copiada ? (
                    <><Check size={12} className="text-green-600" /> Copiado</>
                  ) : (
                    <><Copy size={12} /> Copiar</>
                  )}
                </button>

                {/* Quitar */}
                <button
                  type="button"
                  onClick={() => quitar(img.url)}
                  className="shrink-0 p-1 text-neutral-300 hover:text-neutral-600 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-neutral-400">
            Pega la URL en la columna <span className="font-mono">imagenes</span> del CSV.
            Para varios productos, separa las URLs con punto y coma (;).
          </p>
        </div>
      )}
    </div>
  );
}
