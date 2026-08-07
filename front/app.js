const API_URL = 'http://localhost:3000/api/pacientes';
let atencionesCache = []; // Guarda las atenciones en memoria para poder editarlas

// --- EVENT LISTENERS ---
document.getElementById('btnBuscar').addEventListener('click', buscarHistoriaClinica);

document.getElementById('inputDocumento').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') buscarHistoriaClinica();
});

document.getElementById('formConsulta').addEventListener('submit', guardarOActualizarConsulta);


// --- 1. READ: BUSCAR Y MOSTRAR HISTORIA CLÍNICA ---
async function buscarHistoriaClinica() {
    const documento = document.getElementById('inputDocumento').value.trim();

    if (!documento) {
        alert('Por favor, ingresa un número de documento.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${documento}/historia`);

        if (!response.ok) {
            if (response.status === 404) {
                alert('Paciente no encontrado');
                limpiarInterfaz();
            } else {
                alert('Error al consultar el expediente');
            }
            return;
        }

        const data = await response.json();
        const paciente = data.paciente;
        atencionesCache = data.atenciones || [];

        // 1.1. Renderizar datos personales del paciente
        document.getElementById('txtDocumento').innerText = paciente.numero_documento || '---';
        document.getElementById('txtNombre').innerText = `${paciente.nombres || ''} ${paciente.apellidos || ''}`;
        document.getElementById('txtGrupoSanguineo').innerText = paciente.id_grupo_sanguineo || '---';
        document.getElementById('txtFechaNac').innerText = paciente.fecha_nacimiento ? paciente.fecha_nacimiento.split('T')[0] : '---';
        document.getElementById('txtTelefono').innerText = paciente.telefono || '---';
        document.getElementById('txtDireccion').innerText = paciente.direccion || '---';
        if (document.getElementById('txtGenero')) {
            document.getElementById('txtGenero').innerText = paciente.id_genero || '---';
        }

        // 1.2. Asignar ID del paciente al campo oculto ANTES de limpiar el formulario
        document.getElementById('idPacienteHidden').value = paciente.id_paciente;

        // 1.3. Renderizar la lista de atenciones en la tabla
        renderizarTablaAtenciones(atencionesCache);

        // 1.4. REVELAR FORMULARIO
        const secFormulario = document.getElementById('secFormulario');
        if (secFormulario) {
            secFormulario.classList.remove('hidden');
        }
        
        limpiarFormularioConsulta();

    } catch (error) {
        console.error('Error al conectar con el backend:', error);
        alert('No se pudo conectar con el servidor backend.');
    }
}

// Renderiza las filas de la tabla con los botones de Editar y Eliminar
function renderizarTablaAtenciones(atenciones) {
    const tbody = document.getElementById('tablaAtenciones');
    tbody.innerHTML = '';

    if (!atenciones || atenciones.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">
                    El paciente no registra atenciones médicas previas.
                </td>
            </tr>
        `;
        return;
    }

    atenciones.forEach((item, index) => {
        const fecha = item.fecha_atencion ? new Date(item.fecha_atencion).toLocaleDateString('es-CO') : '---';
        
        const fila = `
            <tr>
                <td class="cell-bold">${fecha}</td>
                <td>${item.institucion || '---'}</td>
                <td>${item.medico_nombre || ''} ${item.medico_apellido || ''}</td>
                <td>${item.motivo_consulta || '---'}</td>
                <td>${item.enfermedad_actual || '---'}</td>
                <td class="cell-actions">
                    <button class="btn btn-warning" onclick="window.cargarParaEditar(${index})">Editar</button>
                    <button class="btn btn-danger" onclick="window.eliminarConsulta(${item.id_consulta})">Eliminar</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}


// --- 2. CREATE / UPDATE: GUARDAR O ACTUALIZAR CONSULTA ---
async function guardarOActualizarConsulta(e) {
    e.preventDefault();

    const idPaciente = document.getElementById('idPacienteHidden').value;
    if (!idPaciente) {
        alert('Atención: No se ha detectado el ID del paciente. Realice la búsqueda nuevamente.');
        return;
    }

    const idConsulta = document.getElementById('idConsultaEdit').value;
    const payload = {
        id_paciente: idPaciente,
        institucion: document.getElementById('inputInstitucion').value,
        motivo_consulta: document.getElementById('inputMotivo').value,
        enfermedad_actual: document.getElementById('inputEnfermedad').value
    };

    const esEdicion = !!idConsulta;
    // URL según endpoint en backend
    const url = esEdicion ? `${API_URL}/consultas/${idConsulta}` : `${API_URL}/consultas`;
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert(esEdicion ? 'Consulta actualizada con éxito.' : 'Consulta registrada con éxito.');
            limpiarFormularioConsulta();
            await buscarHistoriaClinica(); // Recarga la tabla de inmediato
        } else {
            const errorData = await response.json();
            alert(`Error al guardar: ${errorData.mensaje || 'Respuesta no válida del servidor'}`);
        }
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('Error de conexión al intentar guardar.');
    }
}

