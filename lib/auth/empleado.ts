import { createClient } from '@/lib/supabase/server'
import type { Empleado } from '@/types'

const ROLES_GESTION_CATALOGO: Empleado['rol'][] = ['admin', 'proveedor', 'vendedor_proveedor']

export async function getEmpleadoActual(): Promise<Empleado | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('empleados')
    .select('*, proveedor:proveedores(*)')
    .eq('auth_id', user.id)
    .eq('activo', true)
    .single()

  return data ?? null
}

export function puedeGestionarCatalogo(empleado: Empleado | null): boolean {
  return !!empleado && ROLES_GESTION_CATALOGO.includes(empleado.rol)
}

export function esAdmin(empleado: Empleado | null): boolean {
  return empleado?.rol === 'admin'
}
