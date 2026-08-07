const express = require('express');
const router = express.Router();

const {
    getHistoriaClinica,
    createPaciente,
    createConsulta,
    updatePaciente,
    updateConsulta,
    deletePaciente,
    deleteConsulta
} = require('../controllers/pacientes.controller');

// ==========================================
// 1. RUTAS DE CONSULTAS / ATENCIONES (Específicas primero)
// ==========================================
router.post('/consultas', createConsulta);
router.put('/consultas/:id_consulta', updateConsulta);
router.delete('/consultas/:id_consulta', deleteConsulta);

// ==========================================
// 2. RUTAS DE PACIENTES
// ==========================================
// CREATE
router.post('/', createPaciente);

// READ
router.get('/:documento/historia', getHistoriaClinica);

// UPDATE
router.put('/:id_paciente', updatePaciente);

// DELETE
router.delete('/:id_paciente', deletePaciente);

module.exports = router;