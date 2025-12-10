const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../zeda.db'));

exports.getProveedores = (req, res) => {
  console.log('getProveedores llamado'); // log al recibir la petición
  try {
    const stmt = db.prepare('SELECT * FROM proveedores');
    const proveedores = stmt.all();
    console.log(`Proveedores encontrados: ${proveedores.length}`); // log número de registros
    res.json(proveedores);
  } catch (err) {
    console.error('Error getProveedores:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.updateProveedor = (req, res) => {
  const id = req.params.id;
  const { NOMBRE, DIRECCION, CONTACTO, ESTADO, FECHA_REGISTRO } = req.body;
  console.log(`updateProveedor llamado para ID: ${id}`); // log al recibir la petición
  console.log('Datos recibidos:', { NOMBRE, DIRECCION, CONTACTO, ESTADO, FECHA_REGISTRO }); // log de datos
  try {
    const stmt = db.prepare(`
      UPDATE proveedores
      SET NOMBRE = ?, DIRECCION = ?, CONTACTO = ?, ESTADO = ?, FECHA_REGISTRO = ?
      WHERE ID = ?
    `);
    const result = stmt.run(NOMBRE, DIRECCION, CONTACTO, ESTADO, FECHA_REGISTRO, id);
    console.log(`Proveedor actualizado, cambios: ${result.changes}`); // log número de cambios
    res.json({ message: 'Proveedor actualizado', changes: result.changes });
  } catch (err) {
    console.error('Error updateProveedor:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProveedor = (req, res) => {
  const id = req.params.id;
  console.log(`deleteProveedor llamado para ID: ${id}`); // log al recibir la petición
  try {
    const stmt = db.prepare('DELETE FROM proveedores WHERE ID = ?');
    const result = stmt.run(id);
    console.log(`Proveedor eliminado, cambios: ${result.changes}`); // log número de cambios
    res.json({ message: 'Proveedor eliminado', changes: result.changes });
  } catch (err) {
    console.error('Error deleteProveedor:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};