// Borra la declaración repetida para que quede SOLO UNA vez al inicio del archivo:
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Deja solo esta línea arriba del todo
// GET: Obtener encuesta activa con sus preguntas

router.get('/encuesta-activa', async (req, res) => {
    try {
        // 1. Consultar la última encuesta activa
        const [encuesta] = await db.query(
            'SELECT * FROM encuestas WHERE activo = TRUE ORDER BY id_encuesta DESC LIMIT 1'
        );

        if (encuesta.length === 0) {
            return res.status(404).json({ mensaje: 'No hay encuestas activas disponibles.' });
        }

        const idEncuesta = encuesta[0].id_encuesta;

        // 2. Consultar las preguntas de la encuesta
        const [preguntas] = await db.query(
            'SELECT id_pregunta, texto_pregunta, tipo_respuesta, orden FROM preguntas_encuestas WHERE id_encuesta = ? ORDER BY orden ASC',
            [idEncuesta]
        );

        res.json({
            encuesta: encuesta[0],
            preguntas: preguntas
        });
    } catch (error) {
        console.error('Error al obtener encuesta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST: Registrar respuestas de una encuesta
router.post('/responder', async (req, res) => {
    const { id_encuesta, id_paciente, id_atencion, respuestas } = req.body;

    if (!id_encuesta || !id_paciente || !respuestas || !Array.isArray(respuestas)) {
        return res.status(400).json({ mensaje: 'Datos incompletos para guardar la encuesta.' });
    }

    try {
        // Preparamos los datos en matriz para la inserción masiva
        const values = respuestas.map(resp => [
            id_encuesta,
            id_paciente,
            id_atencion || null,
            resp.id_pregunta,
            resp.valor_respuesta
        ]);

        const query = `
            INSERT INTO respuestas_encuestas 
            (id_encuesta, id_paciente, id_atencion, id_pregunta, valor_respuesta) 
            VALUES ?
        `;

        await db.query(query, [values]);

        res.status(201).json({ mensaje: 'Respuestas guardadas exitosamente.' });
    } catch (error) {
        console.error('Error al guardar respuestas:', error);
        res.status(500).json({ error: 'Error al registrar las respuestas' });
    }
});

module.exports = router;