// Carga los datos de una fila en el formulario para editar
function cargarParaEditar(index) {
    const item = atencionesCache[index];
    if (!item) return;
    
    document.getElementById('idConsultaEdit').value = item.id_consulta;
    document.getElementById('inputInstitucion').value = item.institucion || '';
    document.getElementById('inputMotivo').value = item.motivo_consulta || '';
    document.getElementById('inputEnfermedad').value = item.enfermedad_actual || '';

    document.getElementById('formTitulo').innerText = 'Modificar Consulta Médica';
    document.getElementById('btnGuardar').innerText = 'Actualizar Consulta';

    document.getElementById('secFormulario').scrollIntoView({ behavior: 'smooth' });
}


// --- 3. DELETE: ELIMINAR CONSULTA ---
async function eliminarConsulta(idConsulta) {
    if (!confirm('¿Está seguro de que desea eliminar esta consulta del historial?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/consultas/${idConsulta}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Registro eliminado correctamente.');
            await buscarHistoriaClinica(); // Recarga la lista actualizada
        } else {
            alert('No se pudo eliminar el registro.');
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error de conexión al eliminar.');
    }
}


// --- FUNCIONES AUXILIARES ---
function limpiarFormularioConsulta() {
    document.getElementById('idConsultaEdit').value = '';
    document.getElementById('inputInstitucion').value = '';
    document.getElementById('inputMotivo').value = '';
    document.getElementById('inputEnfermedad').value = '';
    
    document.getElementById('formTitulo').innerText = 'Registrar Nueva Consulta Médica';
    document.getElementById('btnGuardar').innerText = 'Guardar Atención';
}

function limpiarInterfaz() {
    document.getElementById('txtDocumento').innerText = '---';
    document.getElementById('txtNombre').innerText = '---';
    document.getElementById('txtGrupoSanguineo').innerText = '---';
    document.getElementById('txtFechaNac').innerText = '---';
    document.getElementById('txtTelefono').innerText = '---';
    document.getElementById('txtDireccion').innerText = '---';
    if (document.getElementById('txtGenero')) {
        document.getElementById('txtGenero').innerText = '---';
    }
    
    const secFormulario = document.getElementById('secFormulario');
    if (secFormulario) {
        secFormulario.classList.add('hidden');
    }

    document.getElementById('tablaAtenciones').innerHTML = `
        <tr>
            <td colspan="6" class="empty-row">
                Ingrese un número de documento para cargar el historial clínico.
            </td>
        </tr>
    `;
}

// Hacer globales las funciones que llaman los botones dinámicos en HTML
window.cargarParaEditar = cargarParaEditar;
window.eliminarConsulta = eliminarConsulta;
window.limpiarFormularioConsulta = limpiarFormularioConsulta;