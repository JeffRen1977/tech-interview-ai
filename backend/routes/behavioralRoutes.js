const express = require('express');
const router = express.Router();
const behavioralController = require('../controllers/behavioralController');
const { verifyToken } = require('../controllers/authController');

// 获取所有行为面试问题
router.get('/questions', behavioralController.getAllQuestions);

// 获取筛选后的行为面试问题
router.get('/questions/filtered', behavioralController.getFilteredQuestions);

// 根据ID获取特定行为面试问题
router.get('/questions/:id', behavioralController.getQuestionById);

// AI分析用户答案 - 需要用户登录
router.post('/analyze', verifyToken, behavioralController.analyzeAnswer);

module.exports = router; 