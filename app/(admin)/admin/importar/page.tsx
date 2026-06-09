import ImportadorCSV from "@/components/admin/ImportadorCSV";
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
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase mb-1">Catalogo</p>
        <h1 className="font-display text-3xl font-semibold text-[#1C0A0A]">Importar catalogo</h1>
        <p className="text-sm text-neutral-500 mt-1.5 max-w-xl">
          Sube un archivo CSV para crear o actualizar varios productos a la vez.
          Si el slug ya existe el producto se actualiza; si no, se crea.
        </p>
      </div>

      <ImportadorCSV categorias={categorias ?? []} />
    </div>
  );
}
