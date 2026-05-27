import { createClient } from './server'
import type { Producto, Categoria } from '@/types'

export async function getProductos(categoriaSlug?: string): Promise<Producto[]> {
  const supabase = await createClient()

  let query = supabase
    .from('productos')
    .select('*, categoria:categorias(*)')
    .eq('activo', true)
    .order('created_at', { ascending: false })

  if (categoriaSlug) {
    query = query.eq('categorias.slug', categoriaSlug)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getProductoBySlug(slug: string): Promise<Producto | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('productos')
    .select('*, categoria:categorias(*)')
    .eq('slug', slug)
    .eq('activo', true)
    .single()

  if (error) return null
  return data
}

export async function getCategorias(): Promise<Categoria[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre')

  if (error) throw error
  return data ?? []
}
