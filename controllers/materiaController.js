const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../zeda.db'));

exports.getMateria = (req, res) => {
  try {
    // Seleccionamos la materia junto con el nombre del proveedor y el nombre del usuario (si existen)
    const stmt = db.prepare(`
      SELECT m.*, pr.NOMBRE AS PROVEEDOR_NOMBRE, u.NOMBRE AS USUARIO_NOMBRE
      FROM MATERIA m
      LEFT JOIN proveedores pr ON m.PROVEEDOR_ID = pr.ID
      LEFT JOIN usuarios u ON m.USUARIO_ULT_MOD = u.ID
    `);
    const materia = stmt.all();
    res.json(materia);
  } catch (err) {
    console.error('Error getMateria:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.createMateria = (req, res) => {
  const { NOMBRE, DESCRIPCION, PROVEEDOR_ID, ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD } = req.body;
  console.log('createMateria llamado', { NOMBRE, DESCRIPCION, PROVEEDOR_ID, ESTADO, FECHA_REGISTRO });
  try {
    const stmt = db.prepare(`
      INSERT INTO MATERIA (NOMBRE, DESCRIPCION, PROVEEDOR_ID, ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(NOMBRE, DESCRIPCION, PROVEEDOR_ID, ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD || null);
    console.log('Materia insertada, id:', result.lastInsertRowid);
    res.json({ 
      message: 'Materia creada correctamente',
      id: result.lastInsertRowid,
      changes: result.changes 
    });
  } catch (err) {
    console.error('Error createMateria:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: err.message });
  }
};

exports.updateMateria = (req, res) => {
  const id = req.params.id;
  const { NOMBRE, DESCRIPCION, PROVEEDOR_ID, ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD } = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE MATERIA
      SET NOMBRE = ?, DESCRIPCION = ?, PROVEEDOR_ID = ?, ESTADO = ?, FECHA_REGISTRO = ?, USUARIO_ULT_MOD = ?
      WHERE ID = ?
    `);
    const result = stmt.run(NOMBRE, DESCRIPCION, PROVEEDOR_ID, ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD || null, id);
    res.json({ message: 'Materia actualizada', changes: result.changes });
  } catch (err) {
    console.error('Error updateMateria:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMateria = (req, res) => {
  const id = req.params.id;
  try {
    const stmt = db.prepare('DELETE FROM MATERIA WHERE ID = ?');
    const result = stmt.run(id);
    res.json({ message: 'Materia eliminada', changes: result.changes });
  } catch (err) {
    console.error('Error deleteMateria:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};