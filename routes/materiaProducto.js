const express = require('express');
const router = express.Router();
const materiaProductoController = require('../controllers/materiaProductoController');

router.get('/', materiaProductoController.getMateriaProducto);
router.get('/producto/:id', materiaProductoController.getPresentacionesByProducto);
router.get('/producto/:id/:presentacionId', materiaProductoController.getMateriaByProducto);
router.get('/:id', materiaProductoController.getMateriaProductoById);
router.post('/', materiaProductoController.createMateriaProducto);
router.put('/:id', materiaProductoController.updateMateriaProducto);
router.delete('/:id', materiaProductoController.deleteMateriaProducto);
module.exports = router;