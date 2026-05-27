import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-100 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
        <span>
          © {new Date().getFullYear()} Smart<strong className="text-[#e5c87a]">Bga</strong>
        </span>
        <div className="flex gap-6">
          <Link href="/productos" className="hover:text-neutral-800 transition-colors">
            Productos
          </Link>
          <Link
            href="https://www.instagram.com/smart.bga"
            target="_blank"
            className="hover:text-neutral-800 transition-colors"
          >
            @smart.bga
          </Link>
        </div>
      </div>
    </footer>
  );
}
