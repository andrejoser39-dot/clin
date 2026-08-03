// backend/src/controllers/pacientes.controller.js
const pool = require('../config/db');

// Consulta de historia clínica
const getHistoriaClinica = async (req, res) => {
    try {
        const { documento } = req.params;

        // 1. Consultar paciente (Asegúrate si tu tabla es 'pacientes' o 'paciente')
        const [pacientes] = await pool.query(
            'SELECT * FROM pacientes WHERE numero_documento = ?',
            [documento]
        );

        // Si no se encuentra ninguna coincidencia en el array
        if (pacientes.length === 0) {
            return res.status(404).json({ mensaje: 'Paciente no encontrado' });
        }

        const pacienteEncontrado = pacientes[0];

        // 2. Consultar atenciones médicas asociadas
        const [atenciones] = await pool.query(
            `SELECT a.id_atencion, a.fecha_atencion, a.motivo_consulta, a.enfermedad_actual,
                    i.nombre AS institucion, p.nombres AS medico_nombre, p.apellidos AS medico_apellido
             FROM atencion_medica a
             JOIN institucion_salud i ON a.id_institucion = i.id_institucion
             JOIN profesional_salud p ON a.id_profesional = p.id_profesional
             WHERE a.id_paciente = ?
             ORDER BY a.fecha_atencion DESC`,
            [pacienteEncontrado.id_paciente]
        );

        // 3. Responder al frontend con la estructura esperada por app.js
        res.json({ 
            paciente: pacienteEncontrado, 
            atenciones 
        });

    } catch (error) {
        console.error('Error en getHistoriaClinica:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};
// Si aún no has implementado la creación, deja este controlador base:
const createPaciente = async (req, res) => {
    try {
        // Lógica de creación a futuro
        res.status(201).json({ mensaje: 'Paciente creado correctamente' });
    } catch (error) {
        console.error('Error en createPaciente:', error);
        res.status(500).json({ mensaje: 'Error al crear paciente' });
    }
};

// EXPORTA AMBAS FUNCIONES AQUÍ
module.exports = {
    getHistoriaClinica,
    createPaciente
};