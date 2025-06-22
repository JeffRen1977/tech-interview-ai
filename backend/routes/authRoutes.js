const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// 路由: /api/auth/register
router.post('/register', registerUser);

// 路由: /api/auth/login
router.post('/login', loginUser);

module.exports = router;