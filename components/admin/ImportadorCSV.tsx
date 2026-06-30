"use client";

import { useRef, useState, useTransition } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
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

// Convierte texto a slug: "Camiseta Roja M" -> "camiseta-roja-m"
function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Columnas amigables que se muestran en la plantilla
const HEADERS_AMIGABLES = [
  "nombre",
  "categoria",
  "descripcion",
  "unidades",
  "precio",
  "fotos",
  "video",
];

// Guia de columnas con nombres amigables
const COLUMNAS_GUIA = [
  { col: "nombre",          req: true,  desc: "Nombre visible del producto en la tienda.",                                                                      ej: "Crema Hidratante 200ml" },
  { col: "categoria",       req: false, desc: "Slug de la categoria. Ver la lista de categorias disponibles abajo.",                                            ej: "belleza-cuidado-personal" },
  { col: "descripcion",     req: false, desc: "Descripcion del producto. Se recomienda 1-3 oraciones.",                                                         ej: "Crema hidratante para uso diario." },
  { col: "unidades",        req: false, desc: "Cantidad disponible. 0 o vacio = agotado.",                                                                      ej: "10" },
  { col: "precio",          req: true,  desc: "Precio de venta del producto.",                                          ej: "35000" },
  { col: "fotos",           req: false, desc: "URL de la foto del producto (sube las fotos en el Paso 1 y pega la URL aqui). Para varias fotos separalas con ;", ej: "https://res.cloudinary.com/.../foto.jpg" },
  { col: "video",           req: false, desc: "Link del video en Instagram o TikTok del producto. Se muestra en la pagina del producto.",                       ej: "https://www.instagram.com/reel/XXXXX/" },
];

// Columnas a mostrar en la vista previa
const COLUMNAS_PREVIA: { key: keyof FilaCSV; label: string }[] = [
  { key: "nombre",               label: "Nombre" },
  { key: "categoria_slug",       label: "Categoria" },
  { key: "precio_contraentrega", label: "Precio" },
  { key: "stock",                label: "Unidades" },
  { key: "imagenes",             label: "Fotos" },
];

// Calcula precio con porcentaje adicional, redondeado a centenas
function conRecargo(base: number, pct: number): string {
  return String(Math.round((base * (1 + pct / 100)) / 100) * 100);
}

// Transforma una fila con nombres amigables a FilaCSV (nombres internos)
// Si no vienen precio_tarjeta/addi/sistecredito, los calcula automaticamente:
//   tarjeta +3%, addi +12%, sistecredito +25%
function normalizarFila(raw: Record<string, string>): FilaCSV {
  const nombre = (raw.nombre ?? "").trim();
  const slug = (raw.slug ?? "").trim() || slugify(nombre);
  const precioBase = Number((raw.precio ?? raw.precio_contraentrega ?? "").replace(/\D/g, ""));
  const tieneBase = precioBase > 0;

  return {
    slug,
    nombre,
    categoria_slug: raw.categoria ?? raw.categoria_slug,
    precio_contraentrega: raw.precio ?? raw.precio_contraentrega,
    precio_tarjeta:      raw.precio_tarjeta      || (tieneBase ? conRecargo(precioBase, 3)  : ""),
    precio_addi:         raw.precio_addi         || (tieneBase ? conRecargo(precioBase, 12) : ""),
    precio_sistecredito: raw.precio_sistecredito || (tieneBase ? conRecargo(precioBase, 25) : ""),
    precio_anterior: raw.precio_anterior,
    stock: raw.unidades ?? raw.stock,
    descripcion: raw.descripcion,
    imagenes: raw.fotos ?? raw.imagenes,
    video_url: raw.video ?? raw.video_url,
  };
}

