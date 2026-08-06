const pool = require('../config/db');

// 1. Obtener la historia clínica de un paciente por número de documento
const getHistoriaClinica = async (req, res) => {
    try {
        const { documento } = req.params;

        // Consultar paciente
        const [pacientes] = await pool.query(
            'SELECT * FROM pacientes WHERE documento = ? OR numero_documento = ?', 
            [documento, documento]
        );

        if (pacientes.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        const paciente = pacientes[0];

        // Consultar atenciones médicas asociadas
        const [atenciones] = await pool.query(
            `SELECT 
                id_atencion AS id_consulta,
                fecha_atencion AS fecha_consulta,
                motivo_consulta,
                sintomas,
                examen_fisico,
                plan_tratamiento,
                observaciones
            FROM atenciones
            WHERE id_paciente = ?
            ORDER BY fecha_atencion DESC`,
            [paciente.id_paciente]
        );

        return res.json({
            paciente,
            historial: atenciones
        });

    } catch (error) {
        console.error('Error al obtener la historia clínica:', error.message);
        return res.status(500).json({ 
            error: 'Error interno del servidor al consultar la historia clínica',
            detalle: error.message 
        });
    }
};

// 2. Registrar un nuevo paciente
const createPaciente = async (req, res) => {
    const { 
        documento, numero_documento, nombres, apellidos, 
        id_grupo_sanguineo, fecha_nacimiento, telefono 
    } = req.body;

    try {
        const numDoc = numero_documento || documento;

        const [result] = await pool.query(
            `INSERT INTO pacientes 
            (documento, numero_documento, nombres, apellidos, id_grupo_sanguineo, fecha_nacimiento, telefono) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [documento, numDoc, nombres, apellidos, id_grupo_sanguineo || 'O+', fecha_nacimiento, telefono]
        );

        return res.status(201).json({
            mensaje: 'Paciente registrado exitosamente.',
            id_paciente: result.insertId
        });
    } catch (error) {
        console.error('Error al crear paciente:', error);
        return res.status(500).json({ 
            mensaje: 'Error al registrar el paciente.', 
            error: error.message 
        });
    }
};

// 3. Registrar una nueva atención / consulta médica
const createConsulta = async (req, res) => {
    const { id_paciente, motivo_consulta, sintomas, examen_fisico, plan_tratamiento, observaciones } = req.body;

    try {
        const [result] = await pool.query(
            `INSERT INTO atenciones 
            (id_paciente, motivo_consulta, sintomas, examen_fisico, plan_tratamiento, observaciones) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [id_paciente, motivo_consulta, sintomas, examen_fisico, plan_tratamiento, observaciones]
        );

        return res.status(201).json({
            mensaje: 'Atención médica registrada exitosamente.',
            id_consulta: result.insertId
        });
    } catch (error) {
        console.error('Error al crear atención:', error);
        return res.status(500).json({ 
            mensaje: 'Error al registrar la atención médica.', 
            error: error.message 
        });
    }
};

// 4. Actualizar datos de un paciente
const updatePaciente = async (req, res) => {
    const { id_paciente } = req.params;
    const { documento, numero_documento, nombres, apellidos, id_grupo_sanguineo, fecha_nacimiento, telefono } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE pacientes 
             SET documento = ?, numero_documento = ?, nombres = ?, apellidos = ?, id_grupo_sanguineo = ?, fecha_nacimiento = ?, telefono = ?
             WHERE id_paciente = ?`,
            [documento, numero_documento || documento, nombres, apellidos, id_grupo_sanguineo, fecha_nacimiento, telefono, id_paciente]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Paciente no encontrado.' });
        }

        return res.json({ mensaje: 'Paciente actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar paciente:', error);
        return res.status(500).json({ mensaje: 'Error interno al actualizar paciente.', error: error.message });
    }
};

// 5. Eliminar paciente
const deletePaciente = async (req, res) => {
    const { id_paciente } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM pacientes WHERE id_paciente = ?', [id_paciente]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Paciente no encontrado.' });
        }

        return res.json({ mensaje: 'Paciente eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar paciente:', error);
        return res.status(500).json({ mensaje: 'No se puede eliminar el paciente porque posee atenciones registradas.', error: error.message });
    }
};

// 6. Actualizar atención / consulta médica
const updateConsulta = async (req, res) => {
    const { id_consulta } = req.params;
    const { motivo_consulta, sintomas, examen_fisico, plan_tratamiento, observaciones } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE atenciones 
             SET motivo_consulta = ?, sintomas = ?, examen_fisico = ?, plan_tratamiento = ?, observaciones = ?
             WHERE id_atencion = ?`,
            [motivo_consulta, sintomas, examen_fisico, plan_tratamiento, observaciones, id_consulta]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Consulta no encontrada.' });
        }

        return res.json({ mensaje: 'Consulta actualizada correctamente.' });
    } catch (error) {
        console.error('Error al actualizar consulta:', error);
        return res.status(500).json({ mensaje: 'Error al actualizar la consulta.', error: error.message });
    }
};

// 7. Eliminar atención médica específica
const deleteConsulta = async (req, res) => {
    const { id_consulta } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM atenciones WHERE id_atencion = ?', [id_consulta]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Consulta no encontrada.' });
        }

        return res.json({ mensaje: 'Consulta eliminada del registro.' });
    } catch (error) {
        console.error('Error al eliminar consulta:', error);
        return res.status(500).json({ mensaje: 'Error al eliminar la consulta.', error: error.message });
    }
};

// Exportación de los controladores
module.exports = {
    getHistoriaClinica,
    createPaciente,
    createConsulta,
    updatePaciente,
    deletePaciente,
    updateConsulta,
    deleteConsulta
};