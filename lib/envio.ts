export const ENVIO_GRATIS_DESDE = 90_000;
export const COSTO_ENVIO_EXTERNO = 12_000;
export const AREA_METROPOLITANA_BGA = ["bucaramanga", "floridablanca", "giron", "piedecuesta"];

export function normalizarCiudad(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function calcularCostoEnvio(subtotal: number, ciudad: string, departamento: string): number {
  const enAreaMetro =
    departamento === "Santander" &&
    AREA_METROPOLITANA_BGA.includes(normalizarCiudad(ciudad));
  if (enAreaMetro || subtotal >= ENVIO_GRATIS_DESDE) return 0;
  return COSTO_ENVIO_EXTERNO;
}