function generarPlantilla(categorias: Categoria[]) {
  const cat1 = categorias[0]?.slug ?? "";

  // Hoja 1: datos a llenar
  const filasDatos: string[][] = [
    HEADERS_AMIGABLES,
    ["Crema Hidratante 200ml",     cat1, "Crema de uso diario con aloe vera. Ideal para piel seca.", "10", "35000", "", ""],
    ["Shampoo Anticaspa 400ml",    cat1, "",                                                          "5",  "22000", "", "https://www.instagram.com/reel/XXXXX/"],
    ["Mascarilla Facial Vitamina", cat1, "",                                                          "0",  "18000", "", ""],
  ];

  const hojaProductos = XLSX.utils.aoa_to_sheet(filasDatos);
  hojaProductos["!cols"] = [
    { wch: 38 }, // nombre
    { wch: 28 }, // categoria
    { wch: 65 }, // descripcion — ancha para copy-paste
    { wch: 12 }, // unidades
    { wch: 12 }, // precio
    { wch: 65 }, // fotos
    { wch: 50 }, // video
  ];

  // Altura fija en 200 filas — impide que la fila se ensanche al pegar texto largo
  hojaProductos["!rows"] = Array.from({ length: 200 }, () => ({ hpt: 20 }));

  // Desactivar wrap de texto en todas las celdas existentes
  const range = XLSX.utils.decode_range(hojaProductos["!ref"] ?? "A1");
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const ref = XLSX.utils.encode_cell({ r: R, c: C });
      if (!hojaProductos[ref]) continue;
      hojaProductos[ref].s = { alignment: { wrapText: false } };
    }
  }

  // Hoja 2: referencia de categorias y columnas
  const filasRef: string[][] = [
    ["CATEGORÍAS DISPONIBLES", ""],
    ["slug (pega este valor en la columna 'categoria')", "nombre"],
    ...categorias.map((c) => [c.slug, c.nombre]),
    [],
    ["GUÍA DE COLUMNAS", ""],
    ...COLUMNAS_GUIA.map((c) => [c.col, (c.req ? "REQUERIDO — " : "") + c.desc, c.ej]),
  ];

  const hojaRef = XLSX.utils.aoa_to_sheet(filasRef);
  hojaRef["!cols"] = [{ wch: 42 }, { wch: 60 }, { wch: 50 }];

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hojaProductos, "Productos");
  XLSX.utils.book_append_sheet(libro, hojaRef, "Referencia");

  const buffer = XLSX.write(libro, { bookType: "xlsx", type: "array", cellStyles: true });
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla-smartbga.xlsx";
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

  const procesarFilas = (data: Record<string, unknown>[]) => {
    const limpias = data
      .map((fila) => {
        const texto: Record<string, string> = {};
        for (const [clave, valor] of Object.entries(fila)) {
          texto[clave] = valor == null ? "" : String(valor).trim();
        }
        return texto;
      })
      .filter((f) => !String(f.slug ?? f.nombre ?? "").startsWith("#") && !String(f.nombre ?? "").startsWith("CATEGORIAS"))
      .map(normalizarFila);
    setFilas(limpias);
  };

  const procesarArchivo = (file: File) => {
    setArchivo(file);
    setResultado(null);
    setErrorImportacion(null);
    setErrorParseo(null);
    setFilas([]);

    const esExcel = /\.(xlsx|xls)$/i.test(file.name);

    if (esExcel) {
      file.arrayBuffer()
        .then((buffer) => {
          const libro = XLSX.read(buffer, { type: "array" });
          const hoja = libro.Sheets[libro.SheetNames[0]];
          const filasExcel = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, { defval: "" });
          procesarFilas(filasExcel);
        })
        .catch((err) => setErrorParseo(err instanceof Error ? err.message : "No se pudo leer el archivo Excel"));
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: "",   // auto-detecta , o ; segun el archivo
      complete: (res) => {
        if (res.errors.length > 0) { setErrorParseo(res.errors[0].message); return; }
        procesarFilas(res.data);
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

      {!archivo && (
        <div className="flex flex-col gap-3">
          {/* Zona de subida */}
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
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) procesarArchivo(file);
              }}
            />
            <UploadCloud size={28} className={arrastrando ? "text-[#8C1A1A]" : "text-neutral-300"} />
            <div>
              <p className="text-sm font-semibold text-neutral-700">
                {arrastrando ? "Suelta el archivo aqui" : "Arrastra tu Excel aqui"}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">o haz clic para seleccionar el archivo (.xlsx, .xls, .csv)</p>
            </div>
          </label>

          {/* Descarga plantilla */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-neutral-700">Descarga la plantilla</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Columnas en espanol, 3 filas de ejemplo y lista de categorias
              </p>
            </div>
            <button
              type="button"
              onClick={() => generarPlantilla(categorias)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:border-[#8C1A1A] hover:text-[#8C1A1A] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download size={13} />
              Plantilla .XLSX
            </button>
          </div>

          {/* Guia de columnas */}
          <div className="rounded-xl border border-neutral-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setGuiaAbierta((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Que significa cada columna?
              {guiaAbierta ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {guiaAbierta && (
              <div className="divide-y divide-neutral-100">
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
                          <td className="px-4 py-2.5 text-neutral-500 leading-relaxed max-w-xs">{c.desc}</td>
                          <td className="px-4 py-2.5 font-mono text-neutral-600 whitespace-nowrap text-[10px]">{c.ej}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {categorias.length > 0 && (
                  <div className="px-4 py-4 bg-neutral-50">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      Categorias disponibles
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {categorias.map((c) => (
                        <div key={c.slug} className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5">
                          <span className="font-mono text-xs text-neutral-800">{c.slug}</span>
                          <span className="text-neutral-300 text-xs">|</span>
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
