import ImportadorCSV from "@/components/admin/ImportadorCSV";
import UploadImagenesImportador from "@/components/admin/UploadImagenesImportador";
import { createAdminClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Importar catalogo — Admin SmartBga" };

export default async function ImportarCatalogoPage() {
  const admin = createAdminClient();
  const { data: categorias } = await admin
    .from("categorias")
    .select("slug, nombre")
    .order("nombre");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase mb-1">Catalogo</p>
        <h1 className="font-display text-3xl font-semibold text-[#1C0A0A]">Importar catalogo</h1>
        <p className="text-sm text-neutral-500 mt-1.5 max-w-xl">
          Sube un archivo CSV o Excel (.xlsx) para crear o actualizar varios productos a la vez.
          Si el slug ya existe el producto se actualiza; si no, se crea.
        </p>
      </div>

      {/* Paso 1: subir imagenes y obtener URLs */}
      <section className="flex flex-col gap-3 max-w-3xl">
        <div>
          <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase mb-0.5">Paso 1 (opcional)</p>
          <h2 className="text-lg font-semibold text-neutral-900">Subir fotos</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Sube las fotos de los productos y copia las URLs para pegarlas en el CSV.
          </p>
        </div>
        <UploadImagenesImportador />
      </section>

      {/* Paso 2: importar CSV */}
      <section className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase mb-0.5">Paso 2</p>
          <h2 className="text-lg font-semibold text-neutral-900">Importar CSV</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Descarga la plantilla, completa los datos y sube el archivo.
          </p>
        </div>
        <ImportadorCSV categorias={categorias ?? []} />
      </section>
    </div>
  );
}
