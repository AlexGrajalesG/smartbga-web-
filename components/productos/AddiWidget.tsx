"use client";

import Script from "next/script";
import { useId } from "react";

// Script oficial de Addi confirmado en su documentación. Funciona ubicando,
// vía data-element-reference (selector CSS), el elemento que muestra el
// precio, y le inserta al lado el texto de cuotas estimadas.
const ADDI_WIDGET_SCRIPT =
  "https://statics.addi.com/shopify/js/shopify-co-widget-wrapper.bundle.min.js";

export default function AddiWidget({ amount }: { amount: number }) {
  const allySlug = process.env.NEXT_PUBLIC_ADDI_ALLY_SLUG;
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (!allySlug) return null;

  const anchorId = `addi-price-${reactId}`;

  return (
    <div className="flex items-center gap-2">
      <span id={anchorId} className="text-sm font-semibold text-[#1C0A0A]">
        ${Math.round(amount).toLocaleString("es-CO")}
      </span>
      <Script
        id={`addi-widget-script-${reactId}`}
        src={ADDI_WIDGET_SCRIPT}
        strategy="lazyOnload"
        data-name="shopifyAddiWidget"
        data-id={allySlug}
        data-ally-slug={allySlug}
        data-element-reference={`#${anchorId}`}
      />
    </div>
  );
}
