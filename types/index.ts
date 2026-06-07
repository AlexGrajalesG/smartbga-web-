// ================================================================
// TIPOS SMARTBGA CENTRO
// ================================================================

// --- CATALOGO ---

export interface Categoria {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  created_at: string
}

// Niveles de precio mostrados en la pagina de producto segun metodo de pago.
// Distinto de MetodoPago (que rige el pago real de una orden en checkout).
export type NivelPrecio = 'contraentrega' | 'tarjeta' | 'addi' | 'sistecredito'

export interface Producto {
  id: string
  nombre: string
  slug: string
  precio_venta: number
  precio_costo?: number        // solo en contexto admin
  precio_anterior: number | null
  // Desglose opcional por metodo de pago. precio_venta sigue siendo el
  // precio de referencia (= el mas bajo) para carrito, cards y totales.
  precios?: Partial<Record<NivelPrecio, number>> | null
  descripcion: string | null
  categoria_id: string | null
  proveedor_id: string | null
  imagenes: string[]
  video_url: string | null
  stock: number
  activo: boolean
  created_at: string
  categoria?: Categoria
  proveedor?: Proveedor
}

// --- USUARIOS ---

export interface Usuario {
  id: string
  auth_id: string
  nombre: string
  email: string
  celular: string | null
  edad: number | null
  genero: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir' | null
  ciudad: string | null
  barrio: string | null
  created_at: string
}

export interface Empleado {
  id: string
  auth_id: string
  nombre: string
  email: string
  celular: string | null
  rol: 'admin' | 'vendedor' | 'proveedor' | 'vendedor_proveedor'
  proveedor_id: string | null
  activo: boolean
  created_at: string
  proveedor?: Proveedor
}

// --- PROVEEDORES ---

export interface Proveedor {
  id: string
  nombre: string
  contacto: string | null
  celular: string
  email: string | null
  ciudad: string
  barrio: string | null
  descripcion: string | null
  activo: boolean
  modelo_cobro: 'margen' | 'comision' | 'mixto'
  comision_pct: number | null
  terminos_pago: string | null
  created_at: string
}

export interface PuntoVenta {
  id: string
  nombre: string
  proveedor_id: string | null
  direccion: string | null
  activo: boolean
  created_at: string
  proveedor?: Proveedor
}

// --- ECOMMERCE ---

export type EstadoOrden = 'pendiente' | 'confirmada' | 'en_despacho' | 'entregada' | 'cancelada'
export type CanalOrden = 'online' | 'pos'
export type MetodoPago = 'addi' | 'transferencia' | 'efectivo' | 'addi_presencial'

export interface Orden {
  id: string
  usuario_id: string | null
  canal: CanalOrden
  estado: EstadoOrden
  total: number
  direccion_envio: string | null
  metodo_pago: MetodoPago | null
  addi_order_id: string | null
  notas: string | null
  created_at: string
  usuario?: Usuario
  items?: OrdenItem[]
}

export interface OrdenItem {
  id: string
  orden_id: string
  producto_id: string
  proveedor_id: string | null
  cantidad: number
  precio_unitario: number
  precio_costo: number
  created_at: string
  producto?: Producto
  proveedor?: Proveedor
}

// --- POS Y FACTURACION ---

export interface Caja {
  id: string
  punto_venta_id: string
  nombre: string
  activa: boolean
  created_at: string
  punto_venta?: PuntoVenta
}

export interface TurnoCaja {
  id: string
  caja_id: string
  empleado_id: string
  estado: 'abierto' | 'cerrado'
  monto_apertura: number
  monto_cierre: number | null
  diferencia: number | null
  notas_cierre: string | null
  abierto_at: string
  cerrado_at: string | null
  caja?: Caja
  empleado?: Empleado
}

export interface Factura {
  id: string
  numero: number
  punto_venta_id: string
  turno_id: string | null
  empleado_id: string | null
  usuario_id: string | null
  cliente_nombre: string
  cliente_doc: string | null
  subtotal: number
  descuento: number
  total: number
  metodo_pago: 'efectivo' | 'transferencia' | 'addi' | 'addi_presencial' | 'mixto'
  estado: 'emitida' | 'anulada'
  dian_cufe: string | null
  created_at: string
  items?: FacturaItem[]
  punto_venta?: PuntoVenta
}

export interface FacturaItem {
  id: string
  factura_id: string
  producto_id: string | null
  nombre_snapshot: string
  cantidad: number
  precio_unitario: number
  precio_costo: number
  subtotal: number
  created_at: string
  producto?: Producto
}

export interface MovimientoCaja {
  id: string
  turno_id: string
  tipo: 'venta' | 'ingreso' | 'egreso' | 'retiro' | 'apertura'
  descripcion: string | null
  monto: number
  metodo_pago: MetodoPago | null
  factura_id: string | null
  created_at: string
}

// --- CARRITO (estado local, no en BD) ---

export interface ItemCarrito {
  producto: Producto
  cantidad: number
}
