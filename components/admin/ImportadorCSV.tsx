"use client";

import { useRef, useState, useTransition } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import {
  UploadCloud, Loader2, CircleCheck, CircleAlert,
  Download, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  importarProductosCSV,
  type FilaCSV,
  type ResultadoImportacion,
} from "@/app/(admin)/admin/importar/actions";

interface Categoria {
  slug: string;
  nombre: string;
}

const COLUMNAS_GUIA = [
  { col: "slug",                 req: true,  desc: "Identificador unico del producto. Solo letras minusculas, numeros y guiones. No puede repetirse.",       ej: "camiseta-negra-m" },
  { col: "nombre",               req: true,  desc: "Nombre visible del producto en la tienda.",                                                              ej: "Camiseta Negra Talla M" },
  { col: "categoria_slug",       req: false, desc: "Slug de la categoria (ver lista de categorias disponibles abajo). Dejar vacio si no aplica.",            ej: "ropa" },
  { col: "precio_contraentrega", req: true,  desc: "Precio cuando el cliente paga en efectivo al recibir el pedido. Al menos uno de los cuatro precios es obligatorio.", ej: "35000" },
  { col: "precio_tarjeta",       req: false, desc: "Precio pagando con tarjeta debito o credito.",                                                           ej: "32000" },
  { col: "precio_addi",          req: false, desc: "Precio con financiamiento Addi (paga despues).",                                                         ej: "30000" },
  { col: "precio_sistecredito",  req: false, desc: "Precio con Sistecredito.",                                                                               ej: "28000" },
  { col: "precio_anterior",      req: false, desc: "Precio antes del descuento. Se muestra tachado. Dejar vacio si no hay descuento.",                       ej: "40000" },
  { col: "stock",                req: false, desc: "Unidades disponibles. 0 o vacio = agotado.",                                                             ej: "10" },
  { col: "descripcion",          req: false, desc: "Descripcion del producto. Se recomienda 1-3 oraciones.",                                                 ej: "Camiseta de algodon 100%." },
  { col: "imagenes",             req: false, desc: "URLs de las fotos separadas por punto y coma (;). Las imagenes deben estar subidas a Cloudinary primero.", ej: "https://res.cloudinary.com/dknjydn9k/image/upload/v1/productos/camiseta.jpg" },
];

const COLUMNAS_PREVIA: { key: keyof FilaCSV; label: string }[] = [
  { key: "slug",                 label: "Slug" },
  { key: "nombre",               label: "Nombre" },
  { key: "categoria_slug",       label: "Categoria" },
  { key: "precio_contraentrega", label: "Contraentrega" },
  { key: "precio_tarjeta",       label: "Tarjeta" },
  { key: "stock",                label: "Stock" },
];

function csvFila(valores: string[]): string {
  return valores.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");
}

