const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../zeda.db'));

exports.getPresentaciones = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT p.*, pr.NOMBRE as PROVEEDOR_NOMBRE
      FROM PRESENTACION p
      LEFT JOIN PROVEEDORES pr ON p.PROVEEDOR_ID = pr.ID
    `);
    const presentaciones = stmt.all();
    res.json(presentaciones);
  } catch (err) {
    console.error('Error getPresentaciones:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.getPresentacionesById = (req, res) => {
  try {
    // Seleccionamos la presentación junto con el nombre del proveedor
    const stmt = db.prepare(`
      SELECT p.*, pr.NOMBRE AS PROVEEDOR_NOMBRE
      FROM PRESENTACION p
      LEFT JOIN PROVEEDORES pr ON p.PROVEEDOR_ID = pr.ID
      WHERE p.ID = ?
    `);
    const presentacion = stmt.all(req.params.id);
    res.json(presentacion);
  } catch (err) {
    console.error('Error getPresentacion:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};
exports.createPresentacion = (req, res) => {
  const { TAMANO_L, DESCRIPCION, COSTO_VENTA, ESTADO, PROVEEDOR_ID, FECHA_REGISTRO } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO PRESENTACION (TAMANO_L, DESCRIPCION, COSTO_VENTA, ESTADO, PROVEEDOR_ID, FECHA_REGISTRO)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(TAMANO_L, DESCRIPCION, COSTO_VENTA, ESTADO, PROVEEDOR_ID, FECHA_REGISTRO);
    res.json({ 
      message: 'Presentación creada correctamente',
      id: result.lastInsertRowid,
      changes: result.changes 
    });
  } catch (err) {
    console.error('Error createPresentacion:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: err.message });
  }
};

exports.updatePresentacion = (req, res) => {
  const id = req.params.id;
  const { TAMANO_L, DESCRIPCION, COSTO_VENTA, ESTADO, PROVEEDOR_ID, FECHA_REGISTRO } = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE PRESENTACION
      SET TAMANO_L = ?, DESCRIPCION = ?, COSTO_VENTA = ?, ESTADO = ?, PROVEEDOR_ID = ?, FECHA_REGISTRO = ?
      WHERE ID = ?
    `);
    const result = stmt.run(TAMANO_L, DESCRIPCION, COSTO_VENTA, ESTADO, PROVEEDOR_ID, FECHA_REGISTRO, id);
    res.json({ message: 'Presentación actualizada', changes: result.changes });
  } catch (err) {
    console.error('Error updatePresentacion:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.deletePresentacion = (req, res) => {
  const id = req.params.id;
  try {
    const stmt = db.prepare('DELETE FROM PRESENTACION WHERE ID = ?');
    const result = stmt.run(id);
    res.json({ message: 'Presentación eliminada', changes: result.changes });
  } catch (err) {
    console.error('Error deletePresentacion:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};