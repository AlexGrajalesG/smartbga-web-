"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { buildWompiCheckoutUrl } from "@/lib/wompi";
import { createAddiApplication } from "@/lib/addi";
import { precioParaMetodo } from "@/lib/precios";
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
  ciudad: string;
  departamento: string;
  notas?: string;
}

const ENVIO_GRATIS_DESDE = 90_000;
const COSTO_ENVIO_EXTERNO = 12_000;
const AREA_METROPOLITANA_BGA = ["bucaramanga", "floridablanca", "giron", "piedecuesta"];

function normalizarCiudad(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function calcularCostoEnvio(subtotal: number, ciudad: string, departamento: string): number {
  const enAreaMetro =
    departamento === "Santander" &&
    AREA_METROPOLITANA_BGA.includes(normalizarCiudad(ciudad));
  if (enAreaMetro || subtotal >= ENVIO_GRATIS_DESDE) return 0;
  return COSTO_ENVIO_EXTERNO;
}

export async function guardarDireccion(data: {
  celular: string;
  ciudad: string;
  barrio: string;
  direccion: string;
  departamento: string;
}): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("usuarios")
    .update({
      celular:      data.celular      || null,
      ciudad:       data.ciudad       || null,
      barrio:       data.barrio       || null,
      direccion:    data.direccion    || null,
      departamento: data.departamento || null,
    })
    .eq("auth_id", user.id);
}

