const express = require('express');
const router = express.Router();
const { 
    getWrongQuestions, 
    getAIExplanationAndRedoPlan,
    getAbilityMap
} = require('../controllers/wrongQuestionController');
const { verifyToken } = require('../controllers/authController');

// 错题本功能 - 需要用户登录
router.get('/', verifyToken, getWrongQuestions);
router.post('/:id/ai-feedback', verifyToken, getAIExplanationAndRedoPlan);
router.get('/ability-map', verifyToken, getAbilityMap);

module.exports = router; 