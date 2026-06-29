'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { forgotPassword } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPassword, undefined)

  if (state?.message) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg shadow-ambient p-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-xl">✓</span>
          </div>
          <h2 className="font-display text-xl font-semibold text-[#1C0A0A] mb-2">Email enviado</h2>
          <p className="text-sm text-[#6B5B52]">{state.message}</p>
          <Link href="/login" className="mt-5 inline-block text-sm font-semibold text-[#6a0008] hover:underline">
            Volver al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C9A84C]/15 text-[#8C1A1A] text-[11px] font-semibold tracking-[0.15em] uppercase mb-4">
        Recuperar acceso
      </span>
      <h1 className="font-display text-3xl font-semibold text-[#1C0A0A]">Olvidé mi contraseña</h1>
      <p className="text-sm text-[#6B5B52] mt-1.5 mb-6">
        Ingresa tu email y te enviamos un link para restablecerla.
      </p>

      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-[#1C0A0A]">
            Correo electrónico
          </label>
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

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 bg-[#6a0008] text-white text-sm font-semibold rounded-md hover:bg-[#8C1A1A] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 mt-1"
        >
          {pending ? 'Enviando...' : 'Enviar link de recuperación'}
        </button>
      </form>

      <p className="text-sm text-[#6B5B52] text-center mt-5">
        <Link href="/login" className="text-[#6a0008] font-semibold hover:underline">
          Volver al login
        </Link>
      </p>
    </div>
  )
}
