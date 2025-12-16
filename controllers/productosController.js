const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../zeda.db'));

exports.getProductos = (req, res) => {
  try {
    // Seleccionamos la materia junto con el nombre del proveedor y el nombre del usuario (si existen)
    const stmt = db.prepare(`
      SELECT p.*, u.NOMBRE AS USUARIO_NOMBRE
      FROM Producto p
      LEFT JOIN usuarios u ON p.USUARIO_ULT_MOD = u.ID
    `);
    const producto = stmt.all();
    res.json(producto);
  } catch (err) {
    console.error('Error getProducto:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.getProductoById = (req, res) => {
  try {
    // Seleccionamos la materia junto con el nombre del proveedor y el nombre del usuario (si existen)
    const stmt = db.prepare(`
      SELECT p.*, u.NOMBRE AS USUARIO_NOMBRE
      FROM Producto p
      LEFT JOIN usuarios u ON p.USUARIO_ULT_MOD = u.ID
      WHERE ID = ?
    `);
    const producto = stmt.all(req.params.id);
    res.json(producto);
  } catch (err) {
    console.error('Error getProducto:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};


exports.createProducto = (req, res) => {
  const { NOMBRE, DESCRIPCION,  ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO PRODUCTO (NOMBRE, DESCRIPCION, ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(NOMBRE, DESCRIPCION, ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD || null);
    res.json({ 
      message: 'Producto creado correctamente',
      id: result.lastInsertRowid,
      changes: result.changes 
    });
  } catch (err) {
    console.error('Error createProducto:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: err.message });
  }
};

exports.updateProducto = (req, res) => {
  const id = req.params.id;
  const { NOMBRE, DESCRIPCION, ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD } = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE PRODUCTO
      SET NOMBRE = ?, DESCRIPCION = ?, ESTADO = ?, FECHA_REGISTRO = ?, USUARIO_ULT_MOD = ?
      WHERE ID = ?
    `);
    const result = stmt.run(NOMBRE, DESCRIPCION, ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD || null, id);
    res.json({ message: 'Producto actualizado', changes: result.changes });
  } catch (err) {
    console.error('Error updateProducto:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProducto = (req, res) => {
  const id = req.params.id;
  try {
    const stmt = db.prepare('DELETE FROM PRODUCTO WHERE ID = ?');
    const result = stmt.run(id);
    res.json({ message: 'Producto eliminado', changes: result.changes });
  } catch (err) {
    console.error('Error deleteProducto:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};