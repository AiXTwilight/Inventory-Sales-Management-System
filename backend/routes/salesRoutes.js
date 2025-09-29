const express = require('express');
const router = express.Router();
const { recordSale, getSalesHistory } = require('../controllers/salesController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateSale } = require('../utils/validator');
router.use(authMiddleware);
router.post('/', validateSale, recordSale);
router.get('/', getSalesHistory);
module.exports = router;