// ============================================================
// HISTORIAL DE TABLAS GENERADAS
// Archivo: frontend/js/historial.js
// Descripción: Muestra el historial de lotes generados y permite
//              descargar los PDFs
// ============================================================

// ------------------------------------------------------------
// Inicializar historial cuando se carga la página
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (!utils.estaAutenticado()) {
        window.location.href = 'login.html';
        return;
    }

    // Cargar créditos del usuario
    await cargarCreditosUsuario();

    // Cargar historial de lotes
    await cargarHistorial();
});

// ------------------------------------------------------------
// Método para cargar créditos del usuario
// Muestra los créditos disponibles en la barra de navegación
// ------------------------------------------------------------
async function cargarCreditosUsuario() {
    try {
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
            const usuario = JSON.parse(usuarioStr);
            const creditsEl = document.getElementById('userCredits');
            if (creditsEl) {
                creditsEl.textContent = `${usuario.creditos || 0} créditos`;
            }

            // Actualizar desde el servidor
            try {
                const saldo = await utils.apiRequest('/credits/balance');
                if (saldo.creditos !== undefined && creditsEl) {
                    creditsEl.textContent = `${saldo.creditos} créditos`;
                }
            } catch (error) {
                console.warn('No se pudo actualizar saldo:', error);
            }
        }
    } catch (error) {
        console.error('Error al cargar créditos:', error);
    }
}

// ------------------------------------------------------------
// Método para cargar el historial de lotes generados
// Obtiene la lista de lotes del backend y los muestra
// ------------------------------------------------------------
async function cargarHistorial() {
    const loadingEl = document.getElementById('historialLoading');
    const contentEl = document.getElementById('historialContent');
    const emptyEl = document.getElementById('historialEmpty');

    try {
        // Mostrar loading
        if (loadingEl) loadingEl.style.display = 'block';
        if (contentEl) contentEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'none';

        // Obtener historial del backend
        const respuesta = await utils.apiRequest('/lots');

        // Ocultar loading
        if (loadingEl) loadingEl.style.display = 'none';

        if (!respuesta.lotes || respuesta.lotes.length === 0) {
            // No hay lotes, mostrar mensaje vacío
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }

        // Mostrar lotes
        if (contentEl) {
            contentEl.innerHTML = '';
            respuesta.lotes.forEach(lote => {
                const loteCard = crearTarjetaLote(lote);
                contentEl.appendChild(loteCard);
            });
            contentEl.style.display = 'block';
        }

    } catch (error) {
        console.error('Error al cargar historial:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="error-message">
                    Error al cargar el historial: ${error.message || 'Error desconocido'}
                </div>
            `;
            contentEl.style.display = 'block';
        }
    }
}

// ------------------------------------------------------------
// Método para crear una tarjeta de lote
// Genera el HTML de cada lote en el historial
// ------------------------------------------------------------
function crearTarjetaLote(lote) {
    const card = document.createElement('div');
    card.className = 'card historial-item';
    
    const fecha = new Date(lote.creado_en).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const estadoClass = lote.estado === 'completado' ? 'estado-completado' : 
                       lote.estado === 'generando' ? 'estado-generando' : 
                       'estado-error';

    card.innerHTML = `
        <div class="historial-item-header">
            <div class="historial-item-info">
                <h3>Lote #${lote.id}</h3>
                <p class="historial-item-meta">
                    ${lote.cantidad_tablas} tabla(s) | 
                    ${lote.tablas_por_pagina} por página | 
                    ${fecha}
                </p>
            </div>
            <div class="historial-item-status">
                <span class="estado-badge ${estadoClass}">${lote.estado}</span>
            </div>
        </div>
        <div class="historial-item-details">
            <div class="detail-item">
                <span class="detail-label">Plantilla:</span>
                <span class="detail-value">${lote.plantilla_nombre || 'N/A'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Tipo PDF:</span>
                <span class="detail-value">${lote.tipo_pdf === 'final' ? 'Final' : 'Prueba'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Créditos usados:</span>
                <span class="detail-value">${lote.costo_creditos || 0}</span>
            </div>
        </div>
        <div class="historial-item-actions">
            ${lote.estado === 'completado' ? `
                <button class="btn btn-primary" onclick="descargarPDF(${lote.id})">
                    📥 Descargar PDF
                </button>
            ` : `
                <button class="btn btn-secondary" disabled>
                    ${lote.estado === 'generando' ? 'Generando...' : 'Error al generar'}
                </button>
            `}
        </div>
    `;

    return card;
}

// ------------------------------------------------------------
// Método para descargar el PDF de un lote
// Descarga el archivo PDF desde el servidor
// ------------------------------------------------------------
async function descargarPDF(loteId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Debes iniciar sesión');
            window.location.href = 'login.html';
            return;
        }

        // Crear URL de descarga
        const apiBase = utils.API_BASE;
        const url = `${apiBase}/lots/${loteId}/download`;

        // Crear enlace temporal para descargar
        const link = document.createElement('a');
        link.href = url;
        link.download = `bingo_lote_${loteId}.pdf`;
        
        // Agregar token al header usando fetch
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al descargar PDF');
        }

        // Obtener blob y crear URL local
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpiar URL
        window.URL.revokeObjectURL(blobUrl);

        utils.mostrarExito('PDF descargado exitosamente');

    } catch (error) {
        console.error('Error al descargar PDF:', error);
        alert('Error al descargar PDF: ' + (error.message || 'Error desconocido'));
    }
}

// Hacer función global para usar desde HTML
window.descargarPDF = descargarPDF;

