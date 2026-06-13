import type { MetodoPago, NivelPrecio, Producto } from "@/types";

// Cada metodo de pago de checkout corresponde a un nivel de precio del producto.
// Efectivo y transferencia no implican costo de pasarela, por eso comparten "contraentrega".
const NIVEL_POR_METODO: Record<MetodoPago, NivelPrecio> = {
  efectivo: "contraentrega",
  transferencia: "contraentrega",
  wompi: "tarjeta",
  addi: "addi",
  addi_presencial: "addi",
  sistecredito: "sistecredito",
};

export function precioParaMetodo(
  producto: Pick<Producto, "precio_venta" | "precios">,
  metodoPago: MetodoPago
): number {
  const nivel = NIVEL_POR_METODO[metodoPago];
  return producto.precios?.[nivel] ?? producto.precio_venta;
}
