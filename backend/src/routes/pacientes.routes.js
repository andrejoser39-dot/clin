// backend/src/routes/pacientes.routes.js
const express = require('express');
const router = express.Router();
const { getHistoriaClinica, createPaciente } = require('../controllers/pacientes.controller');

// GET /api/pacientes/:documento/historia
router.get('/:documento/historia', getHistoriaClinica);

// POST /api/pacientes
router.post('/', createPaciente);

module.exports = router;