"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tag, Upload, ArrowLeft } from "lucide-react";
import type { Empleado } from "@/types";

const ENLACES = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard, soloAdmin: false, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package, soloAdmin: false, exact: false },
  { href: "/admin/categorias", label: "Categorías", icon: Tag, soloAdmin: true, exact: false },
  { href: "/admin/importar", label: "Importar catálogo", icon: Upload, soloAdmin: false, exact: false },
];

export default function AdminSidebar({ empleado }: { empleado: Empleado }) {
  const pathname = usePathname();
  const esAdmin = empleado.rol === "admin";

  return (
    <aside className="w-full md:w-60 md:shrink-0 md:border-r md:border-neutral-100 md:min-h-[calc(100vh-4rem)] bg-white">
      <div className="p-4 md:p-5">
        <p className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase mb-0.5">
          Panel
        </p>
        <p className="text-sm font-semibold text-neutral-800 truncate">{empleado.nombre}</p>
        <p className="text-xs text-neutral-400 capitalize">{empleado.rol.replace("_", " ")}</p>
      </div>

      <nav className="flex md:flex-col gap-1 px-2 md:px-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {ENLACES.filter((e) => !e.soloAdmin || esAdmin).map(({ href, label, icon: Icon, exact }) => {
          const activo = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activo
                  ? "bg-[#8C1A1A]/8 text-[#8C1A1A]"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
              }`}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 md:px-3 mt-2 md:mt-auto md:pb-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Volver a la tienda
        </Link>
      </div>
    </aside>
  );
}
