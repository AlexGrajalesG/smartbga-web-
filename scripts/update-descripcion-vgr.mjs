/**
 * Actualiza la descripcion del VGR V-484 con la copy final de marketing.
 * Uso: node scripts/update-descripcion-vgr.mjs
 * Requiere credenciales en .env.local
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const SLUG = 'cepillo-secador-vgr-v484'

const DESCRIPCION = `¿Cansada de usar secador, plancha y cepillo por separado dañando tu cabello? 😫❌ El VGR V-484 llega para simplificar tu rutina. Gracias a su diseño multifuncional 4 en 1, te permite secar, alisar, dar volumen y ondular con un solo dispositivo. Equipado con tecnología de iones negativos, reduce el frizz drásticamente, sella las cutículas y deja un brillo espectacular desde la primera pasada. ¡Tu cabello perfecto todos los días! ⭐✅

🎁 ¡SÍGUENOS Y AHORRA MÁS!
⭐ 5% OFF por seguirnos en Instagram o Facebook 🔵
⭐ 5% OFF por seguirnos en TikTok 🔴
⭐ 5% OFF por agregarnos en WhatsApp 🟢
¡Acumula hasta el 15% de DESCUENTO total! ⭐⭐⭐

⭕ BENEFICIOS Y FUNCIONES DESTACADAS
✅ Multifuncional 4 en 1: incluye 4 cabezales intercambiables diseñados para secar, alisar, peinar, rizar y dar un volumen increíble desde la raíz.
✅ Tecnología de Iones Negativos: genera millones de iones que eliminan la estática y el frizz, reteniendo la humedad natural para un cabello sedoso y saludable.
✅ Control de Temperatura Inteligente: 3 niveles de calor y velocidad ajustables para adaptarse perfectamente a todo tipo de cabello (fino, grueso o rizado) sin maltratarlo.
✅ Revestimiento de Cerámica: distribuye el calor de manera uniforme, evitando los puntos calientes que queman el cabello y garantizando un deslizamiento suave.
✅ Cable Giratorio de 360°: diseñado para un manejo cómodo y sin enredos, permitiéndote mover el cepillo en cualquier ángulo con total libertad.

📋 CARACTERÍSTICAS TÉCNICAS
Marca: VGR (Línea Profesional)
Modelo: V-484
Potencia de motor: alto rendimiento para un secado rápido
Cabezales: 4 accesorios intercambiables de fácil clic
Voltaje: compatible con conexiones estándar para el hogar
Garantía: 4 meses por defectos de fábrica en el motor o sistema de calentamiento 🛡️ (no cubre cables partidos por tirones, cabezales rotos por caídas, ni daños internos por acumulación excesiva de cabello o agua en las rejillas)

💡 Honestidad Smart: este cepillo profesional optimiza el tiempo de secado de una forma increíble. Dato clave: los cabezales son muy fáciles de cambiar, solo asegúrate de hacerlo cuando el equipo esté frío para evitar quemaduras. Tip Pro: para lograr un liso de revista con un volumen espectacular, retira el exceso de humedad de tu cabello con una toalla (déjalo un 70% seco) antes de moldearlo con los cabezales; así el peinado durará mucho más tiempo intacto. 💇‍♀️🔥

📦 CONTENIDO DEL PAQUETE
🔻 1 x Cuerpo de Cepillo Secador VGR V-484
🔻 4 x Cabezales intercambiables de estilizado
🔻 1 x Manual de instrucciones de peinado

🏪 Tienda física: Calle 122 27a 16, Floridablanca, Santander · 📦 Envíos nacionales · 🛵 Domicilios en Bucaramanga y área metropolitana`

async function main() {
  const { data, error } = await sb
    .from('productos')
    .update({ descripcion: DESCRIPCION })
    .eq('slug', SLUG)
    .select('slug, descripcion')
    .single()

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(`Descripción actualizada para "${data.slug}" (${data.descripcion.length} caracteres)`)
}

main()
