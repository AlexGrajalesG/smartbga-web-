import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { getEmpleadoActual } from "@/lib/auth/empleado";
import { Package, PackageX, Tag, ArrowRight } from "lucide-react";

export default async function AdminDashboardPage() {
  const empleado = await getEmpleadoActual();
  const esAdmin = empleado?.rol === "admin";
  const admin = createAdminClient();

  let query = admin.from("productos").select("id, stock, activo", { count: "exact" });
  if (!esAdmin && empleado?.proveedor_id) {
    query = query.eq("proveedor_id", empleado.proveedor_id);
  }
  const { data: productos } = await query;

  const activos = productos?.filter((p) => p.activo).length ?? 0;
  const agotados = productos?.filter((p) => p.activo && p.stock === 0).length ?? 0;
  const total = productos?.length ?? 0;

  const TARJETAS = [
    { label: "Productos activos", valor: activos, icon: Package },
    { label: "Agotados", valor: agotados, icon: PackageX },
    { label: "Total en catálogo", valor: total, icon: Tag },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase mb-1">
          {esAdmin ? "Administración" : "Mi catálogo"}
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1C0A0A]">
          Hola, {empleado?.nombre.split(" ")[0]}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TARJETAS.map(({ label, valor, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
            <div className="w-9 h-9 rounded-xl bg-[#8C1A1A]/8 flex items-center justify-center mb-3">
              <Icon size={17} className="text-[#8C1A1A]" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{valor}</p>
            <p className="text-xs text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#8C1A1A] text-white font-semibold rounded-2xl hover:bg-[#6B1313] transition-colors cursor-pointer"
        >
          Publicar producto
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/admin/importar"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-2xl hover:border-[#8C1A1A] hover:text-[#8C1A1A] transition-colors cursor-pointer"
        >
          Importar catálogo (CSV)
        </Link>
      </div>
    </div>
  );
}
