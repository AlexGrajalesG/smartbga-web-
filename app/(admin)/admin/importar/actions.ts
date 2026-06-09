"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getEmpleadoActual, puedeGestionarCatalogo } from "@/lib/auth/empleado";
import { subirImagenProducto } from "@/lib/cloudinary";
import type { NivelPrecio } from "@/types";

export async function subirImagenesImportador(formData: FormData): Promise<{ urls: string[]; errores: string[] }> {
  const empleado = await getEmpleadoActual();
  if (!puedeGestionarCatalogo(empleado)) throw new Error("No autorizado");

  const archivos = formData.getAll("imagenes") as File[];
  if (archivos.length === 0) return { urls: [], errores: [] };
  if (archivos.length > 20) throw new Error("Maximo 20 imagenes a la vez");

  const urls: string[] = [];
  const errores: string[] = [];

  await Promise.all(
    archivos.map(async (archivo) => {
      try {
        // Usa un slug temporal basado en el nombre del archivo
        const slug = "importar/" + archivo.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]/gi, "-").toLowerCase();
        const url = await subirImagenProducto(archivo, slug);
        urls.push(url);
      } catch {
        errores.push(archivo.name);
      }
    })
  );

  return { urls, errores };
}

const NIVELES: NivelPrecio[] = ["contraentrega", "tarjeta", "addi", "sistecredito"];

// Una fila tal como sale de papaparse con { header: true } — todo viene como string.
export interface FilaCSV {
  slug?: string;
  nombre?: string;
  categoria_slug?: string;
  precio_contraentrega?: string;
  precio_tarjeta?: string;
  precio_addi?: string;
  precio_sistecredito?: string;
  precio_anterior?: string;
  stock?: string;
  descripcion?: string;
  imagenes?: string;
  video_url?: string;
}

interface ErrorFila {
  fila: number;
  mensaje: string;
}

