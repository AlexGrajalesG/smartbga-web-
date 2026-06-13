"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ShoppingBag, ArrowRight, MapPin } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import MagneticLink from "./MagneticLink";
import HeroShowcase from "./HeroShowcase";

type Stat = { value: string; label: string };
type ShowcaseImage = { src: string; alt: string; price: number };

const EASE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

const lineReveal: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)", y: 14 },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    y: 0,
    transition: { duration: 0.9, ease: EASE },
  },
};

export default function Hero({ stats, images }: { stats: Stat[]; images: ShowcaseImage[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Pointer-driven parallax for the background layers
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const springX = useSpring(mvX, { stiffness: 50, damping: 20, mass: 0.6 });
  const springY = useSpring(mvY, { stiffness: 50, damping: 20, mass: 0.6 });

  const orb1X = useTransform(springX, (v) => v * 50);
  const orb1Y = useTransform(springY, (v) => v * 50);
  const orb2X = useTransform(springX, (v) => v * -35);
  const orb2Y = useTransform(springY, (v) => v * -35);
  const gridX = useTransform(springX, (v) => v * 10);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mvX.set((e.clientX - rect.left) / rect.width - 0.5);
    mvY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    mvX.set(0);
    mvY.set(0);
  }

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative bg-[#1C0A0A] min-h-[92vh] flex flex-col justify-center overflow-hidden noise"
    >
      {/* Banda diagonal de acento */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, transparent 55%, #8C1A1A18 55%, #8C1A1A08 100%)",
        }}
      />

      {/* Orbes de fondo — parallax al cursor */}
      <motion.div
        style={{ x: orb1X, y: orb1Y }}
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#8C1A1A] opacity-[0.06] blur-3xl pointer-events-none"
      />
      <motion.div
        style={{ x: orb2X, y: orb2Y }}
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#C9A84C] opacity-[0.04] blur-3xl pointer-events-none"
      />

      {/* Líneas de grilla verticales — leve parallax */}
      <motion.div style={{ x: gridX }} className="absolute inset-0 pointer-events-none" aria-hidden>
        {[20, 40, 60, 80].map((pct) => (
          <div
            key={pct}
            className="absolute top-0 bottom-0 w-px bg-white/[0.03]"
            style={{ left: `${pct}%` }}
          />
        ))}
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 lg:flex lg:items-center lg:justify-between lg:gap-12"
      >
        <div className="max-w-3xl lg:max-w-xl">

          {/* Eyebrow */}
          <motion.div variants={item} className="flex items-center gap-2.5 mb-8">
            <MapPin size={13} className="text-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase">
              Bucaramanga · Epicentro comercial
            </span>
          </motion.div>

          {/* Headline — revelado por línea con clip-path */}
          <h1 className="font-display text-white leading-[1.05] tracking-tight">
            <motion.span
              variants={lineReveal}
              className="block text-6xl md:text-8xl font-semibold"
            >
              Hoy lo pides.
            </motion.span>
            <motion.span
              variants={lineReveal}
              className="block text-6xl md:text-8xl font-light text-[#C9A84C] italic mt-1"
            >
              Hoy te llega.
            </motion.span>
          </h1>

          {/* Subheadline */}
          <motion.p
            variants={item}
            className="mt-8 text-neutral-300 text-lg md:text-xl leading-relaxed max-w-xl"
          >
            Productos importados verificados. La mejor logística de la ciudad.{" "}
            <span className="text-white font-semibold">
              No somos una tienda más. Somos el epicentro.
            </span>
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="mt-10 flex flex-col sm:flex-row gap-4">
            <MagneticLink
              href="/productos"
              className="btn-beam group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#6a0008] hover:bg-[#8C1A1A] text-white font-semibold text-base rounded-md transition-colors duration-200 shadow-xl shadow-[#6a0008]/30 cursor-pointer"
            >
              <ShoppingBag size={18} strokeWidth={2} />
              Ver catálogo completo
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </MagneticLink>
            <a
              href="https://www.instagram.com/smart.bga"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 border border-white/20 hover:border-white/50 text-white/80 hover:text-white font-semibold text-base rounded-md transition-all duration-200 cursor-pointer backdrop-blur-sm"
            >
              @smart.bga
            </a>
          </motion.div>

          {/* Mini stats — contador animado */}
          <motion.div variants={item} className="mt-14 flex flex-wrap gap-x-8 gap-y-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col">
                <span className="font-display text-3xl font-bold text-white">
                  <AnimatedCounter value={value} />
                </span>
                <span className="text-xs text-neutral-500 mt-0.5">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <HeroShowcase images={images} springX={springX} springY={springY} />
      </motion.div>

      {/* Borde inferior */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#8C1A1A]/60 to-transparent" />
    </section>
  );
}
