-- Datos de ejemplo para probar el Calendario Semanal
-- Ejecutar después de crear las tablas principales

-- =====================================================
-- 1. Insertar usuarios de ejemplo
-- =====================================================
INSERT INTO usuario (nombre, correo, telefono, password) VALUES
('Juan Pérez', 'juan.perez@example.com', '555-0101', 'hashed_password_1'),
('María García', 'maria.garcia@example.com', '555-0102', 'hashed_password_2'),
('Carlos López', 'carlos.lopez@example.com', '555-0103', 'hashed_password_3'),
('Ana Martínez', 'ana.martinez@example.com', '555-0104', 'hashed_password_4')
ON CONFLICT (correo) DO NOTHING;

-- =====================================================
-- 2. Insertar asignaturas de ejemplo
-- =====================================================
INSERT INTO asignatura (nombre, descripcion, maxClasesSemana) VALUES
('Matemáticas', 'Curso de matemáticas avanzadas', 5),
('Física', 'Fundamentos de física', 4),
('Química', 'Química general y orgánica', 4),
('Inglés', 'Inglés intermedio', 3),
('Historia', 'Historia universal', 3),
('Programación', 'Introducción a la programación', 5),
('Literatura', 'Literatura contemporánea', 2),
('Biología', 'Biología celular', 4),
('Educación Física', 'Actividad física y deporte', 2),
('Arte', 'Expresión artística', 2)
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- 3. Insertar horarios de ejemplo - Usuario 1
-- =====================================================

-- LUNES - Usuario 1
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('LUNES', '08:00', '09:30', 1, 1),    -- Matemáticas
('LUNES', '10:00', '11:30', 1, 2),    -- Física
('LUNES', '13:00', '14:30', 1, 6);    -- Programación

-- MARTES - Usuario 1
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('MARTES', '08:00', '09:30', 1, 3),   -- Química
('MARTES', '10:00', '11:30', 1, 4),   -- Inglés
('MARTES', '14:00', '15:30', 1, 7);   -- Literatura

-- MIERCOLES - Usuario 1
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('MIERCOLES', '08:00', '09:30', 1, 1),  -- Matemáticas
('MIERCOLES', '10:00', '11:30', 1, 8),  -- Biología
('MIERCOLES', '13:00', '14:30', 1, 6);  -- Programación

-- JUEVES - Usuario 1
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('JUEVES', '08:00', '09:30', 1, 2),    -- Física
('JUEVES', '10:00', '11:30', 1, 5),    -- Historia
('JUEVES', '14:00', '15:30', 1, 9);    -- Educación Física

-- VIERNES - Usuario 1
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('VIERNES', '08:00', '09:30', 1, 1),   -- Matemáticas
('VIERNES', '10:00', '11:30', 1, 4),   -- Inglés
('VIERNES', '13:00', '14:30', 1, 10);  -- Arte

-- SABADO - Usuario 1
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('SABADO', '09:00', '10:30', 1, 6),    -- Programación
('SABADO', '11:00', '12:30', 1, 8);    -- Biología

-- =====================================================
-- 4. Insertar horarios de ejemplo - Usuario 2
-- =====================================================

-- LUNES - Usuario 2
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('LUNES', '09:00', '10:30', 2, 2),     -- Física
('LUNES', '11:00', '12:30', 2, 4),     -- Inglés
('LUNES', '14:00', '15:30', 2, 7);     -- Literatura

-- MARTES - Usuario 2
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('MARTES', '08:00', '09:30', 2, 1),    -- Matemáticas
('MARTES', '10:00', '11:30', 2, 3),    -- Química
('MARTES', '15:00', '16:30', 2, 9);    -- Educación Física

-- MIERCOLES - Usuario 2
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('MIERCOLES', '09:00', '10:30', 2, 2),  -- Física
('MIERCOLES', '11:00', '12:30', 2, 5),  -- Historia
('MIERCOLES', '14:00', '15:30', 2, 10); -- Arte

-- JUEVES - Usuario 2
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('JUEVES', '08:00', '09:30', 2, 1),     -- Matemáticas
('JUEVES', '10:00', '11:30', 2, 8),     -- Biología
('JUEVES', '13:00', '14:30', 2, 6);     -- Programación

-- VIERNES - Usuario 2
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('VIERNES', '09:00', '10:30', 2, 4),    -- Inglés
('VIERNES', '11:00', '12:30', 2, 3),    -- Química
('VIERNES', '14:00', '15:30', 2, 7);    -- Literatura

-- DOMINGO - Usuario 2
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('DOMINGO', '10:00', '11:30', 2, 6);    -- Programación

-- =====================================================
-- 5. Insertar horarios de ejemplo - Usuario 3
-- =====================================================

-- LUNES - Usuario 3
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('LUNES', '07:00', '08:30', 3, 6),      -- Programación
('LUNES', '09:00', '10:30', 3, 1),      -- Matemáticas
('LUNES', '11:00', '12:30', 3, 2),      -- Física
('LUNES', '14:00', '15:30', 3, 4);      -- Inglés

-- MARTES - Usuario 3
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('MARTES', '08:00', '09:30', 3, 8),     -- Biología
('MARTES', '10:00', '11:30', 3, 3),     -- Química
('MARTES', '13:00', '14:30', 3, 5);     -- Historia

-- MIERCOLES - Usuario 3
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('MIERCOLES', '07:00', '08:30', 3, 6),   -- Programación
('MIERCOLES', '09:00', '10:30', 3, 1),   -- Matemáticas
('MIERCOLES', '11:00', '12:30', 3, 9),   -- Educación Física
('MIERCOLES', '14:00', '15:30', 3, 7);   -- Literatura

-- JUEVES - Usuario 3
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('JUEVES', '08:00', '09:30', 3, 2),      -- Física
('JUEVES', '10:00', '11:30', 3, 4),      -- Inglés
('JUEVES', '13:00', '14:30', 3, 10);     -- Arte

-- VIERNES - Usuario 3
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('VIERNES', '07:00', '08:30', 3, 6),     -- Programación
('VIERNES', '09:00', '10:30', 3, 1),     -- Matemáticas
('VIERNES', '11:00', '12:30', 3, 8),     -- Biología
('VIERNES', '14:00', '15:30', 3, 3);     -- Química

-- SABADO - Usuario 3
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('SABADO', '09:00', '11:00', 3, 6);      -- Programación (clase larga)

-- =====================================================
-- 6. Verificar los datos insertados
-- =====================================================

-- Contar usuarios
SELECT 'Total de usuarios:', COUNT(*) FROM usuario;

-- Contar asignaturas
SELECT 'Total de asignaturas:', COUNT(*) FROM asignatura;

-- Contar horarios por usuario
SELECT 
    u.nombre as usuario,
    COUNT(s.id) as total_horarios
FROM usuario u
LEFT JOIN schedules s ON u.id = s.id_usuario
GROUP BY u.id, u.nombre
ORDER BY u.id;

-- Ver distribución de horarios por día
SELECT 
    dia,
    COUNT(*) as total_clases
FROM schedules
GROUP BY dia
ORDER BY 
    CASE dia
        WHEN 'LUNES' THEN 1
        WHEN 'MARTES' THEN 2
        WHEN 'MIERCOLES' THEN 3
        WHEN 'JUEVES' THEN 4
        WHEN 'VIERNES' THEN 5
        WHEN 'SABADO' THEN 6
        WHEN 'DOMINGO' THEN 7
    END;

