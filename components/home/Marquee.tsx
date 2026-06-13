"use client";

import { useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";

/** Cinta de confianza con scroll continuo por framer-motion — se pausa al pasar el cursor. */
export default function Marquee({ items, speed = 40 }: { items: string[]; speed?: number }) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const groupRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useAnimationFrame((_, delta) => {
    if (paused || reduceMotion) return;
    const width = groupRef.current?.offsetWidth ?? 0;
    if (!width) return;
    let next = x.get() - (speed * delta) / 1000;
    if (next <= -width) next += width;
    x.set(next);
  });

  const renderItems = (suffix: string) =>
    items.map((item, i) => (
      <span
        key={`${suffix}-${i}`}
        className="inline-flex items-center gap-3 px-6 text-white text-sm font-medium"
      >
        <span className="w-1 h-1 rounded-full bg-white/50 flex-shrink-0" />
        {item}
      </span>
    ));

  if (reduceMotion) {
    return (
      <div className="bg-[#8C1A1A] py-3.5 overflow-x-auto">
        <div className="flex whitespace-nowrap w-max">{renderItems("r")}</div>
      </div>
    );
  }

  return (
    <div
      className="bg-[#8C1A1A] py-3.5 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div style={{ x }} className="flex whitespace-nowrap w-max">
        <div ref={groupRef} className="flex shrink-0">
          {renderItems("a")}
        </div>
        <div className="flex shrink-0" aria-hidden>
          {renderItems("b")}
        </div>
      </motion.div>
    </div>
  );
}
