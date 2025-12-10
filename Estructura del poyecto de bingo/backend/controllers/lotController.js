const pool = require('../config/database');
const { generateUniqueNumbers } = require('../services/numberGenerator');
const pdfService = require('../services/pdfService');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

async function createLot(req, res) {
  /*
    req.body should include:
    - plantilla_id
    - juego_id (int)
    - cantidad_tablas
    - filas, columnas
    - tablasPorPagina
    - poolMin, poolMax (numbers range)
    - gridActiveOrder: array of indexes of active cells (order to fill)
  */
  try {
    const userId = req.user.id;
    const {
      plantilla_id, juego_id,
      cantidad_tablas, filas, columnas, tablasPorPagina,
      poolMin=1, poolMax=90, gridActiveOrder
    } = req.body;

    const totalActivePerTable = gridActiveOrder.length;
    const totalNeeded = totalActivePerTable * cantidad_tablas;

    const numbers = await generateUniqueNumbers(juego_id, poolMin, poolMax, totalNeeded);

    // insert lote
    const [loteRes] = await pool.query(
      'INSERT INTO lotes (plantilla_id, generado_por, cantidad_tablas, tablas_por_pagina, created_at) VALUES (?,?,?,?,NOW())',
      [plantilla_id||null, userId, cantidad_tablas, tablasPorPagina||1]
    );
    const loteId = loteRes.insertId;

    // asignar números por tabla y guardar en numeros_usados
    let k=0;
    for(let t=0;t<cantidad_tablas;t++){
      for(let a=0;a<gridActiveOrder.length;a++){
        const idx = gridActiveOrder[a]; // position index (0..rows*cols-1)
        const numero = numbers[k++];
        const fila = Math.floor(idx/columnas);
        const columna = idx % columnas;
        await pool.query('INSERT INTO numeros_usados (juego_id, lote_id, fila, columna, numero, creado_en) VALUES (?,?,?,?,?,NOW())',
          [juego_id, loteId, fila, columna, numero]);
      }
    }

    // generar PDF (html basado en plantilla y números)
    const filename = `bingo_${loteId}_${uuidv4()}.pdf`;
    const pdfPath = path.join(process.env.PDFS_FOLDER || path.join(__dirname,'../pdfs'), filename);
    await pdfService.renderPdfFromLote(loteId, pdfPath, { filas, columnas, tablasPorPagina });

    // actualizar ruta pdf en lote
    await pool.query('UPDATE lotes SET pdf_path = ? WHERE id = ?', [filename, loteId]);

    res.json({ loteId, pdfUrl: `/pdfs/${filename}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Error generando lote' });
  }
}

module.exports = { createLot };
