/**
 * Inserta el producto VGR V-484 en Supabase.
 * Uso: node scripts/seed-producto-vgr.mjs
 * Ejecutar DESPUÉS de upload-cloudinary.mjs (genera cloudinary-urls.json)
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Leer .env.local
const envPath = resolve(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .map(line => {
      const [key, ...rest] = line.split('=')
      return [key.trim(), rest.join('=').trim()]
    })
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

// Leer URLs de Cloudinary
const urlsPath = resolve(__dirname, 'cloudinary-urls.json')
if (!existsSync(urlsPath)) {
  console.error('No se encontró cloudinary-urls.json. Ejecuta primero upload-cloudinary.mjs')
  process.exit(1)
}
const imagenes = JSON.parse(readFileSync(urlsPath, 'utf-8'))

async function main() {
  // 1. Crear categoría si no existe
  console.log('Verificando categoría "Belleza y cuidado personal"...')
  const { data: catExistente } = await supabase
    .from('categorias')
    .select('id')
    .eq('slug', 'belleza-cuidado-personal')
    .single()

  let categoriaId

  if (catExistente) {
    categoriaId = catExistente.id
    console.log(`  Categoría existente: ${categoriaId}`)
  } else {
    const { data: catNueva, error: catError } = await supabase
      .from('categorias')
      .insert({
        nombre: 'Belleza y cuidado personal',
        slug: 'belleza-cuidado-personal',
        descripcion: 'Productos de belleza, cuidado del cabello y cuidado personal',
      })
      .select('id')
      .single()

    if (catError) throw catError
    categoriaId = catNueva.id
    console.log(`  Categoría creada: ${categoriaId}`)
  }

  // 2. Insertar producto
  console.log('\nInsertando producto VGR V-484...')
  const { data: producto, error: prodError } = await supabase
    .from('productos')
    .upsert({
      nombre: 'Cepillo Secador Profesional 4 en 1 VGR V-484',
      slug: 'cepillo-secador-vgr-v484',
      precio_venta: 99900,
      precio_anterior: null,
      descripcion: `El Cepillo Secador Profesional 4 en 1 VGR V-484 está diseñado para ofrecer un secado eficiente y un peinado versátil en un solo dispositivo. Su potencia de hasta 1100W y su motor DC proporcionan un rendimiento constante, ideal para conseguir resultados profesionales desde la comodidad del hogar.

Con su diseño ergonómico y materiales resistentes en plástico ABS, este cepillo asegura durabilidad y facilidad de uso en cada sesión de peinado. Su tamaño compacto y peso ligero hacen que sea práctico para transportar, mientras que su cable de 1.8 metros ofrece libertad de movimiento.

Características principales:
• Diseño 4 en 1: secado y peinado en un solo dispositivo
• Motor DC de alto rendimiento
• Potencia de 1000-1100W para un secado eficiente
• 4 ajustes de interruptor para mayor versatilidad
• Fabricado en plástico ABS duradero y ligero
• Cable de 1.8 m para mayor comodidad de uso

Especificaciones:
Modelo: VGR V-484 | Motor: DC | Potencia: 1000-1100W | Velocidad máx: 20000RPM | Tamaño: 36×8×6.8 cm | Peso: 540g | Cable: 1.8m

Incluye: 1x VGR V-484, 1x Manual de usuario`,
      categoria_id: categoriaId,
      imagenes: imagenes,
      video_url: null,
      stock: 10,
      activo: true,
    }, { onConflict: 'slug' })
    .select()
    .single()

  if (prodError) throw prodError

  console.log('\nProducto creado exitosamente:')
  console.log(`  ID: ${producto.id}`)
  console.log(`  Slug: ${producto.slug}`)
  console.log(`  Precio: $${producto.precio_venta.toLocaleString('es-CO')}`)
  console.log(`  Imágenes: ${producto.imagenes.length}`)
  console.log(`\nURL del producto: /producto/${producto.slug}`)
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
