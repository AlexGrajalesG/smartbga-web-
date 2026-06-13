import { ShieldCheck, CreditCard, Headphones } from "lucide-react";
import Reveal from "./Reveal";

export default function EpicentroTrust() {
  return (
    <section className="py-20 md:py-28 px-4 text-center bg-[#F5F3EE]">
      <Reveal className="max-w-2xl mx-auto">
        <ShieldCheck size={48} strokeWidth={1.5} className="text-[#C9A84C] mx-auto mb-6" />
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-[#1C0A0A] mb-6 leading-tight">
          Epicentro de confianza en Bucaramanga
        </h2>
        <p className="text-[#6B5B52] text-base leading-relaxed mb-10 max-w-xl mx-auto">
          No somos una tienda virtual anónima. Somos una marca establecida con más de 6 años de
          trayectoria garantizando tecnología original y entregas inmediatas en la ciudad.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-neutral-100 shadow-sm">
            <CreditCard size={16} className="text-[#6a0008]" />
            <span className="text-sm font-medium text-[#1C0A0A]">Pagos seguros</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-neutral-100 shadow-sm">
            <Headphones size={16} className="text-[#6a0008]" />
            <span className="text-sm font-medium text-[#1C0A0A]">Soporte real</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
