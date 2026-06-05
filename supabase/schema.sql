-- ================================================================
-- SCHEMA SMARTBGA CENTRO
-- Ecommerce + Marketplace Dropshipping + POS + Facturacion
--
-- INSTRUCCIONES:
-- 1. Abrir Supabase Dashboard → SQL Editor
-- 2. Pegar este archivo completo y ejecutar
-- 3. Si ya tienes tablas previas (categorias, productos), borrarlas
--    primero con DROP TABLE IF EXISTS ... CASCADE;
-- ================================================================


-- ================================================================
-- MODULO 1: PROVEEDORES Y PUNTOS DE VENTA
-- (van primero porque otros modulos los referencian)
-- ================================================================

CREATE TABLE IF NOT EXISTS proveedores (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        text NOT NULL,
  contacto      text,
  celular       text NOT NULL,
  email         text,
  ciudad        text NOT NULL DEFAULT 'Bucaramanga',
  barrio        text,
  descripcion   text,
  activo        boolean NOT NULL DEFAULT true,
  modelo_cobro  text NOT NULL DEFAULT 'margen'
                CHECK (modelo_cobro IN ('margen', 'comision', 'mixto')),
  comision_pct  numeric(5,4) CHECK (comision_pct >= 0 AND comision_pct <= 1),
  terminos_pago text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS puntos_venta (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        text NOT NULL,
  proveedor_id  uuid REFERENCES proveedores(id) ON DELETE SET NULL,
  direccion     text,
  activo        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Punto de venta de SmartBga por defecto
INSERT INTO puntos_venta (nombre, direccion)
VALUES ('SmartBga Principal', 'Bucaramanga')
ON CONFLICT DO NOTHING;


-- ================================================================
-- MODULO 2: USUARIOS (clientes) Y EMPLEADOS (staff + proveedores)
-- ================================================================

-- Clientes que se registran en la tienda online
CREATE TABLE IF NOT EXISTS usuarios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre        text NOT NULL,
  email         text UNIQUE NOT NULL,
  celular       text,
  edad          integer CHECK (edad > 0 AND edad < 120),
  genero        text CHECK (genero IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
  ciudad        text,
  barrio        text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Staff de SmartBga y usuarios de portal proveedor
CREATE TABLE IF NOT EXISTS empleados (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre        text NOT NULL,
  email         text UNIQUE NOT NULL,
  celular       text,
  rol           text NOT NULL DEFAULT 'vendedor'
                CHECK (rol IN ('admin', 'vendedor', 'proveedor', 'vendedor_proveedor')),
  proveedor_id  uuid REFERENCES proveedores(id) ON DELETE SET NULL,
  activo        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);


-- ================================================================
-- MODULO 3: CATALOGO
-- ================================================================

CREATE TABLE IF NOT EXISTS categorias (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        text NOT NULL,
  slug          text UNIQUE NOT NULL,
  descripcion   text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS productos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text NOT NULL,
  slug            text UNIQUE NOT NULL,
  precio_venta    numeric(12,2) NOT NULL CHECK (precio_venta >= 0),
  precio_costo    numeric(12,2) CHECK (precio_costo >= 0),
  precio_anterior numeric(12,2),
  descripcion     text,
  categoria_id    uuid REFERENCES categorias(id) ON DELETE SET NULL,
  proveedor_id    uuid REFERENCES proveedores(id) ON DELETE SET NULL,
  imagenes        text[] NOT NULL DEFAULT '{}',
  video_url       text,
  stock           integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  activo          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS productos_slug_idx        ON productos(slug);
CREATE INDEX IF NOT EXISTS productos_categoria_idx   ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS productos_proveedor_idx   ON productos(proveedor_id);
CREATE INDEX IF NOT EXISTS productos_activo_idx      ON productos(activo);


-- ================================================================
-- MODULO 4: ECOMMERCE (ventas online)
-- ================================================================

CREATE TABLE IF NOT EXISTS ordenes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  canal           text NOT NULL DEFAULT 'online'
                  CHECK (canal IN ('online', 'pos')),
  estado          text NOT NULL DEFAULT 'pendiente'
                  CHECK (estado IN ('pendiente', 'confirmada', 'en_despacho', 'entregada', 'cancelada')),
  total           numeric(12,2) NOT NULL CHECK (total >= 0),
  direccion_envio text,
  metodo_pago     text CHECK (metodo_pago IN ('addi', 'transferencia', 'efectivo', 'addi_presencial')),
  addi_order_id   text,
  notas           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orden_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id        uuid NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  producto_id     uuid NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  proveedor_id    uuid REFERENCES proveedores(id) ON DELETE SET NULL,
  cantidad        integer NOT NULL CHECK (cantidad > 0),
  precio_unitario numeric(12,2) NOT NULL CHECK (precio_unitario >= 0),
  precio_costo    numeric(12,2) NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notificaciones_proveedor (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id    uuid NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  orden_item_id   uuid NOT NULL REFERENCES orden_items(id) ON DELETE CASCADE,
  canal           text NOT NULL DEFAULT 'whatsapp'
                  CHECK (canal IN ('whatsapp', 'email')),
  estado          text NOT NULL DEFAULT 'enviada'
                  CHECK (estado IN ('enviada', 'confirmada', 'despachado')),
  enviada_at      timestamptz NOT NULL DEFAULT now(),
  confirmada_at   timestamptz,
  despachado_at   timestamptz
);

CREATE INDEX IF NOT EXISTS ordenes_usuario_idx    ON ordenes(usuario_id);
CREATE INDEX IF NOT EXISTS ordenes_estado_idx     ON ordenes(estado);
CREATE INDEX IF NOT EXISTS ordenes_canal_idx      ON ordenes(canal);
CREATE INDEX IF NOT EXISTS orden_items_orden_idx  ON orden_items(orden_id);
CREATE INDEX IF NOT EXISTS notif_proveedor_idx    ON notificaciones_proveedor(proveedor_id, estado);


-- ================================================================
-- MODULO 5: POS Y FACTURACION
-- ================================================================

CREATE TABLE IF NOT EXISTS cajas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  punto_venta_id  uuid NOT NULL REFERENCES puntos_venta(id) ON DELETE CASCADE,
  nombre          text NOT NULL,
  activa          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS turnos_caja (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caja_id         uuid NOT NULL REFERENCES cajas(id) ON DELETE RESTRICT,
  empleado_id     uuid NOT NULL REFERENCES empleados(id) ON DELETE RESTRICT,
  estado          text NOT NULL DEFAULT 'abierto'
                  CHECK (estado IN ('abierto', 'cerrado')),
  monto_apertura  numeric(12,2) NOT NULL DEFAULT 0,
  monto_cierre    numeric(12,2),
  diferencia      numeric(12,2),
  notas_cierre    text,
  abierto_at      timestamptz NOT NULL DEFAULT now(),
  cerrado_at      timestamptz
);

CREATE TABLE IF NOT EXISTS facturas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero          integer NOT NULL,
  punto_venta_id  uuid NOT NULL REFERENCES puntos_venta(id) ON DELETE RESTRICT,
  turno_id        uuid REFERENCES turnos_caja(id) ON DELETE SET NULL,
  empleado_id     uuid REFERENCES empleados(id) ON DELETE SET NULL,
  usuario_id      uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  cliente_nombre  text NOT NULL DEFAULT 'Consumidor Final',
  cliente_doc     text,
  subtotal        numeric(12,2) NOT NULL DEFAULT 0,
  descuento       numeric(12,2) NOT NULL DEFAULT 0,
  total           numeric(12,2) NOT NULL DEFAULT 0,
  metodo_pago     text NOT NULL
                  CHECK (metodo_pago IN ('efectivo', 'transferencia', 'addi', 'addi_presencial', 'mixto')),
  estado          text NOT NULL DEFAULT 'emitida'
                  CHECK (estado IN ('emitida', 'anulada')),
  dian_cufe       text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (punto_venta_id, numero)
);

CREATE TABLE IF NOT EXISTS factura_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id      uuid NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  producto_id     uuid REFERENCES productos(id) ON DELETE SET NULL,
  nombre_snapshot text NOT NULL,
  cantidad        integer NOT NULL CHECK (cantidad > 0),
  precio_unitario numeric(12,2) NOT NULL CHECK (precio_unitario >= 0),
  precio_costo    numeric(12,2) NOT NULL DEFAULT 0,
  subtotal        numeric(12,2) NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS movimientos_caja (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turno_id        uuid NOT NULL REFERENCES turnos_caja(id) ON DELETE RESTRICT,
  tipo            text NOT NULL
                  CHECK (tipo IN ('venta', 'ingreso', 'egreso', 'retiro', 'apertura')),
  descripcion     text,
  monto           numeric(12,2) NOT NULL,
  metodo_pago     text CHECK (metodo_pago IN ('efectivo', 'transferencia', 'addi', 'addi_presencial')),
  factura_id      uuid REFERENCES facturas(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS facturas_punto_venta_idx  ON facturas(punto_venta_id, created_at DESC);
CREATE INDEX IF NOT EXISTS turnos_caja_idx           ON turnos_caja(caja_id, estado);
CREATE INDEX IF NOT EXISTS movimientos_caja_idx      ON movimientos_caja(turno_id);


-- ================================================================
-- FUNCION: Numero consecutivo de factura por punto de venta
-- ================================================================

CREATE OR REPLACE FUNCTION next_factura_number(p_punto_venta_id uuid)
RETURNS integer
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(MAX(numero), 0) + 1
  FROM facturas
  WHERE punto_venta_id = p_punto_venta_id;
$$;


-- ================================================================
-- FUNCION: Helper para verificar si el usuario autenticado es admin
-- (usada en las politicas RLS)
-- ================================================================

CREATE OR REPLACE FUNCTION is_empleado_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM empleados
    WHERE auth_id = auth.uid()
      AND rol = 'admin'
      AND activo = true
  );
$$;


-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE usuarios                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores               ENABLE ROW LEVEL SECURITY;
ALTER TABLE puntos_venta              ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias                ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_items               ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones_proveedor  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cajas                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos_caja               ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja          ENABLE ROW LEVEL SECURITY;

-- CATEGORIAS: lectura publica
CREATE POLICY "categorias_public_read" ON categorias
  FOR SELECT USING (true);

-- PRODUCTOS: lectura publica de productos activos
-- Nota: precio_costo nunca se consulta desde el frontend publico (disciplina de codigo)
CREATE POLICY "productos_public_read" ON productos
  FOR SELECT USING (activo = true);

-- USUARIOS: cada cliente ve y edita solo su propio perfil
CREATE POLICY "usuarios_self_read" ON usuarios
  FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "usuarios_self_insert" ON usuarios
  FOR INSERT WITH CHECK (auth_id = auth.uid());

CREATE POLICY "usuarios_self_update" ON usuarios
  FOR UPDATE USING (auth_id = auth.uid());

-- ORDENES: cliente ve solo las suyas
CREATE POLICY "ordenes_user_read" ON ordenes
  FOR SELECT USING (
    usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid())
  );

CREATE POLICY "ordenes_user_insert" ON ordenes
  FOR INSERT WITH CHECK (
    usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid())
  );

-- ORDEN_ITEMS: cliente ve los items de sus ordenes
CREATE POLICY "orden_items_user_read" ON orden_items
  FOR SELECT USING (
    orden_id IN (
      SELECT id FROM ordenes
      WHERE usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "orden_items_user_insert" ON orden_items
  FOR INSERT WITH CHECK (
    orden_id IN (
      SELECT id FROM ordenes
      WHERE usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    )
  );

-- Nota: todas las operaciones de admin (CRUD productos, proveedores, ordenes POS,
-- turnos, facturas, etc.) se hacen desde el servidor Next.js usando SUPABASE_SERVICE_ROLE_KEY
-- que bypasea RLS completamente. No se necesitan politicas admin adicionales para el MVP.
