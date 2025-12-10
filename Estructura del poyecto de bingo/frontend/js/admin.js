// ============================================================
// PANEL DE ADMINISTRACIÓN
// Archivo: frontend/js/admin.js
// Descripción: Maneja toda la lógica del panel de administración:
//              - Búsqueda de usuarios
//              - Asignación de créditos
//              - Estadísticas del sistema
// ============================================================

// ------------------------------------------------------------
// Inicializar panel admin cuando se carga la página
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (!utils.estaAutenticado()) {
        window.location.href = 'login.html';
        return;
    }

    // Verificar que el usuario es admin
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        if (!usuario.es_admin) {
            alert('No tienes permisos de administrador');
            window.location.href = 'dashboard.html';
            return;
        }
    }

    // Cargar estadísticas iniciales
    await cargarEstadisticas();

    // Configurar event listeners
    configurarEventListeners();
});

// ------------------------------------------------------------
// Configurar todos los event listeners del panel
// ------------------------------------------------------------
function configurarEventListeners() {
    // Botón de búsqueda
    const btnSearch = document.getElementById('btnSearch');
    if (btnSearch) {
        btnSearch.addEventListener('click', buscarUsuario);
    }

    // Búsqueda al presionar Enter
    const searchEmail = document.getElementById('searchEmail');
    if (searchEmail) {
        searchEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarUsuario();
            }
        });
    }

    // Botones de créditos
    const btnAddCredits = document.getElementById('btnAddCredits');
    if (btnAddCredits) {
        btnAddCredits.addEventListener('click', () => agregarCreditos(true));
    }

    const btnRemoveCredits = document.getElementById('btnRemoveCredits');
    if (btnRemoveCredits) {
        btnRemoveCredits.addEventListener('click', () => agregarCreditos(false));
    }

    // Botón de actualizar estadísticas
    const btnRefreshStats = document.getElementById('btnRefreshStats');
    if (btnRefreshStats) {
        btnRefreshStats.addEventListener('click', cargarEstadisticas);
    }

    // Selector de tablas por página personalizado
    const tablasPorPagina = document.getElementById('tablasPorPagina');
    if (tablasPorPagina) {
        tablasPorPagina.addEventListener('change', (e) => {
            const customGroup = document.getElementById('customPerPageGroup');
            if (customGroup) {
                customGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';
            }
        });
    }
}

// ------------------------------------------------------------
// Método para buscar usuario por email o nombre
// Busca en el backend y muestra los resultados
// ------------------------------------------------------------
async function buscarUsuario() {
    try {
        const searchTerm = document.getElementById('searchEmail').value.trim();
        
        if (!searchTerm || searchTerm.length < 2) {
            mostrarMensaje('adminMessage', 'Ingresa al menos 2 caracteres para buscar', 'error');
            return;
        }

        // Buscar usuario en el backend
        const resultado = await utils.apiRequest(`/admin/users/search?q=${encodeURIComponent(searchTerm)}`);
        
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (resultado.usuarios && resultado.usuarios.length > 0) {
            // Mostrar resultados
            let html = '<h3>Resultados de búsqueda:</h3><div class="users-list">';
            
            resultado.usuarios.forEach(usuario => {
                html += `
                <div class="user-item" onclick="seleccionarUsuario(${usuario.id}, '${usuario.email}', '${usuario.nombre}', ${usuario.creditos || 0})">
                    <div class="user-item-info">
                        <strong>${usuario.nombre}</strong>
                        <span class="user-email">${usuario.email}</span>
                    </div>
                    <div class="user-item-credits">
                        ${usuario.creditos || 0} créditos
                    </div>
                </div>
                `;
            });
            
            html += '</div>';
            searchResults.innerHTML = html;
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '<p class="no-results">No se encontraron usuarios</p>';
            searchResults.style.display = 'block';
        }
    } catch (error) {
        console.error('Error al buscar usuario:', error);
        mostrarMensaje('adminMessage', error.message || 'Error al buscar usuario', 'error');
    }
}

