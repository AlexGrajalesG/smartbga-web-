'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export type AuthState = { error?: string; message?: string } | undefined

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'Completa todos los campos.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login')) return { error: 'Email o contraseña incorrectos.' }
    return { error: 'Error al iniciar sesión. Intenta de nuevo.' }
  }

  redirect('/')
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const nombre   = (formData.get('nombre') as string)?.trim()
  const email    = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const celular  = (formData.get('celular') as string)?.trim() || null
  const edadRaw  = formData.get('edad') as string
  const genero   = (formData.get('genero') as string) || null
  const ciudad   = (formData.get('ciudad') as string)?.trim() || 'Bucaramanga'
  const barrio   = (formData.get('barrio') as string)?.trim() || null

  if (!nombre || !email || !password) return { error: 'Nombre, email y contraseña son obligatorios.' }
  if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' }

  const edad = edadRaw ? parseInt(edadRaw, 10) : null
  if (edad !== null && (isNaN(edad) || edad < 1 || edad > 120)) return { error: 'Edad inválida.' }

  const supabase = await createClient()

  const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
  if (signUpError) {
    if (signUpError.message.includes('already registered')) return { error: 'Este email ya está registrado.' }
    return { error: 'Error al crear la cuenta. Intenta de nuevo.' }
  }

  const authId = data.user?.id
  if (!authId) return { error: 'Error inesperado. Intenta de nuevo.' }

  // Usar admin client para el insert — el usuario no tiene sesion activa aun (RLS lo bloquearia)
  const admin = createAdminClient()
  const { error: insertError } = await admin
    .from('usuarios')
    .insert({ auth_id: authId, nombre, email, celular, edad, genero, ciudad, barrio })

  if (insertError) return { error: 'Cuenta creada pero error al guardar tu perfil. Contacta soporte.' }

  // Si Supabase tiene confirmacion de email activa, el usuario no tiene sesion aun
  if (!data.session) {
    return { message: 'Revisa tu email para confirmar tu cuenta.' }
  }

  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
