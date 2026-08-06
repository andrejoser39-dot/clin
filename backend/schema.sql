-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS historia_clinica_nacional;
USE historia_clinica_nacional;

-- Tabla de Pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    documento VARCHAR(20) NOT NULL UNIQUE,
    numero_documento VARCHAR(20) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    id_grupo_sanguineo VARCHAR(5),
    fecha_nacimiento DATE,
    telefono VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Encuestas
CREATE TABLE IF NOT EXISTS encuestas (
    id_encuesta INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Preguntas de Encuestas
CREATE TABLE IF NOT EXISTS preguntas_encuestas (
    id_pregunta INT AUTO_INCREMENT PRIMARY KEY,
    id_encuesta INT NOT NULL,
    texto_pregunta TEXT NOT NULL,
    tipo_respuesta VARCHAR(50),
    orden INT DEFAULT 0,
    FOREIGN KEY (id_encuesta) REFERENCES encuestas(id_encuesta) ON DELETE CASCADE
);

-- Tabla de Atenciones / Consultas
CREATE TABLE IF NOT EXISTS atenciones (
    id_atencion INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    fecha_atencion DATETIME DEFAULT CURRENT_TIMESTAMP,
    motivo_consulta TEXT,
    sintomas TEXT,
    examen_fisico TEXT,
    plan_tratamiento TEXT,
    observaciones TEXT,
    FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente) ON DELETE CASCADE
);