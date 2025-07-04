const express = require('express');
const router = express.Router();
const mockController = require('../controllers/mockController');

// 题库API
router.get('/coding-questions', mockController.getCodingQuestions);
router.get('/system-design-questions', mockController.getSystemDesignQuestions);

// AI生成API
router.post('/ai-generate', mockController.generateQuestion);

module.exports = router; 