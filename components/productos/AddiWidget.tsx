"use client";

import Script from "next/script";

// URL del script del widget de Addi — confirmar con documentación oficial de Addi
// Sandbox: puede requerir script diferente; consultar al equipo de Addi
const ADDI_WIDGET_SCRIPT = "https://s3.amazonaws.com/addi-public/widgets/addi-widget.js";

export default function AddiWidget({ amount }: { amount: number }) {
  const allySlug = process.env.NEXT_PUBLIC_ADDI_ALLY_SLUG;
  if (!allySlug) return null;

  return (
    <>
      <Script src={ADDI_WIDGET_SCRIPT} strategy="lazyOnload" />
      <addi-widget
        ally-slug={allySlug}
        amount={Math.round(amount)}
        country="CO"
      />
    </>
  );
}
