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
    endCodingInterview,
    startBehavioralInterview,
    submitBehavioralResponse,
    getBehavioralFeedback,
    endBehavioralInterview
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

// 新增: 行为面试相关路由
// 开始行为面试
router.post('/behavioral-interview/start', startBehavioralInterview);

// 提交行为回答
router.post('/behavioral-interview/submit', submitBehavioralResponse);

// 获取行为反馈
router.post('/behavioral-interview/feedback', getBehavioralFeedback);

// 结束行为面试
router.post('/behavioral-interview/end', endBehavioralInterview);

module.exports = router;