export interface ResultadoImportacion {
  creados: number;
  actualizados: number;
  errores: ErrorFila[];
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function numeroOpcional(texto: string | undefined): number | null | undefined {
  const limpio = (texto ?? "").trim();
  if (limpio === "") return null;
  const num = Number(limpio);
  return Number.isNaN(num) ? undefined : num;
}

export async function importarProductosCSV(filas: FilaCSV[]): Promise<ResultadoImportacion> {
  const empleado = await getEmpleadoActual();
  if (!puedeGestionarCatalogo(empleado)) throw new Error("No autorizado");
  if (filas.length === 0) throw new Error("El archivo no tiene filas para importar");
  if (filas.length > 500) throw new Error("Máximo 500 filas por importación");

  const admin = createAdminClient();

  const { data: catExistentes } = await admin.from("categorias").select("id, slug, nombre");
  const categoriaPorSlug = new Map((catExistentes ?? []).map((c) => [c.slug, c.id as string]));
  // También indexar por nombre normalizado para matching flexible
  const categoriaPorNombre = new Map(
    (catExistentes ?? []).map((c) => [slugify(c.nombre), c.id as string])
  );

  // Pre-crear categorías desconocidas que aparecen en el CSV
  const catsEnCSV = new Set(
    filas.map((f) => (f.categoria_slug ?? "").trim()).filter(Boolean)
  );
  for (const catRaw of catsEnCSV) {
    const catSlug = slugify(catRaw);
    if (!categoriaPorSlug.has(catSlug) && !categoriaPorSlug.has(catRaw)) {
      // Intentar match por nombre primero
      const idPorNombre = categoriaPorNombre.get(catSlug);
      if (idPorNombre) {
        categoriaPorSlug.set(catRaw, idPorNombre);
        categoriaPorSlug.set(catSlug, idPorNombre);
      } else {
        // Crear la categoría automáticamente
        const nombre = catRaw
          .split(/[\s-]+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        const { data: nueva } = await admin
          .from("categorias")
          .insert({ slug: catSlug, nombre, descripcion: null })
          .select("id")
          .single();
        if (nueva) {
          categoriaPorSlug.set(catRaw, nueva.id);
          categoriaPorSlug.set(catSlug, nueva.id);
        }
      }
    }
  }

  const errores: ErrorFila[] = [];
  const filasValidas: Record<string, unknown>[] = [];
  const slugsVistos = new Set<string>();

  filas.forEach((fila, idx) => {
    const numeroFila = idx + 2; // +1 por encabezado, +1 por indice base 1
    const agregarError = (mensaje: string) => errores.push({ fila: numeroFila, mensaje });

    const slug = (fila.slug ?? "").trim().toLowerCase();
    const nombre = (fila.nombre ?? "").trim();

    if (!slug || !SLUG_RE.test(slug)) {
      agregarError(`Slug inválido o vacío: "${fila.slug ?? ""}"`);
      return;
    }
    if (slugsVistos.has(slug)) {
      agregarError(`Slug duplicado dentro del archivo: "${slug}"`);
      return;
    }
    if (!nombre) {
      agregarError("El nombre es obligatorio");
      return;
    }

    let categoria_id: string | null = null;
    const categoriaRaw = (fila.categoria_slug ?? "").trim();
    if (categoriaRaw) {
      const id = categoriaPorSlug.get(categoriaRaw) ?? categoriaPorSlug.get(slugify(categoriaRaw));
      categoria_id = id ?? null;
      // Si aun no se encontro (fallo la creacion), continua sin categoria
    }

    const precios: Record<string, number> = {};
    let preciosInvalidos = false;
    for (const nivel of NIVELES) {
      const valor = numeroOpcional(fila[`precio_${nivel}` as keyof FilaCSV]);
      if (valor === undefined) {
        agregarError(`Precio "${nivel}" no es un número válido`);
        preciosInvalidos = true;
        break;
      }
      if (valor !== null && valor >= 0) precios[nivel] = valor;
    }
    if (preciosInvalidos) return;

    if (Object.keys(precios).length === 0) {
      agregarError("La fila debe tener al menos un precio (contraentrega, tarjeta, addi o sistecredito)");
      return;
    }
    const precio_venta = Math.min(...Object.values(precios));

    const precioAnterior = numeroOpcional(fila.precio_anterior);
    if (precioAnterior === undefined) {
      agregarError(`Precio anterior no es un número válido: "${fila.precio_anterior ?? ""}"`);
      return;
    }

    const stockTexto = (fila.stock ?? "").trim();
    const stock = stockTexto === "" ? 0 : Number(stockTexto);
    if (Number.isNaN(stock) || stock < 0) {
      agregarError(`Stock no es un número válido: "${fila.stock ?? ""}"`);
      return;
    }

    const imagenes = (fila.imagenes ?? "")
      .split(";")
      .map((u) => u.trim())
      .filter((u) => u !== "");

    const video_url = (fila.video_url ?? "").trim() || null;

    slugsVistos.add(slug);
    filasValidas.push({
      slug,
      nombre,
      categoria_id,
      precios,
      precio_venta,
      precio_anterior: precioAnterior,
      stock,
      descripcion: (fila.descripcion ?? "").trim() || null,
      imagenes,
      video_url,
      proveedor_id: empleado!.rol === "admin" ? null : empleado!.proveedor_id,
      activo: true,
    });
  });

  if (filasValidas.length === 0) {
    return { creados: 0, actualizados: 0, errores };
  }

  const slugsValidos = filasValidas.map((f) => f.slug as string);
  const { data: existentes } = await admin.from("productos").select("slug").in("slug", slugsValidos);
  const slugsExistentes = new Set((existentes ?? []).map((p) => p.slug as string));

  const { error } = await admin.from("productos").upsert(filasValidas, { onConflict: "slug" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/productos");

  const actualizados = slugsValidos.filter((s) => slugsExistentes.has(s)).length;
  return {
    creados: filasValidas.length - actualizados,
    actualizados,
    errores,
  };
}
