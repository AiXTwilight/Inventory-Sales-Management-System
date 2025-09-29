const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../utils/validator');
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
module.exports = router;