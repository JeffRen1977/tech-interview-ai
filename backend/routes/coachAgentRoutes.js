const express = require('express');
const router = express.Router();
const { 
    saveProfile, 
    getProfile, 
    getDailyPlan, 
    goalChat 
} = require('../controllers/coachAgentController');
const { verifyToken } = require('../controllers/authController');

// AI教练功能 - 需要用户登录
router.post('/profile', verifyToken, saveProfile);
router.get('/profile', verifyToken, getProfile);
router.get('/daily-plan', verifyToken, getDailyPlan);
router.post('/goal-chat', verifyToken, goalChat);

module.exports = router; 