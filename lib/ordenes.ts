import type { EstadoOrden, MetodoPago } from "@/types";

export const ESTADO_ORDEN_LABEL: Record<EstadoOrden, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  en_despacho: "En camino",
  entregada: "Entregada",
  cancelada: "Cancelada",
};

export const ESTADO_ORDEN_COLOR: Record<EstadoOrden, string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  confirmada: "bg-blue-100 text-blue-700",
  en_despacho: "bg-purple-100 text-purple-700",
  entregada: "bg-green-100 text-green-700",
  cancelada: "bg-red-100 text-red-700",
};

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
  efectivo: "Pago contraentrega",
  transferencia: "Transferencia o PSE",
  addi: "Addi — paga después",
  addi_presencial: "Addi (presencial)",
  wompi: "Tarjeta / PSE / Nequi (Wompi)",
  sistecredito: "Sistecrédito — paga después",
};