export async function crearOrden(input: CrearOrdenInput): Promise<{ id: string; wompiUrl?: string; addiUrl?: string }> {
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

  const direccion = input.direccion_envio.trim().slice(0, 500);
  const celular   = input.celular_contacto.trim().slice(0, 30);
  if (!input.items.length)   throw new Error("Tu carrito está vacío");
  if (input.items.length > 50) throw new Error("El carrito no puede tener más de 50 productos distintos");
  if (!direccion)            throw new Error("La dirección de envío es obligatoria");
  if (!celular)              throw new Error("El celular de contacto es obligatorio");

  for (const { cantidad } of input.items) {
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 999)
      throw new Error("Cantidad inválida en uno de los productos");
  }

  const admin = createAdminClient();

  const ids = input.items.map((i) => i.producto_id);
  const { data: productos, error: errorProductos } = await admin
    .from("productos")
    .select("id, nombre, precio_venta, precio_costo, precios, proveedor_id, stock, activo")
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

  const notas = input.notas?.trim().slice(0, 500) || null;

  const subtotal = input.items.reduce((acc, { producto_id, cantidad }) => {
    const producto = productoPorId.get(producto_id)!;
    return acc + precioParaMetodo(producto, input.metodo_pago) * cantidad;
  }, 0);

  const costoEnvio = calcularCostoEnvio(subtotal, input.ciudad, input.departamento);
  const total = subtotal + costoEnvio;

  // Reservar stock ANTES de crear la orden para evitar overselling.
  // Usamos .gte("stock", cantidad) como guard atómico: si otro usuario compró primero,
  // la condición falla y el update no afecta filas → lo detectamos y revertimos.
  const stockReservado: Array<{ producto_id: string; stockAnterior: number }> = [];

  for (const { producto_id, cantidad } of input.items) {
    const producto = productoPorId.get(producto_id)!;
    const { data: reserva } = await admin
      .from("productos")
      .update({ stock: producto.stock - cantidad })
      .eq("id", producto_id)
      .gte("stock", cantidad)
      .select("id");

    if (!reserva?.length) {
      // El update no afectó filas → stock insuficiente. Revertir los ya reservados.
      await Promise.all(
        stockReservado.map(({ producto_id: pid, stockAnterior }) =>
          admin.from("productos").update({ stock: stockAnterior }).eq("id", pid)
        )
      );
      throw new Error(`"${producto.nombre}" se agotó justo antes de confirmar. Intenta de nuevo.`);
    }

    stockReservado.push({ producto_id, stockAnterior: producto.stock });
  }

  const direccionCompleta = `${direccion} · Contacto: ${celular}`;

  const { data: orden, error: errorOrden } = await admin
    .from("ordenes")
    .insert({
      usuario_id: usuario.id,
      canal: "online",
      estado: "pendiente",
      subtotal,
      costo_envio: costoEnvio,
      total,
      direccion_envio: direccionCompleta,
      metodo_pago: input.metodo_pago,
      notas,
    })
    .select("id")
    .single();

  if (errorOrden) {
    // Si la orden falla, devolver el stock reservado
    await Promise.all(
      stockReservado.map(({ producto_id: pid, stockAnterior }) =>
        admin.from("productos").update({ stock: stockAnterior }).eq("id", pid)
      )
    );
    throw new Error(errorOrden.message);
  }

  const filasItems = input.items.map(({ producto_id, cantidad }) => {
    const producto = productoPorId.get(producto_id)!;
    return {
      orden_id: orden.id as string,
      producto_id,
      proveedor_id: producto.proveedor_id,
      cantidad,
      precio_unitario: precioParaMetodo(producto, input.metodo_pago),
      precio_costo: producto.precio_costo ?? 0,
    };
  });

  const { data: itemsCreados, error: errorItems } = await admin
    .from("orden_items")
    .insert(filasItems)
    .select("id, proveedor_id");
  if (errorItems) throw new Error(errorItems.message);

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

  if (input.metodo_pago === "wompi") {
    const headersList = await headers();
    const host = headersList.get("host") ?? "www.smartbga.shop";
    const proto = host.startsWith("localhost") ? "http" : "https";
    const appUrl = `${proto}://${host}`;

    const wompiUrl = buildWompiCheckoutUrl({
      reference: orden.id as string,
      amountInCents: Math.round(total) * 100,
      redirectUrl: `${appUrl}/pedido/${orden.id}`,
      customerEmail: user.email ?? undefined,
    });
    return { id: orden.id as string, wompiUrl };
  }

  if (input.metodo_pago === "addi") {
    const clientId = process.env.ADDI_CLIENT_ID;
    const clientSecret = process.env.ADDI_CLIENT_SECRET;
    if (clientId && clientSecret) {
      const headersList = await headers();
      const host = headersList.get("host") ?? "www.smartbga.shop";
      const proto = host.startsWith("localhost") ? "http" : "https";
      const appUrl = `${proto}://${host}`;

      const nombreCompleto =
        input.direccion_envio.match(/\(([^)]+)\)$/)?.[1] ??
        user.email?.split("@")[0] ??
        "Cliente";
      const [firstName, ...rest] = nombreCompleto.trim().split(" ");
      const lastName = rest.join(" ") || firstName;

      try {
        const { applicationUrl, addiOrderId } = await createAddiApplication({
          orderId: orden.id as string,
          totalAmount: total,
          items: input.items.map(({ producto_id, cantidad }) => {
            const p = productoPorId.get(producto_id)!;
            return {
              sku: producto_id,
              unitPrice: precioParaMetodo(p, input.metodo_pago),
              quantity: cantidad,
              description: p.nombre,
            };
          }),
          customerFirstName: firstName,
          customerLastName: lastName,
          customerEmail: user.email ?? "",
          customerPhone: input.celular_contacto,
          successUrl: `${appUrl}/pedido/${orden.id}?addi=success`,
          declinedUrl: `${appUrl}/pedido/${orden.id}?addi=declined`,
          canceledUrl: `${appUrl}/pedido/${orden.id}?addi=cancelled`,
        });

        await admin
          .from("ordenes")
          .update({ addi_order_id: addiOrderId })
          .eq("id", orden.id);

        return { id: orden.id as string, addiUrl: applicationUrl };
      } catch {
        // Fallo de Addi — el pedido ya está creado, cae a flujo manual
      }
    }
  }

  return { id: orden.id as string };
}
