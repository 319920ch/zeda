const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

router.get('/', usuariosController.getUsuarios);
router.get('/:id', usuariosController.getUsuarioById);

module.exports = router;
