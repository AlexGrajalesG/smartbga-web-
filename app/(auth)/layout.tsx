import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-2">
      {/* Panel izquierdo — branding "Acceso Exclusivo", oculto en mobile */}
      <div className="hidden md:flex relative flex-col justify-between bg-[#1C0A0A] noise p-12 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(160deg, #6a000840 0%, transparent 60%)' }}
        />
        <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#8C1A1A] opacity-[0.08] blur-3xl pointer-events-none" />

        <Link href="/" className="relative z-10 font-display text-2xl font-semibold text-white tracking-tight">
          SmartBga
        </Link>

        <div className="relative z-10">
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-white leading-[1.05]">
            Acceso
            <span className="block italic text-[#C9A84C]">exclusivo.</span>
          </h1>
          <p className="mt-6 text-neutral-300 text-base leading-relaxed max-w-sm">
            Entra a tu cuenta para ver tus pedidos, tus favoritos y aprovechar
            las entregas más rápidas de Bucaramanga.
          </p>
        </div>

        <p className="relative z-10 text-xs text-neutral-500 tracking-[0.2em] uppercase">
          Bucaramanga · Epicentro comercial
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-col items-center justify-center bg-[#F9F7F2] px-4 py-12">
        <Link href="/" className="mb-10 md:hidden">
          <Image src="/logo.png" alt="SmartBga" width={160} height={54} className="h-12 w-auto" priority />
        </Link>
        {children}
      </div>
    </div>
  )
}
