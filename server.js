const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Importar rutas de la API
const usuariosRoutes = require('./routes/usuarios');
console.log('Montando rutas de usuarios...');
app.use('/api/usuarios', usuariosRoutes);
console.log('Rutas montadas: /api/usuarios');

// Ruta por defecto → muestra landing (index.html)
app.get('/', (req, res) => {
  console.log('Accediendo a la landing page');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Arrancar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
