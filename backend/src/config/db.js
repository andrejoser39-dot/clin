const mysql = require('mysql2/promise');
const path = require('path');

// Cargar las variables desde el .env ubicado en la raíz del backend
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;