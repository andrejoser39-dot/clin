const pool = require('../config/db');

// 1. Obtener la historia clínica completa de un paciente
const getHistoriaClinica = async (req, res) => {
    try {
        const { documento } = req.params;

        // 1. Obtener la información básica del paciente
        const [pacientes] = await pool.query(
            'SELECT * FROM pacientes WHERE documento = ?', 
            [documento]
        );

        if (pacientes.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        const paciente = pacientes[0];

        // 2. Obtener todas las atenciones / consultas médicas del paciente
        const [atenciones] = await pool.query(
            `SELECT 
                a.id_atencion AS id_consulta,
                a.fecha_atencion AS fecha_consulta,
                a.motivo_consulta,
                a.sintomas,
                a.examen_fisico,
                a.plan_tratamiento,
                a.observaciones,
                e.nombre AS especialidad,
                CONCAT(m.nombres, ' ', m.apellidos) AS medico_nombre
            FROM atenciones a
            INNER JOIN medicos m ON a.id_medico = m.id_medico
            INNER JOIN especialidades e ON m.id_especialidad = e.id_especialidad
            WHERE a.id_paciente = ?
            ORDER BY a.fecha_atencion DESC`,
            [paciente.id_paciente]
        );

        // Si no hay atenciones, devolvemos los datos del paciente con historial vacío
        if (atenciones.length === 0) {
            return res.json({
                paciente,
                historial: []
            });
        }

        // Extraer los IDs de todas las atenciones obtenidas
        const idsAtenciones = atenciones.map(a => a.id_consulta);

        // 3. Obtener los diagnósticos (CIE-10) vinculados a estas atenciones
        const [diagnosticos] = await pool.query(
            `SELECT 
                id_atencion,
                codigo_cie10,
                descripcion,
                tipo
            FROM diagnosticos
            WHERE id_atencion IN (?)`,
            [idsAtenciones]
        );

        // 4. Obtener las recetas y sus detalles de medicamentos
        const [recetas] = await pool.query(
            `SELECT 
                r.id_receta,
                r.id_atencion,
                r.observaciones AS receta_observaciones,
                rd.dosis,
                rd.frecuencia,
                rd.duracion_dias,
                rd.cantidad_total,
                m.nombre_generico AS medicamento,
                m.presentacion,
                m.concentracion
            FROM recetas r
            INNER JOIN recetas_detalles rd ON r.id_receta = rd.id_receta
            INNER JOIN medicamentos m ON rd.id_medicamento = m.id_medicamento
            WHERE r.id_atencion IN (?)`,
            [idsAtenciones]
        );

        // 5. Agrupar los diagnósticos y las recetas dentro de cada atención
        const historialCompleto = atenciones.map(atencion => {
            const diagAtencion = diagnosticos.filter(
                d => d.id_atencion === atencion.id_consulta
            );

            const recetasAtencion = recetas.filter(
                r => r.id_atencion === atencion.id_consulta
            );

            return {
                ...atencion,
                diagnosticos: diagAtencion,
                recetas: recetasAtencion
            };
        });

        // 6. Enviar respuesta estructurada al frontend
        res.json({
            paciente,
            historial: historialCompleto
        });

    } catch (error) {
        console.error('Error al obtener la historia clínica completa:', error.message);
        res.status(500).json({ 
            error: 'Error interno del servidor al consultar la historia clínica',
            detalle: error.message 
        });
    }
};

// 2. Registrar un nuevo paciente
const createPaciente = async (req, res) => {
    const { 
        tipo_documento, documento, nombres, apellidos, 
        fecha_nacimiento, genero, tipo_sangre, eps, telefono, correo, direccion 
    } = req.body;

    try {
        const [result] = await pool.query(
            `INSERT INTO pacientes 
            (tipo_documento, documento, nombres, apellidos, fecha_nacimiento, genero, tipo_sangre, eps, telefono, correo, direccion) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tipo_documento || 'CC', documento, nombres, apellidos, fecha_nacimiento, genero, tipo_sangre, eps, telefono, correo, direccion]
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

// 3. Registrar una nueva consulta médica
const createConsulta = async (req, res) => {
    const { id_paciente, id_medico, motivo_consulta, sintomas, examen_fisico, plan_tratamiento } = req.body;

    try {
        const [result] = await pool.query(
            `INSERT INTO consultas 
            (id_paciente, id_medico, motivo_consulta, sintomas, examen_fisico, plan_tratamiento) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [id_paciente, id_medico, motivo_consulta, sintomas, examen_fisico, plan_tratamiento]
        );

        return res.status(201).json({
            mensaje: 'Consulta registrada exitosamente.',
            id_consulta: result.insertId
        });
    } catch (error) {
        console.error('Error al crear consulta:', error);
        return res.status(500).json({ 
            mensaje: 'Error al registrar la consulta.', 
            error: error.message 
        });
    }
};

// 4. Actualizar datos de un paciente
const updatePaciente = async (req, res) => {
    const { id_paciente } = req.params;
    const { tipo_documento, documento, nombres, apellidos, fecha_nacimiento, genero, tipo_sangre, eps, telefono, correo, direccion } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE pacientes 
             SET tipo_documento = ?, documento = ?, nombres = ?, apellidos = ?, fecha_nacimiento = ?, genero = ?, tipo_sangre = ?, eps = ?, telefono = ?, correo = ?, direccion = ?
             WHERE id_paciente = ?`,
            [tipo_documento, documento, nombres, apellidos, fecha_nacimiento, genero, tipo_sangre, eps, telefono, correo, direccion, id_paciente]
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
        return res.status(500).json({ mensaje: 'No se puede eliminar el paciente porque posee historial médico registrado.', error: error.message });
    }
};

// 6. Actualizar consulta médica
const updateConsulta = async (req, res) => {
    const { id_consulta } = req.params;
    const { id_paciente, id_medico, motivo_consulta, sintomas, examen_fisico, plan_tratamiento } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE consultas 
             SET id_paciente = ?, id_medico = ?, motivo_consulta = ?, sintomas = ?, examen_fisico = ?, plan_tratamiento = ?
             WHERE id_consulta = ?`,
            [id_paciente, id_medico, motivo_consulta, sintomas, examen_fisico, plan_tratamiento, id_consulta]
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

// 7. Eliminar consulta médica específica
const deleteConsulta = async (req, res) => {
    const { id_consulta } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM consultas WHERE id_consulta = ?', [id_consulta]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Consulta no encontrada.' });
        }

        return res.json({ mensaje: 'Consulta eliminada del registro.' });
    } catch (error) {
        console.error('Error al eliminar consulta:', error);
        return res.status(500).json({ mensaje: 'Error al eliminar la consulta.', error: error.message });
    }
};

// Exportación única de todos los controladores
module.exports = {
    getHistoriaClinica,
    createPaciente,
    createConsulta,
    updatePaciente,
    deletePaciente,
    updateConsulta,
    deleteConsulta
};