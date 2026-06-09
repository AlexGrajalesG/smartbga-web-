import { create } from "zustand";
import type { Producto } from "@/types";

interface NotificacionState {
  producto: Producto | null;
  _seq: number; // incrementa en cada mostrar() para forzar re-mount del toast
  mostrar: (producto: Producto) => void;
  ocultar: () => void;
}

export const useNotificacionCarrito = create<NotificacionState>((set) => ({
  producto: null,
  _seq: 0,
  mostrar: (producto) => set((s) => ({ producto, _seq: s._seq + 1 })),
  ocultar: () => set({ producto: null }),
}));
