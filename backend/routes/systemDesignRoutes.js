const express = require('express');
const router = express.Router();
const systemDesignController = require('../controllers/systemDesignController');

// 获取所有系统设计问题
router.get('/questions', systemDesignController.getAllQuestions);

// 获取筛选后的系统设计问题
router.get('/questions/filtered', systemDesignController.getFilteredQuestions);

// 根据ID获取特定系统设计问题
router.get('/questions/:id', systemDesignController.getQuestionById);

module.exports = router; 