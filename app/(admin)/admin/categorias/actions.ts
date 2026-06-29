'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { getEmpleadoActual } from '@/lib/auth/empleado'

export type CategoriaState = { error?: string; success?: boolean } | undefined

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function soloAdmin() {
  const empleado = await getEmpleadoActual()
  if (empleado?.rol !== 'admin') throw new Error('No autorizado')
}

export async function crearCategoria(_prev: CategoriaState, formData: FormData): Promise<CategoriaState> {
  await soloAdmin()

  const nombre = (formData.get('nombre') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null

  if (!nombre) return { error: 'El nombre es obligatorio.' }

  const slug = slugify(nombre)
  if (!slug) return { error: 'El nombre no es válido.' }

  const admin = createAdminClient()
  const { error } = await admin.from('categorias').insert({ slug, nombre, descripcion })

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe una categoría con ese nombre o slug.' }
    return { error: 'No se pudo crear la categoría.' }
  }

  revalidatePath('/admin/categorias')
  return { success: true }
}

export async function actualizarCategoria(_prev: CategoriaState, formData: FormData): Promise<CategoriaState> {
  await soloAdmin()

  const id = formData.get('id') as string
  const nombre = (formData.get('nombre') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null

  if (!id) return { error: 'ID inválido.' }
  if (!nombre) return { error: 'El nombre es obligatorio.' }

  const slug = slugify(nombre)

  const admin = createAdminClient()
  const { error } = await admin
    .from('categorias')
    .update({ slug, nombre, descripcion })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe una categoría con ese nombre.' }
    return { error: 'No se pudo actualizar la categoría.' }
  }

  revalidatePath('/admin/categorias')
  return { success: true }
}

export async function eliminarCategoria(_prev: CategoriaState, formData: FormData): Promise<CategoriaState> {
  await soloAdmin()

  const id = formData.get('id') as string
  if (!id) return { error: 'ID inválido.' }

  const admin = createAdminClient()

  const { count } = await admin
    .from('productos')
    .select('id', { count: 'exact', head: true })
    .eq('categoria_id', id)

  if ((count ?? 0) > 0) {
    return { error: `No se puede eliminar: tiene ${count} producto${count === 1 ? '' : 's'} asignados.` }
  }

  const { error } = await admin.from('categorias').delete().eq('id', id)
  if (error) return { error: 'No se pudo eliminar la categoría.' }

  revalidatePath('/admin/categorias')
  return { success: true }
}
