const express = require('express');
const router = express.Router();
const { 
    getFilteredCodingQuestions, 
    executeCode, 
    submitCodeForAnalysis, 
    saveToLearningHistory,
    getUserLearningHistory,
    removeFromLearningHistory,
    getWrongQuestions
} = require('../controllers/codeController');
const { verifyToken } = require('../controllers/authController');

// 获取筛选后的编程题目 - 公开访问
router.get('/questions/filtered', getFilteredCodingQuestions);

// 需要用户登录的路由
router.post('/execute', verifyToken, executeCode);
router.post('/submit', verifyToken, submitCodeForAnalysis);
router.post('/learning-history', verifyToken, saveToLearningHistory);
router.get('/learning-history/:userId', verifyToken, getUserLearningHistory);
router.delete('/learning-history/:historyId', verifyToken, removeFromLearningHistory);
router.get('/wrong-questions', verifyToken, getWrongQuestions);

module.exports = router;
