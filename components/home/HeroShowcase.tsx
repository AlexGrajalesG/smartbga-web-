"use client";

import Image from "next/image";
import { motion, useTransform, type MotionValue } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

type ShowcaseImage = { src: string; alt: string; price: number };

const formatCOP = (value: number) => `$${value.toLocaleString("es-CO")}`;

/** Cascada Z-axis de fotos de producto — acompaña el hero en lg: y arriba. */
export default function HeroShowcase({
  images,
  springX,
  springY,
}: {
  images: ShowcaseImage[];
  springX: MotionValue<number>;
  springY: MotionValue<number>;
}) {
  const [back, front] = images;

  const backX = useTransform(springX, (v) => v * 24);
  const backY = useTransform(springY, (v) => v * 24);
  const frontX = useTransform(springX, (v) => v * -18);
  const frontY = useTransform(springY, (v) => v * -18);

  if (!back) return null;

  return (
    <div className="hidden lg:block relative w-[380px] h-[460px] shrink-0">
      <motion.div
        style={{ x: backX, y: backY }}
        initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
        className="absolute top-0 right-10 w-64 aspect-[4/5] rounded-3xl overflow-hidden rotate-[-4deg] shadow-2xl shadow-black/50 ring-1 ring-white/10 z-10"
      >
        <Image src={back.src} alt={back.alt} fill sizes="260px" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-sm font-medium line-clamp-1">{back.alt}</p>
          <p className="text-[#C9A84C] text-sm font-bold">{formatCOP(back.price)}</p>
        </div>
      </motion.div>

      {front && (
        <motion.div
          style={{ x: frontX, y: frontY }}
          initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
          className="absolute bottom-0 left-0 w-60 aspect-[4/5] rounded-3xl overflow-hidden rotate-[3deg] shadow-2xl shadow-black/50 ring-1 ring-white/10 z-20"
        >
          <Image src={front.src} alt={front.alt} fill sizes="240px" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white text-sm font-medium line-clamp-1">{front.alt}</p>
            <p className="text-[#C9A84C] text-sm font-bold">{formatCOP(front.price)}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
