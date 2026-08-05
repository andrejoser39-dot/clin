// 1. Importar dependencias
const express = require('express');
const cors = require('cors');

// 2. Inicializar Express
const app = express();

// 3. Middlewares (configuraciones generales)
app.use(cors());
app.use(express.json());

// 4. Registrar Rutas de la aplicación
// Ruta que ya tenías para pacientes:

app.use('/api/pacientes', require('./src/routes/pacientes.routes'));
app.use('/api/encuestas', require('./src/routes/encuestas'));
// 5. Iniciar Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de HCE corriendo en el puerto ${PORT}`);
});