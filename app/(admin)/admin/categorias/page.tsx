import { createAdminClient } from '@/lib/supabase/server'
import { getEmpleadoActual } from '@/lib/auth/empleado'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import CategoriasAdmin from '@/components/admin/CategoriasAdmin'

export const metadata: Metadata = { title: 'Categorías — Admin SmartBga' }

export default async function AdminCategoriasPage() {
  const empleado = await getEmpleadoActual()
  if (empleado?.rol !== 'admin') redirect('/admin')

  const admin = createAdminClient()
  const { data: categorias } = await admin
    .from('categorias')
    .select('id, slug, nombre, descripcion')
    .order('nombre')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase mb-1">Catálogo</p>
        <h1 className="font-display text-3xl font-semibold text-[#1C0A0A]">Categorías</h1>
        <p className="text-sm text-neutral-500 mt-1.5">
          Organiza el catálogo. Las categorías se asignan al crear o importar productos.
        </p>
      </div>

      <CategoriasAdmin categorias={categorias ?? []} />
    </div>
  )
}
