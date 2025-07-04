const express = require('express');
const router = express.Router();
const behavioralController = require('../controllers/behavioralController');

// 获取所有行为面试问题
router.get('/questions', behavioralController.getAllQuestions);

// 获取筛选后的行为面试问题
router.get('/questions/filtered', behavioralController.getFilteredQuestions);

// 根据ID获取特定行为面试问题
router.get('/questions/:id', behavioralController.getQuestionById);

// AI分析用户答案
router.post('/analyze', behavioralController.analyzeAnswer);

module.exports = router; 