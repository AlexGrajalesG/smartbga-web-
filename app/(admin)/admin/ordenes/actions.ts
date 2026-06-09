"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getEmpleadoActual } from "@/lib/auth/empleado";

type EstadoOrden = "pendiente" | "confirmada" | "en_despacho" | "entregada" | "cancelada";

export async function cambiarEstadoOrden(ordenId: string, estado: EstadoOrden) {
  const empleado = await getEmpleadoActual();
  if (!empleado || empleado.rol !== "admin") throw new Error("Sin permiso");

  const admin = createAdminClient();
  const { error } = await admin
    .from("ordenes")
    .update({ estado })
    .eq("id", ordenId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/ordenes");
  revalidatePath(`/admin/ordenes/${ordenId}`);
}
