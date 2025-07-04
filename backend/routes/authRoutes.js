const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getCurrentUser, 
    updateProfile, 
    changePassword,
    verifyToken 
} = require('../controllers/authController');

// 公开路由
router.post('/register', registerUser);
router.post('/login', loginUser);

// 需要认证的路由
router.get('/me', verifyToken, getCurrentUser);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;