// ------------------------------------------------------------
// Método para seleccionar un usuario de los resultados
// Muestra su información y permite gestionar créditos
// ------------------------------------------------------------
function seleccionarUsuario(id, email, nombre, creditos) {
    const userInfo = document.getElementById('userInfo');
    const creditsSection = document.getElementById('creditsSection');
    
    if (!userInfo || !creditsSection) return;

    // Mostrar información del usuario
    userInfo.innerHTML = `
        <div class="user-info-header">
            <h3>${nombre}</h3>
            <p class="user-email">${email}</p>
        </div>
        <div class="user-info-credits">
            <span class="credits-label">Créditos actuales:</span>
            <span class="credits-value">${creditos}</span>
        </div>
    `;

    // Guardar ID del usuario seleccionado
    userInfo.dataset.userId = id;
    userInfo.dataset.userEmail = email;
    userInfo.dataset.userNombre = nombre;
    userInfo.dataset.userCreditos = creditos;

    // Mostrar sección de créditos
    creditsSection.style.display = 'block';
    
    // Scroll suave a la sección
    creditsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ------------------------------------------------------------
// Método para agregar o quitar créditos a un usuario
// Parámetro agregar: true para agregar, false para quitar
// ------------------------------------------------------------
async function agregarCreditos(agregar) {
    try {
        const userInfo = document.getElementById('userInfo');
        if (!userInfo || !userInfo.dataset.userId) {
            mostrarMensaje('adminMessage', 'Selecciona un usuario primero', 'error');
            return;
        }

        const userId = userInfo.dataset.userId;
        const cantidad = parseInt(document.getElementById('creditsAmount').value);
        const descripcion = document.getElementById('creditsDescription').value || 
            (agregar ? 'Créditos agregados por administrador' : 'Créditos removidos por administrador');

        if (!cantidad || cantidad <= 0) {
            mostrarMensaje('adminMessage', 'La cantidad debe ser un número positivo', 'error');
            return;
        }

        // Verificar si es quitar y tiene suficientes créditos
        if (!agregar) {
            const creditosActuales = parseInt(userInfo.dataset.userCreditos);
            if (creditosActuales < cantidad) {
                mostrarMensaje('adminMessage', `El usuario solo tiene ${creditosActuales} créditos`, 'error');
                return;
            }
        }

        // Hacer petición al backend
        const endpoint = agregar 
            ? `/admin/users/${userId}/credits`
            : `/admin/users/${userId}/credits/remove`;
        
        const body = {
            cantidad: agregar ? cantidad : cantidad,
            descripcion: descripcion
        };

        const resultado = await utils.apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });

        // Mostrar mensaje de éxito
        mostrarMensaje('adminSuccess', 
            `Créditos ${agregar ? 'agregados' : 'removidos'} exitosamente. ` +
            `Nuevo saldo: ${resultado.usuario.creditos_actuales} créditos`,
            'success'
        );

        // Actualizar información del usuario
        userInfo.dataset.userCreditos = resultado.usuario.creditos_actuales;
        const creditsValue = userInfo.querySelector('.credits-value');
        if (creditsValue) {
            creditsValue.textContent = resultado.usuario.creditos_actuales;
        }

        // Limpiar campos
        document.getElementById('creditsAmount').value = '10';
        document.getElementById('creditsDescription').value = '';

        // Actualizar estadísticas
        await cargarEstadisticas();

    } catch (error) {
        console.error('Error al gestionar créditos:', error);
        mostrarMensaje('adminMessage', error.message || 'Error al gestionar créditos', 'error');
    }
}

// ------------------------------------------------------------
// Método para cargar estadísticas del sistema
// Muestra total de usuarios, lotes, tablas y créditos
// ------------------------------------------------------------
async function cargarEstadisticas() {
    try {
        const stats = await utils.apiRequest('/admin/stats');
        
        // Actualizar estadísticas en la interfaz
        const totalUsuarios = document.getElementById('totalUsuarios');
        const totalLotes = document.getElementById('totalLotes');
        const totalTablas = document.getElementById('totalTablas');
        const totalCreditos = document.getElementById('totalCreditos');

        if (totalUsuarios && stats.usuarios) {
            totalUsuarios.textContent = stats.usuarios.total_usuarios || 0;
        }

        if (totalLotes && stats.lotes) {
            totalLotes.textContent = stats.lotes.total_lotes || 0;
        }

        if (totalTablas && stats.lotes) {
            totalTablas.textContent = stats.lotes.total_tablas_generadas || 0;
        }

        if (totalCreditos && stats.usuarios) {
            totalCreditos.textContent = stats.usuarios.total_creditos_sistema || 0;
        }

    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        // No mostrar error, solo dejar en 0
    }
}

// ------------------------------------------------------------
// Método para mostrar mensajes de error o éxito
// Parámetros:
//   - elementoId: ID del elemento donde mostrar el mensaje
//   - mensaje: Texto del mensaje
//   - tipo: 'error' o 'success'
// ------------------------------------------------------------
function mostrarMensaje(elementoId, mensaje, tipo) {
    const elemento = document.getElementById(elementoId);
    if (!elemento) return;

    // Ocultar el otro tipo de mensaje
    const otroMensaje = tipo === 'error' 
        ? document.getElementById('adminSuccess')
        : document.getElementById('adminMessage');
    if (otroMensaje) otroMensaje.style.display = 'none';

    // Mostrar este mensaje
    elemento.textContent = mensaje;
    elemento.className = tipo === 'error' ? 'error-message' : 'success-message';
    elemento.style.display = 'block';

    // Ocultar después de 5 segundos
    setTimeout(() => {
        elemento.style.display = 'none';
    }, 5000);
}

// Hacer función global para usar desde HTML
window.seleccionarUsuario = seleccionarUsuario;

