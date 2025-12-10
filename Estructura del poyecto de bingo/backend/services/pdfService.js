// ============================================================
// SERVICIO DE GENERACIÓN DE PDFs
// Archivo: backend/services/pdfService.js
// Descripción: Genera PDFs de las tablas de bingo usando Puppeteer
// ============================================================

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

// ------------------------------------------------------------
// Función para generar HTML de una tabla de bingo
// Parámetros:
//   - tabla: Array 2D con los números
//   - plantilla: Configuración de la plantilla
//   - estilos: Estilos CSS personalizados
// Retorna: String HTML
// ------------------------------------------------------------
const generarHTMLTabla = (tabla, plantilla, estilos = {}) => {
    const iconos = plantilla.iconos_json ? JSON.parse(plantilla.iconos_json) : null;
    const encabezado = plantilla.encabezado_texto || '';
    
    let html = `
    <div class="tabla-bingo" style="
        border: 3px solid #333;
        border-radius: 10px;
        padding: 15px;
        background: white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        margin: 20px auto;
        max-width: 600px;
    ">
    `;
    
    // Agregar encabezado si existe
    if (encabezado) {
        html += `
        <div class="encabezado" style="
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 15px;
            letter-spacing: 8px;
        ">${encabezado}</div>
        `;
    }
    
    // Crear grid de celdas
    html += `
    <div class="grid" style="
        display: grid;
        grid-template-columns: repeat(${tabla[0].length}, 1fr);
        gap: 4px;
    ">
    `;
    
    // Generar celdas
    for (let f = 0; f < tabla.length; f++) {
        for (let c = 0; c < tabla[f].length; c++) {
            const celda = tabla[f][c];
            const icono = iconos ? iconos[f][c] : null;
            
            if (celda && celda.numero !== null) {
                // Celda activa con número
                html += `
                <div class="celda activa" style="
                    background: ${icono === 'relleno' ? '#1976d2' : 'white'};
                    border: 2px solid #333;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    font-weight: bold;
                    color: ${icono === 'relleno' ? 'white' : '#333'};
                    height: 70px;
                    position: relative;
                ">
                    ${celda.numero}
                    ${icono && icono !== 'relleno' ? `<span style="position: absolute; top: 2px; right: 4px; font-size: 12px;">${obtenerIcono(icono)}</span>` : ''}
                </div>
                `;
            } else {
                // Celda inactiva
                html += `
                <div class="celda inactiva" style="
                    background: #f5f5f5;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    height: 70px;
                "></div>
                `;
            }
        }
    }
    
    html += `</div></div>`;
    
    return html;
};

// ------------------------------------------------------------
// Función auxiliar para obtener símbolos de iconos
// ------------------------------------------------------------
const obtenerIcono = (tipo) => {
    const iconos = {
        'corazon': '♥',
        'rombo': '♦',
        'cuadrado': '■',
        'circulo': '●',
        'estrella': '★',
        'A': 'A',
        'X': 'X',
        'G': 'G'
    };
    
    return iconos[tipo] || '';
};

// ------------------------------------------------------------
// Función principal: Generar PDF completo con múltiples tablas
// Parámetros:
//   - tablas: Array de tablas generadas
//   - plantilla: Configuración de la plantilla
//   - tablasPorPagina: Cuántas tablas mostrar por página
//   - nombreArchivo: Nombre del archivo PDF a generar
// Retorna: Ruta del archivo generado
// ------------------------------------------------------------
const generarPDF = async (tablas, plantilla, tablasPorPagina = 1, nombreArchivo) => {
    let browser;
    
    try {
        // Iniciar Puppeteer
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Generar HTML completo
        let htmlCompleto = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {
                    size: A4;
                    margin: 20mm;
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                .pagina {
                    page-break-after: always;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .pagina:last-child {
                    page-break-after: auto;
                }
            </style>
        </head>
        <body>
        `;
        
        // Agrupar tablas por página
        for (let i = 0; i < tablas.length; i += tablasPorPagina) {
            htmlCompleto += '<div class="pagina">';
            
            for (let j = i; j < i + tablasPorPagina && j < tablas.length; j++) {
                htmlCompleto += generarHTMLTabla(tablas[j], plantilla);
            }
            
            htmlCompleto += '</div>';
        }
        
        htmlCompleto += '</body></html>';
        
        // Cargar HTML en la página
        await page.setContent(htmlCompleto, {
            waitUntil: 'networkidle0'
        });
        
        // Definir ruta del archivo PDF
        const pdfPath = path.join(__dirname, '../pdfs', nombreArchivo);
        
        // Generar PDF
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            }
        });
        
        await browser.close();
        
        return pdfPath;
        
    } catch (error) {
        if (browser) await browser.close();
        console.error('Error al generar PDF:', error);
        throw error;
    }
};

// ------------------------------------------------------------
// Función para eliminar PDF temporal
// ------------------------------------------------------------
const eliminarPDF = async (rutaArchivo) => {
    try {
        await fs.unlink(rutaArchivo);
    } catch (error) {
        console.error('Error al eliminar PDF:', error);
    }
};

// ------------------------------------------------------------
// Exportar funciones
// ------------------------------------------------------------
module.exports = {
    generarPDF,
    eliminarPDF,
    generarHTMLTabla
};