const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../zeda.db'));

exports.getUsuarios = (req, res) => {
  console.log('getUsuarios llamado'); // log al recibir la petición
  try {
    const stmt = db.prepare('SELECT * FROM usuarios');
    const usuarios = stmt.all();
    console.log(`Usuarios encontrados: ${usuarios.length}`); // log número de registros
    res.json(usuarios);
  } catch (err) {
    console.error('Error getUsuarios:', err.message); // log de error
    res.status(500).json({ error: err.message });
  }
};

exports.getUsuarioById = (req, res) => {
  console.log(`getUsuarioById llamado con id=${req.params.id}`);
  try {
    const stmt = db.prepare('SELECT * FROM usuarios WHERE id = ?');
    const usuario = stmt.get(req.params.id);
    console.log('Usuario encontrado:', usuario);
    res.json(usuario);
  } catch (err) {
    console.error('Error getUsuarioById:', err.message);
    res.status(500).json({ error: err.message });
  }
};
