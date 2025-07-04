const express = require('express');
const router = express.Router();
const mockController = require('../controllers/mockController');
const { verifyToken } = require('../controllers/authController');

// 题库API
router.get('/coding-questions', mockController.getCodingQuestions);
router.get('/system-design-questions', mockController.getSystemDesignQuestions);
router.get('/behavioral-questions', mockController.getBehavioralQuestions);

// AI生成题目API
router.post('/ai-generate', mockController.generateQuestion);

// AI生成题目数据库API
router.get('/ai-coding-questions', mockController.getAICodingQuestions);
router.get('/ai-system-design-questions', mockController.getAISystemDesignQuestions);
router.get('/ai-behavioral-questions', mockController.getAIBehavioralQuestions);

// 保存模拟面试结果到用户面试历史 (需要认证)
router.post('/save-interview-result', verifyToken, mockController.saveMockInterviewResult);

module.exports = router; 