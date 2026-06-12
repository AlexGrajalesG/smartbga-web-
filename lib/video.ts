// Convierte un link normal de Instagram/TikTok (el que se copia con "Copiar enlace")
// al formato embebible en iframe. Asi en el CSV/formulario se puede pegar el link tal
// cual lo da la app, sin tener que editarlo a mano.
export function normalizarVideoEmbed(url: string): string {
  const limpio = url.trim();
  if (!limpio) return limpio;

  let parsed: URL;
  try {
    parsed = new URL(limpio);
  } catch {
    return limpio;
  }

  if (parsed.hostname.includes("instagram.com")) {
    const match = parsed.pathname.match(/^\/(reel|p|tv)\/([^/]+)/);
    if (match) {
      const [, tipo, codigo] = match;
      return `https://www.instagram.com/${tipo}/${codigo}/embed`;
    }
  }

  if (parsed.hostname.includes("tiktok.com")) {
    const match = parsed.pathname.match(/\/video\/(\d+)/);
    if (match) {
      return `https://www.tiktok.com/embed/v2/${match[1]}`;
    }
  }

  return limpio;
}
