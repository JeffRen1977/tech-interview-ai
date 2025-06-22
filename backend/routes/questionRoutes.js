const express = require('express');
const router = express.Router();
const { 
    generateCodingQuestion, 
    saveCodingQuestion,
    generateSystemDesignQuestion,
    saveSystemDesignQuestion,
    startCodingInterview,
    submitCodingSolution,
    getCodingFeedback,
    endCodingInterview
} = require('../controllers/questionController');

// 路由: /api/questions/generate-coding
router.post('/generate-coding', generateCodingQuestion);

// 路由: /api/questions/save-coding
router.post('/save-coding', saveCodingQuestion);

// 路由: /api/questions/generate-system
router.post('/generate-system', generateSystemDesignQuestion);

// 路由: /api/questions/save-system-design
router.post('/save-system-design', saveSystemDesignQuestion);

// 新增: 编程面试相关路由
// 开始编程面试
router.post('/coding-interview/start', startCodingInterview);

// 提交编程解答
router.post('/coding-interview/submit', submitCodingSolution);

// 获取编程反馈
router.post('/coding-interview/feedback', getCodingFeedback);

// 结束编程面试
router.post('/coding-interview/end', endCodingInterview);

module.exports = router;