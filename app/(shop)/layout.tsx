import { createClient } from '@/lib/supabase/server'
import { getEmpleadoActual, puedeGestionarCatalogo } from '@/lib/auth/empleado'
import { getCategorias } from '@/lib/supabase/queries'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import NotificacionCarrito from '@/components/ui/NotificacionCarrito'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const mostrarPanelAdmin = user ? puedeGestionarCatalogo(await getEmpleadoActual()) : false
  const categorias = await getCategorias().catch(() => [])

  return (
    <>
      <Navbar user={user} mostrarPanelAdmin={mostrarPanelAdmin} categorias={categorias} />
      <main className="flex-1">{children}</main>
      <Footer />
      <NotificacionCarrito />
    </>
  )
}
