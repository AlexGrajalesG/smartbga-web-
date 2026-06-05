import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-10">
        <Image src="/logo.png" alt="SmartBga" width={160} height={54} className="h-12 w-auto" priority />
      </Link>
      {children}
    </div>
  )
}
