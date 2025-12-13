-- ============================================================
-- BASE DE DATOS: GENERADOR DE TABLAS DE BINGO
-- Autor: Sistema de Bingo para Juan
-- Descripción: Base de datos completa con sistema de créditos,
--              usuarios, plantillas, lotes y números sin repetir
-- ============================================================

-- Eliminar base de datos si existe (para desarrollo)
DROP DATABASE IF EXISTS bingo_generator;

-- Crear base de datos
CREATE DATABASE bingo_generator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE bingo_generator;

-- ============================================================
-- TABLA: usuarios
-- Descripción: Almacena todos los usuarios del sistema
--              (usuarios normales y administradores)
-- ============================================================
CREATE TABLE usuarios (
    -- ID único del usuario (clave primaria)
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Nombre completo del usuario
    nombre VARCHAR(100) NOT NULL,
    
    -- Correo electrónico (único, se usa para login)
    email VARCHAR(150) NOT NULL UNIQUE,
    
    -- Contraseña encriptada (bcrypt)
    password_hash VARCHAR(255) NOT NULL,
    
    -- Créditos/monedas disponibles para generar PDFs
    creditos INT DEFAULT 0,
    
    -- Indica si el usuario es administrador (0 = no, 1 = sí)
    es_admin TINYINT(1) DEFAULT 0,
    
    -- Estado de la cuenta (1 = activa, 0 = inactiva/bloqueada)
    activo TINYINT(1) DEFAULT 1,
    
    -- Fecha de registro del usuario
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Fecha de última actualización
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para búsquedas rápidas
    INDEX idx_email (email),
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: transacciones_creditos
-- Descripción: Historial de movimientos de créditos
--              (recargas, usos, regalos del admin)
-- ============================================================
CREATE TABLE transacciones_creditos (
    -- ID único de la transacción
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- ID del usuario que realizó/recibió la transacción
    usuario_id INT NOT NULL,
    
    -- Tipo de transacción:
    -- 'recarga' = usuario compró créditos
    -- 'uso' = usuario gastó créditos generando PDF
    -- 'regalo' = admin regaló créditos
    -- 'ajuste' = admin ajustó manualmente los créditos
    tipo ENUM('recarga', 'uso', 'regalo', 'ajuste') NOT NULL,
    
    -- Cantidad de créditos (positivo = suma, negativo = resta)
    cantidad INT NOT NULL,
    
    -- Descripción del movimiento
    descripcion VARCHAR(255),
    
    -- ID del admin que realizó la transacción (si aplica)
    admin_id INT,
    
    -- Fecha de la transacción
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Relaciones con otras tablas
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices para búsquedas rápidas
    INDEX idx_usuario (usuario_id),
    INDEX idx_tipo (tipo),
    INDEX idx_fecha (fecha)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: plantillas
-- Descripción: Almacena las plantillas de tablas de bingo
--              creadas por los usuarios (diseño de la tabla)
-- ============================================================
CREATE TABLE plantillas (
    -- ID único de la plantilla
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- ID del usuario que creó la plantilla
    usuario_id INT NOT NULL,
    
    -- Nombre de la plantilla (ej: "Bingo 5x5 Tradicional")
    nombre VARCHAR(100) NOT NULL,
    
    -- Número de filas de la tabla
    filas INT NOT NULL,
    
    -- Número de columnas de la tabla
    columnas INT NOT NULL,
    
    -- Configuración de la cuadrícula en formato JSON
    -- Ejemplo: [[true, false, true], [true, true, false]]
    -- true = celda activa, false = celda inactiva
    grid_json TEXT NOT NULL,
    
    -- Configuración de iconos/formas de cada celda en formato JSON
    -- Ejemplo: [["cuadrado", "corazon", "rombo"], ["A", "X", "G"]]
    iconos_json TEXT,
    
    -- Ruta o nombre del archivo de imagen del encabezado
    encabezado_img VARCHAR(255),
    
    -- Texto del encabezado (si no usa imagen)
    encabezado_texto VARCHAR(200),
    
    -- Rango mínimo de números permitidos
    numero_min INT DEFAULT 1,
    
    -- Rango máximo de números permitidos
    numero_max INT DEFAULT 90,
    
    -- Si usa numeración por columna (tipo bingo americano)
    usa_columnas_especificas TINYINT(1) DEFAULT 0,
    
    -- Configuración de rangos por columna en formato JSON
    -- Ejemplo: [[1,15], [16,30], [31,45], [46,60], [61,75]]
    rangos_columnas_json TEXT,
    
    -- Fecha de creación de la plantilla
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Fecha de última actualización
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Relaciones con otras tablas
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Índices para búsquedas rápidas
    INDEX idx_usuario (usuario_id),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: lotes
-- Descripción: Almacena los lotes de tablas de bingo generados
--              (cada lote puede tener múltiples tablas)
-- ============================================================
CREATE TABLE lotes (
    -- ID único del lote
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- ID de la plantilla usada para este lote
    plantilla_id INT NOT NULL,
    
    -- ID del usuario que generó el lote
    usuario_id INT NOT NULL,
    
    -- Cantidad de tablas generadas en este lote
    cantidad_tablas INT NOT NULL,
    
    -- Cantidad de tablas por página del PDF
    tablas_por_pagina INT DEFAULT 1,
    
    -- Tipo de PDF generado: 'prueba' o 'final'
    tipo_pdf ENUM('prueba', 'final') DEFAULT 'prueba',
    
    -- Costo en créditos (0 para prueba, mayor a 0 para final)
    costo_creditos INT DEFAULT 0,
    
    -- Ruta donde se guardó el PDF generado
    pdf_path VARCHAR(255),
    
    -- Estado del lote: 'generando', 'completado', 'error'
    estado ENUM('generando', 'completado', 'error') DEFAULT 'generando',
    
    -- Fecha de creación del lote
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Relaciones con otras tablas
    FOREIGN KEY (plantilla_id) REFERENCES plantillas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Índices para búsquedas rápidas
    INDEX idx_usuario (usuario_id),
    INDEX idx_plantilla (plantilla_id),
    INDEX idx_tipo (tipo_pdf),
    INDEX idx_fecha (creado_en)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: numeros_usados
-- Descripción: Almacena todos los números usados en cada lote
--              para evitar repeticiones entre lotes diferentes
-- ============================================================
CREATE TABLE numeros_usados (
    -- ID único del registro
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- ID del lote al que pertenece este número
    lote_id INT NOT NULL,
    
    -- ID de la plantilla (para agrupar números por tipo de juego)
    plantilla_id INT NOT NULL,
    
    -- Índice de la tabla dentro del lote (empieza en 0)
    tabla_index INT NOT NULL,
    
    -- Fila donde está el número en la tabla
    fila INT NOT NULL,
    
    -- Columna donde está el número en la tabla
    columna INT NOT NULL,
    
    -- El número que se usó
    numero INT NOT NULL,
    
    -- Fecha en que se usó este número
    usado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Relaciones con otras tablas
    FOREIGN KEY (lote_id) REFERENCES lotes(id) ON DELETE CASCADE,
    FOREIGN KEY (plantilla_id) REFERENCES plantillas(id) ON DELETE CASCADE,
    
    -- Índice único para evitar duplicados del mismo número en la misma plantilla
    -- NOTA: Comentado porque puede causar problemas si quieres reutilizar números
    -- UNIQUE KEY idx_plantilla_numero (plantilla_id, numero),
    
    -- Índices para búsquedas rápidas
    INDEX idx_lote (lote_id),
    INDEX idx_plantilla (plantilla_id),
    INDEX idx_numero (numero),
    INDEX idx_fecha (usado_en)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: configuracion
-- Descripción: Configuraciones globales del sistema
-- ============================================================
CREATE TABLE configuracion (
    -- Clave de configuración
    clave VARCHAR(100) PRIMARY KEY,
    
    -- Valor de la configuración
    valor TEXT,
    
    -- Descripción de qué hace esta configuración
    descripcion VARCHAR(255),
    
    -- Fecha de última actualización
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- DATOS INICIALES: Usuario administrador por defecto
-- ============================================================
-- Contraseña: admin123 (cámbiala después de instalar)
-- Hash generado con bcrypt (10 rondas)
INSERT INTO usuarios (nombre, email, password_hash, creditos, es_admin, activo) 
VALUES (
    'Administrador',
    'admin@bingo.com',
    '$2b$10$rZ9V.UwB5lYL4pqn8Ix2/ux1YxqOr5bO6x9LxVX9nN8H3kqYGzC9W',
    9999,
    1,
    1
);

-- ============================================================
-- DATOS INICIALES: Configuración del sistema
-- ============================================================
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('costo_pdf_prueba', '0', 'Créditos que cuesta un PDF de prueba'),
('costo_pdf_final', '5', 'Créditos que cuesta un PDF final'),
('creditos_inicial', '0', 'Créditos que recibe un usuario nuevo al registrarse'),
('max_tablas_por_lote', '10000', 'Cantidad máxima de tablas que se pueden generar por lote'),
('permitir_repeticion_numeros', '0', 'Si es 1, permite repetir números entre lotes; si es 0, no permite');

-- ============================================================
-- VISTAS ÚTILES PARA CONSULTAS
-- ============================================================

-- Vista: Resumen de créditos por usuario
CREATE VIEW vista_creditos_usuarios AS
SELECT 
    u.id,
    u.nombre,
    u.email,
    u.creditos,
    COALESCE(SUM(CASE WHEN t.tipo IN ('recarga', 'regalo', 'ajuste') AND t.cantidad > 0 THEN t.cantidad ELSE 0 END), 0) AS total_recibido,
    COALESCE(SUM(CASE WHEN t.tipo = 'uso' THEN ABS(t.cantidad) ELSE 0 END), 0) AS total_gastado
FROM usuarios u
LEFT JOIN transacciones_creditos t ON u.id = t.usuario_id
GROUP BY u.id, u.nombre, u.email, u.creditos;

-- Vista: Estadísticas de lotes por usuario
CREATE VIEW vista_estadisticas_lotes AS
SELECT 
    u.id AS usuario_id,
    u.nombre AS usuario_nombre,
    COUNT(l.id) AS total_lotes,
    SUM(l.cantidad_tablas) AS total_tablas_generadas,
    SUM(CASE WHEN l.tipo_pdf = 'prueba' THEN 1 ELSE 0 END) AS lotes_prueba,
    SUM(CASE WHEN l.tipo_pdf = 'final' THEN 1 ELSE 0 END) AS lotes_finales,
    SUM(l.costo_creditos) AS total_creditos_gastados
FROM usuarios u
LEFT JOIN lotes l ON u.id = l.usuario_id
GROUP BY u.id, u.nombre;

-- ============================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ============================================================

-- Procedimiento: Agregar créditos a un usuario (con registro en transacciones)
DELIMITER //
CREATE PROCEDURE agregar_creditos(
    IN p_usuario_id INT,
    IN p_cantidad INT,
    IN p_descripcion VARCHAR(255),
    IN p_admin_id INT
)
BEGIN
    -- Actualizar créditos del usuario
    UPDATE usuarios 
    SET creditos = creditos + p_cantidad 
    WHERE id = p_usuario_id;
    
    -- Registrar transacción
    INSERT INTO transacciones_creditos (usuario_id, tipo, cantidad, descripcion, admin_id)
    VALUES (p_usuario_id, 'regalo', p_cantidad, p_descripcion, p_admin_id);
END //
DELIMITER ;

-- Procedimiento: Usar créditos (al generar PDF final)
DELIMITER //
CREATE PROCEDURE usar_creditos(
    IN p_usuario_id INT,
    IN p_cantidad INT,
    IN p_descripcion VARCHAR(255),
    OUT p_exito TINYINT
)
BEGIN
    DECLARE creditos_actuales INT;
    
    -- Obtener créditos actuales del usuario
    SELECT creditos INTO creditos_actuales 
    FROM usuarios 
    WHERE id = p_usuario_id;
    
    -- Verificar si tiene suficientes créditos
    IF creditos_actuales >= p_cantidad THEN
        -- Descontar créditos
        UPDATE usuarios 
        SET creditos = creditos - p_cantidad 
        WHERE id = p_usuario_id;
        
        -- Registrar transacción
        INSERT INTO transacciones_creditos (usuario_id, tipo, cantidad, descripcion)
        VALUES (p_usuario_id, 'uso', -p_cantidad, p_descripcion);
        
        SET p_exito = 1;
    ELSE
        SET p_exito = 0;
    END IF;
END //
DELIMITER ;

-- ============================================================
-- FIN DEL SCRIPT DE BASE DE DATOS
-- ============================================================