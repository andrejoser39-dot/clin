// backend/server.js
const express = require('express');
const cors = require('cors');
const pacientesRoutes = require('./src/routes/pacientes.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Montar Rutas
app.use('/api/pacientes', pacientesRoutes);

// Iniciar Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});