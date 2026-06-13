import type { Metadata } from "next";
import { EB_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600"], // headline-md/lg y display-lg del sistema "SmartBGA Prestige"
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  // sin weight = variable font: un solo archivo cubre todo el rango
});

export const metadata: Metadata = {
  title: { default: "SmartBga — Bucaramanga", template: "%s | SmartBga" },
  description: "El epicentro del comercio en Bucaramanga. Productos importados de calidad, seleccionados y verificados para ti.",
  metadataBase: new URL("https://smartbga.shop"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${ebGaramond.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-900 antialiased font-body">
        {children}
      </body>
    </html>
  );
}
