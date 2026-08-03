# 🏥 Sistema de Gestión de Historia Clínica Nacional (CLIN)

Sistema web monolítico/fullstack para la gestión y consulta de historias clínicas, atención médica y diagnósticos CIE-10. Desarrollo estructurado con **Node.js + Express** en el Backend y un cliente ligero en el Frontend conectado a **MySQL**.

---

## 🚀 Tecnologías Utilizadas

* **Backend:** Node.js, Express.js
* **Base de Datos:** MySQL (Driver: `mysql2`)
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6)
* **Control de Versiones:** Git & GitHub

---

## 📁 Estructura del Proyecto

```text
CLIN/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Configuración del pool de conexión MySQL
│   │   ├── controllers/
│   │   │   └── pacientes.controller.js # Lógica de negocio y consultas
│   │   └── routes/
│   │       └── pacientes.routes.js     # Endpoints de la API REST
│   ├── .env.example                  # Plantilla de variables de entorno
│   ├── package.json
│   └── server.js                     # Punto de entrada de la aplicación
├── front/
│   ├── visual/
│   │   └── stylo.css                 # Estilos de la interfaz web
│   ├── app.js                        # Lógica de consumo de la API REST
│   └── index.html                    # Vistas y formularios del sistema
├── .gitignore                        # Archivos excluidos de Git
└── README.md                         # Documentación del proyecto