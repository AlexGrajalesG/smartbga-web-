'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginForm({ next, error }: { next: string | null; error?: string | null }) {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="w-full max-w-sm">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C9A84C]/15 text-[#8C1A1A] text-[11px] font-semibold tracking-[0.15em] uppercase mb-4">
        Conexión segura
      </span>
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#1C0A0A]">Iniciar sesión</h1>
      <p className="text-sm text-[#6B5B52] mt-1.5 mb-6">Bienvenido de nuevo a SmartBga</p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md mb-4">{error}</p>
      )}

      <form action={action} className="flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-[#1C0A0A]">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input-field"
            placeholder="tu@email.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-[#1C0A0A]">Contraseña</label>
            <Link href="/forgot-password" className="text-xs text-[#6a0008] hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="input-field"
            placeholder="••••••••"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 bg-[#6a0008] text-white text-sm font-semibold rounded-md hover:bg-[#8C1A1A] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 mt-1"
        >
          {pending ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="text-sm text-[#6B5B52] text-center mt-5">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-[#6a0008] font-semibold hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
