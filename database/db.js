const Database = require('better-sqlite3');
const db = new Database('inventarios.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS USUARIOS (
    id TEXT PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    CARGO TEXT NOT NULL,
    FECHA_INGRESO DATE NOT NULL,
    FECHA_SALIDA DATE,
    ESTADO TEXT NOT NULL
  )
`).run();

module.exports = db;