const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../zeda.db'));

exports.getProveedores = (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM proveedores');
    const proveedores = stmt.all();
    res.json(proveedores);
  } catch (err) {
    console.error('Error getProveedores:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.createProveedor = (req, res) => {
  const { NOMBRE, DIRECCION, CONTACTO, ESTADO, FECHA_REGISTRO } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO proveedores (NOMBRE, DIRECCION, CONTACTO, ESTADO, FECHA_REGISTRO)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(NOMBRE, DIRECCION, CONTACTO, ESTADO, FECHA_REGISTRO);
    res.json({ 
      message: 'Proveedor creado correctamente',
      id: result.lastInsertRowid,
      changes: result.changes 
    });
  } catch (err) {
    console.error('Error createProveedor:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: err.message });
  }
};

exports.updateProveedor = (req, res) => {
  const id = req.params.id;
  const { NOMBRE, DIRECCION, CONTACTO, ESTADO, FECHA_REGISTRO } = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE proveedores
      SET NOMBRE = ?, DIRECCION = ?, CONTACTO = ?, ESTADO = ?, FECHA_REGISTRO = ?
      WHERE ID = ?
    `);
    const result = stmt.run(NOMBRE, DIRECCION, CONTACTO, ESTADO, FECHA_REGISTRO, id);
    res.json({ message: 'Proveedor actualizado', changes: result.changes });
  } catch (err) {
    console.error('Error updateProveedor:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProveedor = (req, res) => {
  const id = req.params.id;
  try {
    const stmt = db.prepare('DELETE FROM proveedores WHERE ID = ?');
    const result = stmt.run(id);
    res.json({ message: 'Proveedor eliminado', changes: result.changes });
  } catch (err) {
    console.error('Error deleteProveedor:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};