function generarPlantilla(categorias: Categoria[]) {
  const cat1 = categorias[0]?.slug ?? "";
  const cat2 = categorias[1]?.slug ?? cat1;
  const headers = COLUMNAS_GUIA.map((c) => c.col);

  // 3 filas de ejemplo — una imagen por producto (sin punto y coma) para evitar confusion
  const ejemplos = [
    [
      "producto-uno",
      "Nombre del Producto 1",
      cat1,
      "35000", "32000", "30000", "28000",
      "40000", "10",
      "Descripcion corta del producto.",
      "https://res.cloudinary.com/dknjydn9k/image/upload/v1/foto.jpg",
    ],
    [
      "producto-dos",
      "Nombre del Producto 2",
      cat2,
      "80000", "", "", "",
      "", "5",
      "Descripcion opcional.",
      "",
    ],
    [
      "producto-tres-agotado",
      "Nombre del Producto 3 (agotado)",
      cat1,
      "25000", "22000", "", "",
      "30000", "0",
      "",
      "",
    ],
  ];

  const lineas: string[] = [headers.join(",")];
  for (const fila of ejemplos) lineas.push(csvFila(fila));

  // Referencia de categorias al final — una por linea, solo las dos primeras columnas
  if (categorias.length > 0) {
    lineas.push("");
    lineas.push(csvFila(["CATEGORIAS DISPONIBLES — copia el slug en la columna categoria_slug", ""]));
    for (const c of categorias) {
      lineas.push(csvFila([c.slug, c.nombre]));
    }
  }

  const bom = "﻿"; // UTF-8 BOM para que Excel reconozca tildes
  const blob = new Blob([bom + lineas.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla-smartbga.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ImportadorCSV({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [archivo, setArchivo] = useState<File | null>(null);
  const [filas, setFilas] = useState<FilaCSV[]>([]);
  const [errorParseo, setErrorParseo] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
  const [errorImportacion, setErrorImportacion] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();
  const [arrastrando, setArrastrando] = useState(false);
  const [guiaAbierta, setGuiaAbierta] = useState(false);

  const procesarArchivo = (file: File) => {
    setArchivo(file);
    setResultado(null);
    setErrorImportacion(null);
    setErrorParseo(null);
    setFilas([]);

    Papa.parse<FilaCSV>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if (res.errors.length > 0) { setErrorParseo(res.errors[0].message); return; }
        // ignorar filas que son comentarios de la plantilla (slug empieza con #)
        const limpias = res.data.filter((f) => !String(f.slug ?? "").startsWith("#"));
        setFilas(limpias);
      },
      error: (err) => setErrorParseo(err.message),
    });
  };

  const confirmarImportacion = () => {
    setErrorImportacion(null);
    startTransition(async () => {
      try {
        const resumen = await importarProductosCSV(filas);
        setResultado(resumen);
        router.refresh();
      } catch (e) {
        setErrorImportacion(e instanceof Error ? e.message : "No se pudo importar el archivo");
      }
    });
  };

  const reiniciar = () => {
    setArchivo(null);
    setFilas([]);
    setResultado(null);
    setErrorImportacion(null);
    setErrorParseo(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const claseZona = arrastrando
    ? "border-[#8C1A1A] bg-[#8C1A1A]/5"
    : "border-neutral-200 bg-neutral-50 hover:border-neutral-300";

  return (
    <div className="flex flex-col gap-5 max-w-3xl">

      {/* Zona de subida */}
      {!archivo && (
        <div className="flex flex-col gap-3">
          <label
            className={"flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-colors " + claseZona}
            onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastrando(false);
              const file = e.dataTransfer.files[0];
              if (file) procesarArchivo(file);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) procesarArchivo(file);
              }}
            />
            <UploadCloud size={28} className={arrastrando ? "text-[#8C1A1A]" : "text-neutral-300"} />
            <div>
              <p className="text-sm font-semibold text-neutral-700">
                {arrastrando ? "Suelta el archivo aqui" : "Arrastra tu CSV aqui"}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">o haz clic para seleccionar el archivo</p>
            </div>
          </label>

          {/* Descarga plantilla */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-neutral-700">Descarga la plantilla</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Incluye 3 filas de ejemplo y las categorias disponibles
              </p>
            </div>
            <button
              type="button"
              onClick={() => generarPlantilla(categorias)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:border-[#8C1A1A] hover:text-[#8C1A1A] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download size={13} />
              Plantilla .CSV
            </button>
          </div>

          {/* Guia de columnas */}
          <div className="rounded-xl border border-neutral-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setGuiaAbierta((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Guia de columnas
              {guiaAbierta ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {guiaAbierta && (
              <div className="divide-y divide-neutral-100">
                {/* Tabla de columnas */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-neutral-50 text-left text-neutral-400 uppercase tracking-wider">
                        <th className="px-4 py-2.5 font-bold">Columna</th>
                        <th className="px-4 py-2.5 font-bold">Req.</th>
                        <th className="px-4 py-2.5 font-bold">Descripcion</th>
                        <th className="px-4 py-2.5 font-bold whitespace-nowrap">Ejemplo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {COLUMNAS_GUIA.map((c) => (
                        <tr key={c.col}>
                          <td className="px-4 py-2.5 font-mono text-neutral-800 whitespace-nowrap">{c.col}</td>
                          <td className="px-4 py-2.5">
                            {c.req
                              ? <span className="text-[#8C1A1A] font-bold">Si</span>
                              : <span className="text-neutral-400">No</span>}
                          </td>
                          <td className="px-4 py-2.5 text-neutral-500 leading-relaxed">{c.desc}</td>
                          <td className="px-4 py-2.5 font-mono text-neutral-600 whitespace-nowrap">{c.ej}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Categorias disponibles */}
                {categorias.length > 0 && (
                  <div className="px-4 py-4 bg-neutral-50">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      Categorias disponibles (usa el slug en la columna categoria_slug)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {categorias.map((c) => (
                        <div key={c.slug} className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5">
                          <span className="font-mono text-xs text-neutral-800">{c.slug}</span>
                          <span className="text-neutral-400 text-xs">—</span>
                          <span className="text-xs text-neutral-500">{c.nombre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {errorParseo && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          No se pudo leer el archivo: {errorParseo}
        </div>
      )}

      {/* Vista previa */}
      {archivo && filas.length > 0 && !resultado && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              <span className="font-semibold text-neutral-800">{archivo.name}</span>
              {" "}&mdash;{" "}
              {filas.length} {filas.length === 1 ? "producto detectado" : "productos detectados"}
            </p>
            <button
              type="button"
              onClick={reiniciar}
              className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              Cambiar archivo
            </button>
          </div>

          <div className="rounded-2xl border border-neutral-100 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-neutral-50 text-left font-bold tracking-wider text-neutral-400 uppercase">
                  {COLUMNAS_PREVIA.map((c) => (
                    <th key={c.key} className="px-3 py-2.5 whitespace-nowrap">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filas.slice(0, 8).map((fila, idx) => (
                  <tr key={idx}>
                    {COLUMNAS_PREVIA.map((c) => (
                      <td key={c.key} className="px-3 py-2 text-neutral-600 whitespace-nowrap max-w-[14rem] truncate">
                        {fila[c.key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {filas.length > 8 && (
              <p className="px-3 py-2 text-xs text-neutral-400 bg-neutral-50 border-t border-neutral-100">
                ... y {filas.length - 8} productos mas
              </p>
            )}
          </div>

          {errorImportacion && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errorImportacion}
            </div>
          )}

          <button
            type="button"
            onClick={confirmarImportacion}
            disabled={pendiente}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#8C1A1A] hover:bg-[#6B1313] text-white font-semibold rounded-2xl transition-colors disabled:opacity-50 cursor-pointer w-fit"
          >
            {pendiente && <Loader2 size={16} className="animate-spin" />}
            Importar {filas.length} {filas.length === 1 ? "producto" : "productos"}
          </button>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 px-5 py-4">
            <CircleCheck size={20} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-800">
              Importacion completa &mdash;{" "}
              <span className="font-semibold">{resultado.creados}</span> creados,{" "}
              <span className="font-semibold">{resultado.actualizados}</span> actualizados
              {resultado.errores.length > 0 && (
                <>, <span className="font-semibold">{resultado.errores.length}</span> con errores</>
              )}.
            </p>
          </div>

          {resultado.errores.length > 0 && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-2">
                <CircleAlert size={16} />
                Filas que no se importaron
              </p>
              <ul className="flex flex-col gap-1 text-xs text-amber-800">
                {resultado.errores.map((e, idx) => (
                  <li key={idx}>Fila {e.fila}: {e.mensaje}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={reiniciar}
            className="px-6 py-3 text-sm font-semibold text-[#8C1A1A] hover:underline cursor-pointer w-fit"
          >
            Importar otro archivo
          </button>
        </div>
      )}
    </div>
  );
}
