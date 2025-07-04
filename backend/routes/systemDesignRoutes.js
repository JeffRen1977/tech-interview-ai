const express = require('express');
const router = express.Router();
const systemDesignController = require('../controllers/systemDesignController');
const { verifyToken } = require('../controllers/authController');

// 获取所有系统设计问题
router.get('/questions', systemDesignController.getAllQuestions);

// 获取筛选后的系统设计问题
router.get('/questions/filtered', systemDesignController.getFilteredQuestions);

// 根据ID获取特定系统设计问题
router.get('/questions/:id', systemDesignController.getQuestionById);

// 保存到学习历史 - 需要用户登录
router.post('/learning-history', verifyToken, systemDesignController.saveToLearningHistory);

// 分析系统设计解答（用于模拟面试）- 需要用户登录
router.post('/analyze', verifyToken, systemDesignController.analyzeSystemDesignSolution);

module.exports = router; 