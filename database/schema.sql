-- Script SQL para crear las tablas en Supabase

-- 1. Tabla usuario
CREATE TABLE IF NOT EXISTS usuario (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabla asignatura
CREATE TABLE IF NOT EXISTS asignatura (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  maxClasesSemana INTEGER NOT NULL CHECK (maxClasesSemana >= 1 AND maxClasesSemana <= 10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabla schedules
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  dia VARCHAR(20) NOT NULL CHECK (dia IN ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO')),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  id_asignatura INTEGER NOT NULL REFERENCES asignatura(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_hora_fin_after_inicio CHECK (hora_fin > hora_inicio)
);

-- 4. Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_schedules_usuario ON schedules(id_usuario);
CREATE INDEX IF NOT EXISTS idx_schedules_asignatura ON schedules(id_asignatura);
CREATE INDEX IF NOT EXISTS idx_schedules_dia ON schedules(dia);
CREATE INDEX IF NOT EXISTS idx_usuario_correo ON usuario(correo);
CREATE INDEX IF NOT EXISTS idx_asignatura_nombre ON asignatura(nombre);

-- 5. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Triggers para actualizar updated_at
CREATE TRIGGER update_usuario_updated_at BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asignatura_updated_at BEFORE UPDATE ON asignatura
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

