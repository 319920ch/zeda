const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../zeda.db'));

exports.getMateriaProducto = (req, res) => {
  try {
    // Seleccionamos la materia junto con el nombre del proveedor y el nombre del usuario (si existen)
    const stmt = db.prepare(`
    SELECT DISTINCT
    p.ID,
    p.NOMBRE,
    p.DESCRIPCION,
    p.ESTADO
    FROM PRODUCTO p
    JOIN MATERIA_PRODUCTO mp ON mp.PRODUCTO_ID = p.ID
    WHERE p.ESTADO = 'Activo'
    ORDER BY p.NOMBRE;
    `);
    const materia = stmt.all();
    res.json(materia);
  } catch (err) {
    console.error('Error getMateriaProducto:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.getPresentacionesByProducto = (req, res) => {
  try {
    // Seleccionamos la materia junto con el nombre del proveedor y el nombre del usuario (si existen)
    const stmt = db.prepare(`
    SELECT 
    pr.ID,
    pr.TAMANO_L,
    pr.DESCRIPCION
    FROM MATERIA_PRODUCTO mp
    JOIN PRESENTACION pr ON mp.PRESENTACION_ID = pr.ID
    WHERE mp.PRODUCTO_ID = ?
    GROUP BY pr.ID, pr.TAMANO_L, pr.DESCRIPCION
    ORDER BY pr.TAMANO_L;
    `);
    const materia = stmt.all(req.params.id);
    res.json(materia);
  } catch (err) {
    console.error('Error getMateriaProducto:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.getMateriaByProducto = (req, res) => {
  try {
    // Seleccionamos la materia junto con el nombre del proveedor y el nombre del usuario (si existen)
    const stmt = db.prepare(`
    SELECT
    m.NOMBRE AS MATERIA_NOMBRE,
    mp.CANTIDAD,
    mp.MEDIDA,
    mp.PORCENTAJE,
    mp.IVA,
    mp.COSTO_UNITARIO,
    mp.COSTO_UNITARIO_IVA
    FROM MATERIA_PRODUCTO mp
    JOIN MATERIA m ON mp.MATERIA_ID = m.ID
    WHERE mp.PRODUCTO_ID = ?
    AND mp.PRESENTACION_ID = ?
     ORDER BY m.NOMBRE;
    `);
    const materia = stmt.all(req.params.id, req.params.presentacionId);
    res.json(materia);
  } catch (err) {
    console.error('Error getMateriaProducto:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.getMateriaProductoById = (req, res) => {
  try {
    // Seleccionamos la materia junto con el nombre del proveedor y el nombre del usuario (si existen)
    const stmt = db.prepare(`
      SELECT mp.*, m.NOMBRE AS MATERIA_NOMBRE, u.NOMBRE AS USUARIO_NOMBRE, 
      p.NOMBRE AS PRODUCTO_NOMBRE, pr.TAMANO_L AS PRESENTACION_NOMBRE, pv.NOMBRE AS PROVEEDOR_NOMBRE
      FROM MATERIA_PRODUCTO mp
      LEFT JOIN PRESENTACION pr ON mp.PRODUCTO_ID = pr.ID
      LEFT JOIN PRODUCTO p ON mp.PRODUCTO_ID = p.ID
      LEFT JOIN MATERIA m ON mp.MATERIA_ID = m.ID
      LEFT JOIN usuarios u ON mp.USUARIO_ULT_MOD = u.ID
      LEFT JOIN PROVEEDORES pv ON mp.PROVEEDOR_ID = pv.ID
      WHERE ID = ?
    `);
    const materia = stmt.all(req.params.id);
    res.json(materia);
  } catch (err) {
    console.error('Error getMateriaProductoById:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};


exports.createMateriaProducto = (req, res) => {
  const { NOMBRE, DESCRIPCION, PROVEEDOR_ID, ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO MATERIA_PRODUCTO (NOMBRE, DESCRIPCION, PROVEEDOR_ID, ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(NOMBRE, DESCRIPCION, PROVEEDOR_ID, ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD || null);
    res.json({ 
      message: 'MateriaProducto creada correctamente',
      id: result.lastInsertRowid,
      changes: result.changes 
    });
  } catch (err) {
    console.error('Error createMateriaProducto:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: err.message });
  }
};

exports.updateMateriaProducto = (req, res) => {
  const id = req.params.id;
  const { NOMBRE, DESCRIPCION, PROVEEDOR_ID, ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD } = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE MATERIA_PRODUCTO
      SET NOMBRE = ?, DESCRIPCION = ?, PROVEEDOR_ID = ?, ESTADO = ?, FECHA_REGISTRO = ?, USUARIO_ULT_MOD = ?
      WHERE ID = ?
    `);
    const result = stmt.run(NOMBRE, DESCRIPCION, PROVEEDOR_ID, ESTADO, FECHA_REGISTRO, USUARIO_ULT_MOD || null, id);
    res.json({ message: 'MateriaProducto actualizada', changes: result.changes });
  } catch (err) {
    console.error('Error updateMateriaProducto:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMateriaProducto = (req, res) => {
  const id = req.params.id;
  try {
    const stmt = db.prepare('DELETE FROM MATERIA_PRODUCTO WHERE ID = ?');
    const result = stmt.run(id);
    res.json({ message: 'MateriaProducto eliminada', changes: result.changes });
  } catch (err) {
    console.error('Error deleteMateriaProducto:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};