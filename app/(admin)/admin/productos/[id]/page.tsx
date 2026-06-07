import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { getEmpleadoActual } from "@/lib/auth/empleado";
import { getCategorias } from "@/lib/supabase/queries";
import ProductoForm from "@/components/admin/ProductoForm";
import { actualizarProducto } from "../actions";
import type { Proveedor } from "@/types";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const empleado = await getEmpleadoActual();
  const esAdmin = empleado?.rol === "admin";
  const admin = createAdminClient();

  const { data: producto } = await admin.from("productos").select("*").eq("id", id).single();
  if (!producto) notFound();
  if (!esAdmin && producto.proveedor_id !== empleado?.proveedor_id) notFound();

  const categorias = await getCategorias();

  let proveedores: Proveedor[] | undefined;
  if (esAdmin) {
    const { data } = await admin.from("proveedores").select("*").eq("activo", true).order("nombre");
    proveedores = data ?? [];
  }

  const accion = actualizarProducto.bind(null, producto.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase mb-1">Catálogo</p>
        <h1 className="font-display text-3xl font-semibold text-[#1C0A0A]">{producto.nombre}</h1>
      </div>

      <ProductoForm producto={producto} categorias={categorias} proveedores={proveedores} esAdmin={esAdmin} accion={accion} />
    </div>
  );
}
