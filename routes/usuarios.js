const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

router.get('/', usuariosController.getUsuarios);
router.get('/:id', usuariosController.getUsuarioById);
router.post('/login', usuariosController.loginUsuario);
/* router.post('/register', usuariosController.registerUsuario);
router.put('/:id', usuariosController.updateUsuario);
router.delete('/:id', usuariosController.deleteUsuario); */
module.exports = router;
