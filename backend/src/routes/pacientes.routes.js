const express = require('express');
const router = express.Router();

const {
    getHistoriaClinica,
    createPaciente,
    createConsulta,
    updatePaciente,
    updateConsulta, // <--- 1. Importante: Agregar aquí la importación
    deletePaciente,
    deleteConsulta
} = require('../controllers/pacientes.controller');

// READ
router.get('/:documento/historia', getHistoriaClinica);

// CREATE
router.post('/', createPaciente);
router.post('/consultas', createConsulta);

// UPDATE
router.put('/:id_paciente', updatePaciente);
router.put('/consultas/:id_consulta', updateConsulta); // <--- 2. Nueva ruta para editar consultas

// DELETE
router.delete('/:id_paciente', deletePaciente);
router.delete('/consultas/:id_consulta', deleteConsulta);

module.exports = router;