import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-neutral-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-neutral-800">
          {/* Marca */}
          <div>
            <Image
              src="/logo.png"
              alt="SmartBga"
              width={140}
              height={47}
              className="h-10 w-auto brightness-0 invert mb-4"
            />
            <p className="text-sm text-neutral-500 leading-relaxed">
              El centro digital del comercio local de Bucaramanga.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-white font-semibold text-sm mb-4">Tienda</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/productos" className="hover:text-white transition-colors">Todos los productos</Link></li>
              <li><Link href="/carrito" className="hover:text-white transition-colors">Carrito</Link></li>
              <li><Link href="/perfil" className="hover:text-white transition-colors">Mi cuenta</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-white font-semibold text-sm mb-4">Síguenos</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://www.instagram.com/smart.bga"
                  target="_blank"
                  className="hover:text-white transition-colors"
                >
                  Instagram — @smart.bga
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.instagram.com/smart.bga"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  ¿Eres proveedor? Contáctanos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
          <span>© {new Date().getFullYear()} Smart Bucaramanga. Todos los derechos reservados.</span>
          <span>Hecho en <span className="text-[#8C1A1A]">Bucaramanga 🇨🇴</span></span>
        </div>
      </div>
    </footer>
  );
}
