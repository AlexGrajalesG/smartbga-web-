/**
 * Sube las imágenes del producto VGR V-484 a Cloudinary.
 * Uso: node scripts/upload-cloudinary.mjs
 * Requiere credenciales en .env.local
 */
import { v2 as cloudinary } from 'cloudinary'
import { readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Leer .env.local manualmente
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

cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

const IMAGES_DIR = 'C:\\Users\\Usuario\\Downloads\\VGR_V484_web'
const CLOUDINARY_FOLDER = 'smartbga/productos/vgr-v484'

async function main() {
  const files = readdirSync(IMAGES_DIR)
    .filter(f => f.endsWith('.jpg'))
    .sort()

  console.log(`Subiendo ${files.length} imágenes a Cloudinary...`)
  const urls = []

  for (const file of files) {
    const filePath = join(IMAGES_DIR, file)
    const publicId = file.replace('.jpg', '')

    process.stdout.write(`  Subiendo ${file}... `)
    const result = await cloudinary.uploader.upload(filePath, {
      folder: CLOUDINARY_FOLDER,
      public_id: publicId,
      overwrite: true,
      quality: 'auto',
      fetch_format: 'auto',
    })
    urls.push(result.secure_url)
    console.log(`OK (${result.public_id})`)
  }

  console.log('\n--- URLs para Supabase ---')
  console.log(JSON.stringify(urls, null, 2))

  // Guardar en archivo para el siguiente script
  const out = resolve(__dirname, 'cloudinary-urls.json')
  import('fs').then(fs => {
    fs.writeFileSync(out, JSON.stringify(urls, null, 2))
    console.log(`\nGuardado en: ${out}`)
  })
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
