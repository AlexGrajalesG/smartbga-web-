import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envContent = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()] })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// precio_venta = el mas bajo (contraentrega) — es el que usan carrito, cards y totales
const precios = {
  contraentrega: 110000,
  tarjeta: 115000,
  addi: 125000,
  sistecredito: 137000,
}

const { error } = await supabase
  .from('productos')
  .update({ precio_venta: precios.contraentrega, precios })
  .eq('slug', 'cepillo-secador-vgr-v484')

if (error) { console.error(error.message); process.exit(1) }
console.log('precios actualizados correctamente:', precios)
