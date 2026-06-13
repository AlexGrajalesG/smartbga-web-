import LoginForm from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Iniciar sesión' }

type Props = { searchParams: Promise<{ next?: string; error?: string }> }

const ERROR_MESSAGES: Record<string, string> = {
  link_invalido: 'El link de verificación no es válido o expiró. Solicita uno nuevo.',
}

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams

  return <LoginForm next={next ?? null} error={error ? ERROR_MESSAGES[error] ?? error : null} />
}
