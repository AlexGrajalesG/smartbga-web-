"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/** Chip de categoría con micro-interacción de hover/tap. */
export default function MotionChip({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} className="inline-block">
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}
