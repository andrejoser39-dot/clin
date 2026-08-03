document.getElementById('btnBuscar').addEventListener('click', buscarHistoriaClinica);

async function buscarHistoriaClinica() {
    const documento = document.getElementById('inputDocumento').value.trim();

    if (!documento) {
        alert('Por favor, ingresa un número de documento.');
        return;
    }

    try {
        // Petición a la ruta modularizada del backend
        const response = await fetch(`http://localhost:3000/api/pacientes/${documento}/historia`);

        if (!response.ok) {
            if (response.status === 404) {
                alert('Paciente no encontrado');
            } else {
                alert('Error al consultar el expediente');
            }
            return;
        }

        const data = await response.json();
        const paciente = data.paciente;

        // Renderizar los datos en el aplicativo
        document.getElementById('txtDocumento').innerText = paciente.numero_documento || '---';
        document.getElementById('txtNombre').innerText = `${paciente.nombres} ${paciente.apellidos}`;
        document.getElementById('txtGrupoSanguineo').innerText = paciente.id_grupo_sanguineo || '---';
        document.getElementById('txtFechaNac').innerText = paciente.fecha_nacimiento ? paciente.fecha_nacimiento.split('T')[0] : '---';
        document.getElementById('txtTelefono').innerText = paciente.telefono || '---';
        document.getElementById('txtDireccion').innerText = paciente.direccion || '---';

        // Aquí también puedes renderizar la lista data.atenciones en la tabla de historial

    } catch (error) {
        console.error('Error al conectar con el backend:', error);
        alert('No se pudo conectar con el servidor backend.');
    }
}