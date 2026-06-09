"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { MetodoPago } from "@/types";

export interface ItemOrden {
  producto_id: string;
  cantidad: number;
}

export interface CrearOrdenInput {
  items: ItemOrden[];
  direccion_envio: string;
  celular_contacto: string;
  metodo_pago: MetodoPago;
  notas?: string;
}

export async function crearOrden(input: CrearOrdenInput): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión para continuar");

  let { data: usuario } = await supabase
    .from("usuarios")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!usuario) {
    const admin = createAdminClient();
    const nombre = input.direccion_envio.split("(")[1]?.replace(")", "").trim() || user.email?.split("@")[0] || "Cliente";
    const { data: nuevo, error: insertError } = await admin
      .from("usuarios")
      .insert({
        auth_id: user.id,
        nombre,
        email: user.email!,
        celular: input.celular_contacto.trim() || null,
      })
      .select("id")
      .single();
    if (insertError || !nuevo) throw new Error("No pudimos crear tu perfil. Intenta de nuevo.");
    usuario = nuevo;
  }

  const direccion = input.direccion_envio.trim();
  const celular = input.celular_contacto.trim();
  const notas = input.notas?.trim() || null;
  if (!input.items.length) throw new Error("Tu carrito está vacío");
  if (!direccion) throw new Error("La dirección de envío es obligatoria");
  if (!celular) throw new Error("El celular de contacto es obligatorio");

  const admin = createAdminClient();

  const ids = input.items.map((i) => i.producto_id);
  const { data: productos, error: errorProductos } = await admin
    .from("productos")
    .select("id, nombre, precio_venta, precio_costo, proveedor_id, stock, activo")
    .in("id", ids);
  if (errorProductos) throw new Error(errorProductos.message);

  const productoPorId = new Map((productos ?? []).map((p) => [p.id as string, p]));

  for (const { producto_id, cantidad } of input.items) {
    const producto = productoPorId.get(producto_id);
    if (!producto || !producto.activo) {
      throw new Error("Uno de los productos de tu carrito ya no está disponible");
    }
    if (producto.stock < cantidad) {
      throw new Error(`"${producto.nombre}" ya no tiene stock suficiente (disponible: ${producto.stock})`);
    }
  }

  const total = input.items.reduce((acc, { producto_id, cantidad }) => {
    const producto = productoPorId.get(producto_id)!;
    return acc + producto.precio_venta * cantidad;
  }, 0);

  const direccionCompleta = `${direccion} · Contacto: ${celular}`;

  const { data: orden, error: errorOrden } = await admin
    .from("ordenes")
    .insert({
      usuario_id: usuario.id,
      canal: "online",
      estado: "pendiente",
      total,
      direccion_envio: direccionCompleta,
      metodo_pago: input.metodo_pago,
      notas,
    })
    .select("id")
    .single();
  if (errorOrden) throw new Error(errorOrden.message);

  const filasItems = input.items.map(({ producto_id, cantidad }) => {
    const producto = productoPorId.get(producto_id)!;
    return {
      orden_id: orden.id as string,
      producto_id,
      proveedor_id: producto.proveedor_id,
      cantidad,
      precio_unitario: producto.precio_venta,
      precio_costo: producto.precio_costo ?? 0,
    };
  });

  const { data: itemsCreados, error: errorItems } = await admin
    .from("orden_items")
    .insert(filasItems)
    .select("id, proveedor_id");
  if (errorItems) throw new Error(errorItems.message);

  await Promise.all(
    input.items.map(({ producto_id, cantidad }) => {
      const producto = productoPorId.get(producto_id)!;
      return admin
        .from("productos")
        .update({ stock: producto.stock - cantidad })
        .eq("id", producto_id)
        .gte("stock", cantidad);
    })
  );

  const notificaciones = (itemsCreados ?? [])
    .filter((item) => item.proveedor_id)
    .map((item) => ({
      proveedor_id: item.proveedor_id as string,
      orden_item_id: item.id as string,
      canal: "whatsapp" as const,
      estado: "enviada" as const,
    }));
  if (notificaciones.length > 0) {
    await admin.from("notificaciones_proveedor").insert(notificaciones);
  }

  revalidatePath("/perfil");
  return { id: orden.id as string };
}
