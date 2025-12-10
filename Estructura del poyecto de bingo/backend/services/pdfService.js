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
    // Parsear iconos si existen
    let iconos = null;
    try {
        iconos = plantilla.iconos_json 
            ? (typeof plantilla.iconos_json === 'string' 
                ? JSON.parse(plantilla.iconos_json) 
                : plantilla.iconos_json)
            : null;
    } catch (error) {
        console.warn('Error al parsear iconos_json:', error);
        iconos = null;
    }
    
    const encabezadoTexto = plantilla.encabezado_texto || '';
    const encabezadoImg = plantilla.encabezado_img || '';
    
    // Calcular tamaño de celda según cantidad de columnas
    const numColumnas = tabla[0] ? tabla[0].length : 5;
    const tamañoCelda = Math.max(40, Math.min(80, 500 / numColumnas));
    
    let html = `
    <div class="tabla-bingo" style="
        border: 3px solid #333;
        border-radius: 10px;
        padding: 15px;
        background: white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        margin: 10px auto;
        max-width: 600px;
    ">
    `;
    
    // Agregar encabezado (imagen o texto)
    if (encabezadoImg) {
        // Usar imagen de encabezado
        const rutaImagen = `/uploads/encabezados/${encabezadoImg}`;
        html += `
        <div class="encabezado-img" style="
            text-align: center;
            margin-bottom: 15px;
        ">
            <img src="${rutaImagen}" style="
                max-width: 100%;
                max-height: 80px;
                object-fit: contain;
            " alt="Encabezado">
        </div>
        `;
    } else if (encabezadoTexto) {
        // Usar texto de encabezado
        html += `
        <div class="encabezado" style="
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 15px;
            letter-spacing: 8px;
        ">${encabezadoTexto}</div>
        `;
    }
    
    // Crear grid de celdas
    html += `
    <div class="grid" style="
        display: grid;
        grid-template-columns: repeat(${numColumnas}, 1fr);
        gap: 4px;
    ">
    `;
    
    // Generar celdas
    for (let f = 0; f < tabla.length; f++) {
        for (let c = 0; c < tabla[f].length; c++) {
            const celda = tabla[f][c];
            const icono = iconos && iconos[f] && iconos[f][c] ? iconos[f][c] : null;
            
            if (celda && celda.numero !== null && celda.numero !== undefined) {
                // Celda activa con número
                const esRelleno = icono === 'relleno' || icono === 'cuadrado_relleno';
                const colorFondo = esRelleno ? '#1976d2' : 'white';
                const colorTexto = esRelleno ? 'white' : '#333';
                const tamañoFuente = Math.max(16, Math.min(28, tamañoCelda * 0.4));
                
                html += `
                <div class="celda activa" style="
                    background: ${colorFondo};
                    border: 2px solid #333;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: ${tamañoFuente}px;
                    font-weight: bold;
                    color: ${colorTexto};
                    min-height: ${tamañoCelda}px;
                    position: relative;
                ">
                    <span style="position: relative; z-index: 2;">${celda.numero}</span>
                    ${icono && !esRelleno ? `<span style="position: absolute; top: 2px; right: 4px; font-size: ${tamañoFuente * 0.4}px; z-index: 1; opacity: 0.7;">${obtenerIcono(icono)}</span>` : ''}
                </div>
                `;
            } else {
                // Celda inactiva
                html += `
                <div class="celda inactiva" style="
                    background: #f5f5f5;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    min-height: ${tamañoCelda}px;
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
// Soporta múltiples tipos de iconos y personalización
// ------------------------------------------------------------
const obtenerIcono = (tipo) => {
    // Si el tipo es un carácter único, devolverlo directamente
    if (tipo && tipo.length === 1 && /[A-Za-z0-9]/.test(tipo)) {
        return tipo;
    }
    
    // Mapeo de tipos de iconos comunes
    const iconos = {
        'corazon': '♥',
        'corazón': '♥',
        'heart': '♥',
        'rombo': '♦',
        'diamond': '♦',
        'cuadrado': '■',
        'square': '■',
        'circulo': '●',
        'círculo': '●',
        'circle': '●',
        'estrella': '★',
        'star': '★',
        'relleno': '',
        'cuadrado_relleno': '',
        'A': 'A',
        'B': 'B',
        'C': 'C',
        'D': 'D',
        'E': 'E',
        'F': 'F',
        'G': 'G',
        'H': 'H',
        'I': 'I',
        'J': 'J',
        'K': 'K',
        'L': 'L',
        'M': 'M',
        'N': 'N',
        'O': 'O',
        'P': 'P',
        'Q': 'Q',
        'R': 'R',
        'S': 'S',
        'T': 'T',
        'U': 'U',
        'V': 'V',
        'W': 'W',
        'X': 'X',
        'Y': 'Y',
        'Z': 'Z'
    };
    
    return iconos[tipo?.toLowerCase()] || (tipo || '');
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
        
        // Calcular tamaño de tabla según cantidad por página
        const tamañoPorTabla = tablasPorPagina === 1 ? '100%' : 
                              tablasPorPagina === 2 ? '48%' :
                              tablasPorPagina === 4 ? '48%' :
                              tablasPorPagina === 6 ? '31%' : '23%';
        
        // Generar HTML completo
        let htmlCompleto = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {
                    size: A4;
                    margin: 15mm;
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                .pagina {
                    page-break-after: always;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: space-around;
                    align-items: flex-start;
                }
                .pagina:last-child {
                    page-break-after: auto;
                }
                .tabla-bingo {
                    width: ${tamañoPorTabla};
                    box-sizing: border-box;
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
        
        // Configurar ruta base para recursos estáticos (imágenes)
        const rutaBase = path.join(__dirname, '..');
        
        // Si hay imagen de encabezado, convertir ruta relativa a absoluta
        if (plantilla.encabezado_img) {
            const rutaImagen = path.join(rutaBase, 'uploads', 'encabezados', plantilla.encabezado_img);
            // Reemplazar ruta relativa por absoluta en el HTML
            htmlCompleto = htmlCompleto.replace(
                `/uploads/encabezados/${plantilla.encabezado_img}`,
                `file://${rutaImagen.replace(/\\/g, '/')}`
            );
        }
        
        // Cargar HTML en la página
        await page.setContent(htmlCompleto, {
            waitUntil: 'networkidle0'
        });
        
        // Esperar un momento para que las imágenes se carguen
        await page.waitForTimeout(1000);
        
        // Definir ruta del archivo PDF
        const pdfPath = path.join(__dirname, '../pdfs', nombreArchivo);
        
        // Asegurar que la carpeta existe
        const fs = require('fs').promises;
        await fs.mkdir(path.dirname(pdfPath), { recursive: true });
        
        // Generar PDF con mejor calidad
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '15mm',
                right: '15mm',
                bottom: '15mm',
                left: '15mm'
            },
            preferCSSPageSize: true
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