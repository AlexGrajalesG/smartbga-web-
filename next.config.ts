import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  // Scripts: propio + inline que necesita Next.js + terceros de pago
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://statics.addi.com https://checkout.wompi.co https://cdn.wompi.co",
  // Estilos: unsafe-inline requerido por Tailwind JIT en dev
  "style-src 'self' 'unsafe-inline'",
  // Imágenes
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co",
  // Fuentes del navegador
  "font-src 'self' data:",
  // Fetch/XHR: Supabase, Wompi, Addi, Cloudinary
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://checkout.wompi.co https://api.addi.com https://api.cloudinary.com",
  // iframes de pasarelas de pago
  "frame-src https://checkout.wompi.co https://addi.com https://*.addi.com",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options",           value: "nosniff" },
  { key: "X-Frame-Options",                  value: "DENY" },
  { key: "X-XSS-Protection",                 value: "0" },
  { key: "Referrer-Policy",                   value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",               value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security",         value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy",           value: csp },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
