const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');

router.get('/', proveedoresController.getProveedores);
/*router.get('/:id', proveedoresController.getProveedorById);
router.post('/login', proveedoresController.loginProveedor);
 router.post('/register', proveedoresController.registerProveedor);
router.put('/:id', usuariosController.updateUsuario);
router.delete('/:id', usuariosController.deleteUsuario); */
module.exports = router;