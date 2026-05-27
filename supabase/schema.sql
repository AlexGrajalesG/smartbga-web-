-- Schema SmartBga
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS categorias (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  slug        text UNIQUE NOT NULL,
  descripcion text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS productos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           text NOT NULL,
  slug             text UNIQUE NOT NULL,
  precio           numeric(10,2) NOT NULL,
  precio_anterior  numeric(10,2),
  descripcion      text,
  categoria_id     uuid REFERENCES categorias(id) ON DELETE SET NULL,
  imagenes         text[] DEFAULT '{}',
  video_url        text,
  stock            integer DEFAULT 0,
  activo           boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS productos_slug_idx ON productos(slug);
CREATE INDEX IF NOT EXISTS productos_categoria_idx ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS productos_activo_idx ON productos(activo);

-- Row Level Security
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Lectura pública (catálogo visible para todos)
CREATE POLICY "categorias_public_read" ON categorias
  FOR SELECT USING (true);

CREATE POLICY "productos_public_read" ON productos
  FOR SELECT USING (activo = true);
