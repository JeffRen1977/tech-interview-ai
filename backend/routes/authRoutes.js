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

// 健康检查端点
router.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'AI Interview Coach Backend is running',
        timestamp: new Date().toISOString()
    });
});

// 公开路由
router.post('/register', registerUser);
router.post('/login', loginUser);

// 需要认证的路由
router.get('/me', verifyToken, getCurrentUser);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;