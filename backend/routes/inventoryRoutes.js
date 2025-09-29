const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateProduct } = require('../utils/validator');
router.use(authMiddleware);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', validateProduct, addProduct);
router.put('/:id', validateProduct, updateProduct);
router.delete('/:id', deleteProduct);
module.exports = router;