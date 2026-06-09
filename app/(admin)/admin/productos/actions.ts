"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getEmpleadoActual, puedeGestionarCatalogo } from "@/lib/auth/empleado";
import { subirImagenProducto } from "@/lib/cloudinary";
import type { Empleado, NivelPrecio } from "@/types";

const NIVELES: NivelPrecio[] = ["contraentrega", "tarjeta", "addi", "sistecredito"];

function parsePrecios(formData: FormData): Record<string, number> | null {
  const precios: Record<string, number> = {};
  for (const nivel of NIVELES) {
    const raw = formData.get(`precio_${nivel}`);
    const texto = raw == null ? "" : String(raw).trim();
    if (texto === "") continue;
    const num = Number(texto);
    if (!Number.isNaN(num) && num >= 0) precios[nivel] = num;
  }
  return Object.keys(precios).length > 0 ? precios : null;
}

function datosComunes(formData: FormData, empleado: Empleado) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const precio_venta = Number(formData.get("precio_venta"));
  const precioAnteriorTexto = String(formData.get("precio_anterior") ?? "").trim();
  const precio_anterior = precioAnteriorTexto === "" ? null : Number(precioAnteriorTexto);
  const categoria_id = String(formData.get("categoria_id") ?? "").trim() || null;
  const stock = Number(formData.get("stock") ?? 0);
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null;

  if (!nombre) throw new Error("El nombre es obligatorio");
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("El slug es obligatorio y solo puede tener minúsculas, números y guiones");
  }
  if (Number.isNaN(precio_venta) || precio_venta < 0) {
    throw new Error("El precio de venta no es válido");
  }
  if (precio_anterior !== null && Number.isNaN(precio_anterior)) {
    throw new Error("El precio anterior no es válido");
  }
  if (Number.isNaN(stock) || stock < 0) {
    throw new Error("El stock no es válido");
  }

  let imagenes: string[] = [];
  try {
    const raw = JSON.parse(String(formData.get("imagenes") ?? "[]"));
    if (Array.isArray(raw)) imagenes = raw.filter((u) => typeof u === "string" && u.trim() !== "");
  } catch {
    imagenes = [];
  }

  const video_url = String(formData.get("video_url") ?? "").trim() || null;

  // Un proveedor solo puede publicar a su propio nombre — no puede elegir otro proveedor
  const proveedor_id =
    empleado.rol === "admin"
      ? String(formData.get("proveedor_id") ?? "").trim() || null
      : empleado.proveedor_id;

  return {
    nombre,
    slug,
    precio_venta,
    precio_anterior,
    precios: parsePrecios(formData),
    categoria_id,
    proveedor_id,
    stock,
    descripcion,
    imagenes,
    video_url,
  };
}

async function verificarPropiedad(productoId: string, empleado: Empleado) {
  if (empleado.rol === "admin") return;
  const admin = createAdminClient();
  const { data } = await admin.from("productos").select("proveedor_id").eq("id", productoId).single();
  if (!data || data.proveedor_id !== empleado.proveedor_id) {
    throw new Error("No tienes permiso para modificar este producto");
  }
}

export async function crearProducto(formData: FormData): Promise<{ id: string }> {
  const empleado = await getEmpleadoActual();
  if (!puedeGestionarCatalogo(empleado)) throw new Error("No autorizado");

  const datos = datosComunes(formData, empleado!);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("productos")
    .insert({ ...datos, activo: true })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/productos");
  return { id: data.id };
}

export async function actualizarProducto(productoId: string, formData: FormData): Promise<void> {
  const empleado = await getEmpleadoActual();
  if (!puedeGestionarCatalogo(empleado)) throw new Error("No autorizado");
  await verificarPropiedad(productoId, empleado!);

  const datos = datosComunes(formData, empleado!);
  const admin = createAdminClient();
  const { error } = await admin.from("productos").update(datos).eq("id", productoId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productoId}`);
  revalidatePath(`/producto/${datos.slug}`);
}

export async function subirImagenesProducto(formData: FormData): Promise<{ urls: string[] }> {
  const empleado = await getEmpleadoActual();
  if (!puedeGestionarCatalogo(empleado)) throw new Error("No autorizado");

  const slug = String(formData.get("slug") ?? "").trim() || "producto";
  const archivos = formData.getAll("archivos").filter((a): a is File => a instanceof File && a.size > 0);
  if (archivos.length === 0) return { urls: [] };

  const urls = await Promise.all(archivos.map((archivo) => subirImagenProducto(archivo, slug)));
  return { urls };
}

export async function cambiarEstadoProducto(productoId: string, activo: boolean): Promise<void> {
  const empleado = await getEmpleadoActual();
  if (!puedeGestionarCatalogo(empleado)) throw new Error("No autorizado");
  await verificarPropiedad(productoId, empleado!);

  const admin = createAdminClient();
  const { error } = await admin.from("productos").update({ activo }).eq("id", productoId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/productos");
}
