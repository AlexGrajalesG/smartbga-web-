'use client'

import { useActionState } from 'react'
import { updatePassword } from '@/app/actions/auth'

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, undefined)

  return (
    <div className="w-full max-w-sm">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C9A84C]/15 text-[#8C1A1A] text-[11px] font-semibold tracking-[0.15em] uppercase mb-4">
        Nueva contraseña
      </span>
      <h1 className="font-display text-3xl font-semibold text-[#1C0A0A]">Restablecer contraseña</h1>
      <p className="text-sm text-[#6B5B52] mt-1.5 mb-6">Ingresa tu nueva contraseña.</p>

      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-[#1C0A0A]">
            Nueva contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="input-field"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm" className="text-sm font-medium text-[#1C0A0A]">
            Confirmar contraseña
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            className="input-field"
            placeholder="Repite tu contraseña"
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
          {pending ? 'Guardando...' : 'Guardar nueva contraseña'}
        </button>
      </form>
    </div>
  )
}
