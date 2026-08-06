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

-- ============================================================
-- INSERCIÓN DE DATOS INICIALES (SEED)
-- ============================================================

INSERT INTO pacientes (id_paciente, documento, numero_documento, nombres, apellidos, id_grupo_sanguineo, fecha_nacimiento, telefono) VALUES
(1, '1098765432', '1098765432', 'Carlos Alberto', 'Mendoza Ríos', 'O+', '1995-03-14', '3158901234'),
(2, '1012345678', '1012345678', 'María Fernanda', 'Gómez Silva', 'A+', '1998-11-22', '3104567890'),
(3, '91234567', '91234567', 'Jorge Luis', 'Pérez Castellanos', 'B-', '1988-07-05', '3001234567'),
(4, '1095821045', '1095821045', 'Laura Valentina', 'Suárez Duarte', 'AB+', '2001-01-30', '3187654321');

INSERT INTO encuestas (id_encuesta, titulo, activo) VALUES
(1, 'Encuesta de Satisfacción e Historial de Calidad de Atención', TRUE);

INSERT INTO preguntas_encuestas (id_encuesta, texto_pregunta, tipo_respuesta, orden) VALUES
(1, '¿Cómo califica la atención recibida en el servicio de urgencias?', 'Escala (1-5)', 1),
(1, '¿El tiempo de espera para su consulta fue razonable?', 'Sí/No', 2),
(1, '¿El médico tratante explicó de manera clara su diagnóstico y formulación?', 'Sí/No', 3),
(1, 'Observaciones o sugerencias de mejora', 'Texto libre', 4);

INSERT INTO atenciones (id_atencion, id_paciente, fecha_atencion, motivo_consulta, sintomas, examen_fisico, plan_tratamiento, observaciones) VALUES
(1, 1, '2026-05-10 09:30:00', 'Cefalea intensa y mareo de 2 días de evolución', 'Dolor pulsátil en región frontal, fotosensibilidad leve', 'PA: 120/80 mmHg, FC: 72 bpm, afebril', 'Acetaminofén 500mg cada 8 horas por 3 días. Reposo.', 'Se indica regresar si el dolor persiste.'),
(2, 1, '2026-07-18 14:15:00', 'Control general y revisión de exámenes de laboratorio', 'Asintomático al momento del control', 'Buen estado general. Cardiopulmonar normal.', 'Mantener dieta balanceada y actividad física.', 'Exámenes dentro de rangos normales.'),
(3, 2, '2026-06-02 11:00:00', 'Cuadro gripal, fiebre y odinofagia', 'Fiebre de 38.2°C, dolor de garganta y congestión', 'Orofaringe eritematosa sin placas purulentas.', 'Ibuprofeno 400mg cada 8 horas por 5 días.', 'Abundantes líquidos. Reposo en casa.');