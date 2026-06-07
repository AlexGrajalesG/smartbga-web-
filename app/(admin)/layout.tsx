import { redirect } from "next/navigation";
import { getEmpleadoActual, puedeGestionarCatalogo } from "@/lib/auth/empleado";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const empleado = await getEmpleadoActual();

  // proxy.ts ya exige sesion activa para /admin; aqui reforzamos el rol —
  // solo personal con permiso de gestion de catalogo entra al panel.
  if (!puedeGestionarCatalogo(empleado)) {
    redirect("/");
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <AdminSidebar empleado={empleado!} />
      <main className="flex-1 p-5 md:p-8 max-w-5xl">{children}</main>
    </div>
  );
}
