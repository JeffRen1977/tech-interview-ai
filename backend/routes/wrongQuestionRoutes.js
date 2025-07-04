const express = require('express');
const router = express.Router();
const { 
    getWrongQuestions, 
    getAIExplanationAndRedoPlan 
} = require('../controllers/wrongQuestionController');
const { verifyToken } = require('../controllers/authController');

// 错题本功能 - 需要用户登录
router.get('/', verifyToken, getWrongQuestions);
router.post('/:id/ai-feedback', verifyToken, getAIExplanationAndRedoPlan);

module.exports = router; 