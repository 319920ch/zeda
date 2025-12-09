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