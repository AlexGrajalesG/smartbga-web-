import { createClient } from '@/lib/supabase/server'
import { getEmpleadoActual, puedeGestionarCatalogo } from '@/lib/auth/empleado'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const mostrarPanelAdmin = user ? puedeGestionarCatalogo(await getEmpleadoActual()) : false

  return (
    <>
      <Navbar user={user} mostrarPanelAdmin={mostrarPanelAdmin} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
