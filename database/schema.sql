-- ========================================================================
-- BASE DE DATOS PARA PERSONAL TRAINER (MySQL)
-- ========================================================================
-- Este archivo contiene las instrucciones en lenguaje SQL (Structured Query Language)
-- para crear las tablas necesarias donde se guardarán los alumnos y sus evaluaciones.
--
-- ¿CÓMO EJECUTAR ESTE ARCHIVO?
-- 1. Si usas XAMPP: abre http://localhost/phpmyadmin, haz clic en "SQL", pega
--    este contenido y presiona "Continuar".
-- 2. Si usas MySQL Workbench o la terminal: conéctate a tu servidor y corre este script.
-- 3. Si usas un servicio en la nube (Railway, Supabase, PlanetScale, Aiven):
--    ejecuta este código en su editor SQL integrado.
-- ========================================================================

-- 1. Crear la base de datos si aún no existe
CREATE DATABASE IF NOT EXISTS personal_trainer_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 2. Seleccionar la base de datos para trabajar sobre ella
USE personal_trainer_db;

-- ========================================================================
-- TABLA 1: planes
-- Guarda la información de los planes que ofrece el entrenador.
-- ========================================================================
CREATE TABLE IF NOT EXISTS planes (
  -- 'id': Identificador único del plan (1 = Base, 2 = Premium).
  -- AUTO_INCREMENT hace que MySQL aumente el número automáticamente.
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- 'nombre': Nombre comercial del plan (ej. "Plan Base", "Plan Performance")
  nombre VARCHAR(100) NOT NULL,
  
  -- 'precio_mensual': Precio en moneda local o dólares (DECIMAL permite centavos exactos)
  precio_mensual DECIMAL(10, 2) NOT NULL,
  
  -- 'descripcion': Breve resumen de lo que incluye el plan
  descripcion TEXT NOT NULL,
  
  -- 'es_destacado': 1 para el plan recomendado/estrella, 0 para el resto
  es_destacado BOOLEAN DEFAULT FALSE,
  
  -- 'creado_en': Fecha y hora exacta en la que se registró el plan
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================================
-- TABLA 2: alumnos (Prospectos / Leads)
-- Guarda la información de contacto de las personas que completan el cuestionario.
-- ========================================================================
CREATE TABLE IF NOT EXISTS alumnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- 'nombre': Nombre completo de la persona
  nombre VARCHAR(150) NOT NULL,
  
  -- 'email': Correo electrónico para enviar rutinas o seguimiento
  email VARCHAR(150) NOT NULL,
  
  -- 'telefono': Número de WhatsApp o móvil para contacto directo
  telefono VARCHAR(50) NOT NULL,
  
  -- 'estado': Estado del alumno ('interesado', 'contactado', 'activo', 'inactivo')
  estado VARCHAR(30) DEFAULT 'interesado',
  
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================================
-- TABLA 3: evaluaciones (Respuestas del Cuestionario)
-- Guarda las respuestas que dio el alumno para que el entrenador sepa
-- exactamente cómo armarle la rutina y qué plan recomendarle.
-- ========================================================================
CREATE TABLE IF NOT EXISTS evaluaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- 'alumno_id': Relaciona esta evaluación con el alumno registrado en la tabla 'alumnos'.
  -- FOREIGN KEY asegura que no existan evaluaciones huérfanas sin alumno.
  alumno_id INT NOT NULL,
  
  -- 'objetivo': Meta principal (perder_peso, hipertrofia, fuerza, salud, etc.)
  objetivo VARCHAR(100) NOT NULL,
  
  -- 'nivel_experiencia': principiante, intermedio, avanzado
  nivel_experiencia VARCHAR(50) NOT NULL,
  
  -- 'lugar_entrenamiento': gimnasio, casa_con_equipo, casa_sin_equipo
  lugar_entrenamiento VARCHAR(50) NOT NULL,
  
  -- 'dias_disponibles': Cantidad de días por semana que puede entrenar (2, 3, 4, 5, 6)
  dias_disponibles INT NOT NULL,
  
  -- 'lesiones_o_dolencias': Detalles sobre molestias físicas o 'Ninguna'
  lesiones_o_dolencias TEXT,
  
  -- 'plan_recomendado': Qué plan calculó el sistema según sus respuestas ('base' o 'premium')
  plan_recomendado VARCHAR(50) NOT NULL,
  
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Definición de la clave foránea vinculada a la tabla alumnos
  CONSTRAINT fk_evaluacion_alumno
    FOREIGN KEY (alumno_id) 
    REFERENCES alumnos(id) 
    ON DELETE CASCADE
);

-- ========================================================================
-- TABLA 4: rutinas_realizadas (Check-in Pre y Post Entrenamiento)
-- Guarda la energía inicial, ánimo, descanso y esfuerzo (RPE) del alumno.
-- ========================================================================
CREATE TABLE IF NOT EXISTS rutinas_realizadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_id INT NOT NULL,
  rutina_id VARCHAR(100),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  energia_inicial INT,        -- 1 (Agotado) a 5 (A tope)
  animo_inicial INT,          -- 1 (Muy estresado) a 5 (Excelente)
  descanso_inicial VARCHAR(50), -- Mal, Regular, Bien, Excelente
  animo_final INT,            -- 1 (Peor), 2 (Igual), 3 (Mucho mejor)
  esfuerzo_final INT,         -- 1 a 10 (Escala RPE)
  desahogo_final VARCHAR(50), -- Sí totalmente, Un poco, No sigo a mil
  alerta_fatiga BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_rutina_realizada_alumno
    FOREIGN KEY (alumno_id)
    REFERENCES alumnos(id)
    ON DELETE CASCADE
);

-- ========================================================================
-- DATOS INICIALES DE EJEMPLO
-- Insertamos los 2 planes principales para que la base de datos ya tenga datos.
-- ========================================================================
INSERT INTO planes (nombre, precio_mensual, descripcion, es_destacado) VALUES
('Plan Base', 75000, 'Entrená por tu cuenta con una planificación personalizada, objetivos claros y seguimiento profesional para acompañar tu evolución.', FALSE),
('Plan Performance', 180000, 'Un proceso integral que combina gimnasio y campo, adaptado a tus objetivos, necesidades y deporte.', TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

