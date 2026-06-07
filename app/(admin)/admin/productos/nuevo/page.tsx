import { createAdminClient } from "@/lib/supabase/server";
import { getEmpleadoActual } from "@/lib/auth/empleado";
import { getCategorias } from "@/lib/supabase/queries";
import ProductoForm from "@/components/admin/ProductoForm";
import { crearProducto } from "../actions";
import type { Proveedor } from "@/types";

export default async function NuevoProductoPage() {
  const empleado = await getEmpleadoActual();
  const esAdmin = empleado?.rol === "admin";
  const categorias = await getCategorias();

  let proveedores: Proveedor[] | undefined;
  if (esAdmin) {
    const admin = createAdminClient();
    const { data } = await admin.from("proveedores").select("*").eq("activo", true).order("nombre");
    proveedores = data ?? [];
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase mb-1">Catálogo</p>
        <h1 className="font-display text-3xl font-semibold text-[#1C0A0A]">Publicar producto</h1>
      </div>

      <ProductoForm categorias={categorias} proveedores={proveedores} esAdmin={esAdmin} accion={crearProducto} />
    </div>
  );
}
