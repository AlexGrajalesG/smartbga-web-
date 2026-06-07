import Link from "next/link";
import Image from "next/image";
import { Plus, ImageOff } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { getEmpleadoActual } from "@/lib/auth/empleado";
import BotonEstadoProducto from "@/components/admin/BotonEstadoProducto";

const formatoCOP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

interface FilaProducto {
  id: string;
  nombre: string;
  slug: string;
  precio_venta: number;
  stock: number;
  activo: boolean;
  imagenes: string[];
  categoria: { nombre: string } | null;
  proveedor: { nombre: string } | null;
}

export default async function AdminProductosPage() {
  const empleado = await getEmpleadoActual();
  const esAdmin = empleado?.rol === "admin";
  const admin = createAdminClient();

  let query = admin
    .from("productos")
    .select("id, nombre, slug, precio_venta, stock, activo, imagenes, categoria:categorias(nombre), proveedor:proveedores(nombre)")
    .order("created_at", { ascending: false });

  if (!esAdmin && empleado?.proveedor_id) {
    query = query.eq("proveedor_id", empleado.proveedor_id);
  }

  const { data: productos } = await query;
  const lista = (productos ?? []) as unknown as FilaProducto[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase mb-1">Catálogo</p>
          <h1 className="font-display text-3xl font-semibold text-[#1C0A0A]">Productos</h1>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#8C1A1A] text-white text-sm font-semibold rounded-2xl hover:bg-[#6B1313] transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Publicar producto
        </Link>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 px-6 py-16 text-center">
          <p className="text-neutral-500 text-sm">Todavía no has publicado productos.</p>
          <Link href="/admin/productos/nuevo" className="text-[#8C1A1A] text-sm font-semibold hover:underline">
            Publica el primero
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-bold tracking-wider text-neutral-400 uppercase">
                <th className="px-4 py-3 font-bold">Producto</th>
                {esAdmin && <th className="px-4 py-3 font-bold hidden md:table-cell">Proveedor</th>}
                <th className="px-4 py-3 font-bold hidden sm:table-cell">Categoría</th>
                <th className="px-4 py-3 font-bold text-right">Precio</th>
                <th className="px-4 py-3 font-bold text-right">Stock</th>
                <th className="px-4 py-3 font-bold text-center">Estado</th>
                <th className="px-4 py-3 font-bold text-right">&nbsp;</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {lista.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 shrink-0">
                        {p.imagenes?.[0] ? (
                          <Image src={p.imagenes[0]} alt={p.nombre} fill className="object-cover" sizes="44px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <ImageOff size={16} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-800 truncate">{p.nombre}</p>
                        <p className="text-xs text-neutral-400 truncate font-mono">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  {esAdmin && (
                    <td className="px-4 py-3 text-neutral-500 hidden md:table-cell">
                      {p.proveedor?.nombre ?? "—"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell">
                    {p.categoria?.nombre ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-800 whitespace-nowrap">
                    {formatoCOP.format(p.precio_venta)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.stock === 0 ? "text-red-600 font-medium" : "text-neutral-600"}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <BotonEstadoProducto productoId={p.id} activo={p.activo} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/productos/${p.id}`}
                      className="text-xs font-semibold text-[#8C1A1A] hover:underline whitespace-nowrap"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
