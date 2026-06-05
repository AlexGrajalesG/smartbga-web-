import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "SmartBga — Bucaramanga", template: "%s | SmartBga" },
  description: "El epicentro del comercio en Bucaramanga. Productos importados de calidad, seleccionados y verificados para ti.",
  metadataBase: new URL("https://smartbga.shop"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-900 antialiased font-body">
        {children}
      </body>
    </html>
  );
}
