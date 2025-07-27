const express = require('express');
const router = express.Router();
const llmController = require('../controllers/llmController');
const { verifyToken } = require('../controllers/authController');

// 获取所有LLM问题
router.get('/questions', llmController.getAllQuestions);

// 获取筛选后的LLM问题
router.get('/questions/filtered', llmController.getFilteredQuestions);

// 根据ID获取特定LLM问题
router.get('/questions/:id', llmController.getQuestionById);

// 获取LLM题目分类
router.get('/categories', llmController.getLLMCategories);

// 生成LLM问题 - 需要用户登录
router.post('/generate', verifyToken, llmController.generateLLMQuestion);

// 保存LLM问题 - 需要用户登录
router.post('/save', verifyToken, llmController.saveLLMQuestion);

// 保存到学习历史 - 需要用户登录
router.post('/learning-history', verifyToken, llmController.saveToLearningHistory);

// 分析LLM解答 - 需要用户登录
router.post('/analyze', verifyToken, llmController.analyzeLLMSolution);

module.exports = router; 