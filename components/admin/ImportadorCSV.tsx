"use client";

import { useRef, useState, useTransition } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, CircleCheck, CircleAlert } from "lucide-react";
import { importarProductosCSV, type FilaCSV, type ResultadoImportacion } from "@/app/(admin)/admin/importar/actions";

const COLUMNAS_PREVIA: { key: keyof FilaCSV; label: string }[] = [
  { key: "slug", label: "Slug" },
  { key: "nombre", label: "Nombre" },
  { key: "categoria_slug", label: "Categoría" },
  { key: "precio_contraentrega", label: "Contraentrega" },
  { key: "precio_tarjeta", label: "Tarjeta" },
  { key: "precio_addi", label: "Addi" },
  { key: "precio_sistecredito", label: "Sistecrédito" },
  { key: "stock", label: "Stock" },
];

export default function ImportadorCSV() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [archivo, setArchivo] = useState<File | null>(null);
  const [filas, setFilas] = useState<FilaCSV[]>([]);
  const [errorParseo, setErrorParseo] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
  const [errorImportacion, setErrorImportacion] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const procesarArchivo = (file: File) => {
    setArchivo(file);
    setResultado(null);
    setErrorImportacion(null);
    setErrorParseo(null);
    setFilas([]);

    Papa.parse<FilaCSV>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (resultados) => {
        if (resultados.errors.length > 0) {
          setErrorParseo(resultados.errors[0].message);
          return;
        }
        setFilas(resultados.data);
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

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {!archivo && (
        <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center cursor-pointer hover:border-neutral-300 transition-colors">
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
          <UploadCloud size={22} className="text-neutral-400" />
          <p className="text-sm text-neutral-600">
            <span className="font-semibold text-[#8C1A1A]">Haz clic para subir</span> tu archivo CSV
          </p>
          <p className="text-xs text-neutral-400">
            Columnas: slug, nombre, categoria_slug, precio_contraentrega, precio_tarjeta, precio_addi,
            precio_sistecredito, precio_anterior, stock, descripcion, imagenes (URLs separadas por “;”)
          </p>
        </label>
      )}

      {errorParseo && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          No se pudo leer el archivo: {errorParseo}
        </div>
      )}

      {archivo && filas.length > 0 && !resultado && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              <span className="font-semibold text-neutral-800">{archivo.name}</span> — {filas.length}{" "}
              {filas.length === 1 ? "fila detectada" : "filas detectadas"}
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
              <p className="px-3 py-2 text-xs text-neutral-400 bg-neutral-50">
                … y {filas.length - 8} filas más
              </p>
            )}
          </div>

          {errorImportacion && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errorImportacion}
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={confirmarImportacion}
              disabled={pendiente}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#8C1A1A] hover:bg-[#6B1313] text-white font-semibold rounded-2xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              {pendiente && <Loader2 size={16} className="animate-spin" />}
              Importar {filas.length} {filas.length === 1 ? "producto" : "productos"}
            </button>
          </div>
        </div>
      )}

      {resultado && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 px-5 py-4">
            <CircleCheck size={20} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-800">
              Importación completa — <span className="font-semibold">{resultado.creados}</span> creados,{" "}
              <span className="font-semibold">{resultado.actualizados}</span> actualizados
              {resultado.errores.length > 0 && (
                <>, <span className="font-semibold">{resultado.errores.length}</span> con errores</>
              )}
              .
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
                  <li key={idx}>
                    Fila {e.fila}: {e.mensaje}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={reiniciar}
              className="px-6 py-3 text-sm font-semibold text-[#8C1A1A] hover:underline cursor-pointer"
            >
              Importar otro archivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
