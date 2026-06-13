"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useInView,
  useReducedMotion,
  animate,
} from "framer-motion";

/** Renders "6+", "50+", "100%", "Hoy" — counts up the leading number, keeps the rest static. */
export default function AnimatedCounter({ value }: { value: string }) {
  const match = value.match(/^\d+/);
  const target = match ? parseInt(match[0], 10) : null;
  const suffix = match ? value.slice(match[0].length) : value;

  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView || target === null) return;
    if (reduceMotion) {
      count.set(target);
      return;
    }
    const controls = animate(count, target, { duration: 1.4, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [isInView, target, reduceMotion, count]);

  if (target === null) {
    return <span ref={ref}>{value}</span>;
  }

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
