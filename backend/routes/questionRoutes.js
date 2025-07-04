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
    endBehavioralInterview,
    startSystemDesignInterview,
    submitSystemDesignSolution,
    getSystemDesignFeedback,
    endSystemDesignInterview,
    transcribeAudio,
    getUserHistory
} = require('../controllers/questionController');
const { verifyToken, verifyAdmin } = require('../controllers/authController');

// 管理员功能路由 - 需要管理员权限
router.post('/generate-coding', verifyToken, verifyAdmin, generateCodingQuestion);
router.post('/save-coding', verifyToken, verifyAdmin, saveCodingQuestion);
router.post('/generate-system', verifyToken, verifyAdmin, generateSystemDesignQuestion);
router.post('/save-system-design', verifyToken, verifyAdmin, saveSystemDesignQuestion);

// 面试功能路由 - 需要用户登录
router.post('/coding-interview/start', verifyToken, startCodingInterview);
router.post('/coding-interview/submit', verifyToken, submitCodingSolution);
router.post('/coding-interview/feedback', verifyToken, getCodingFeedback);
router.post('/coding-interview/end', verifyToken, endCodingInterview);

router.post('/behavioral-interview/start', verifyToken, startBehavioralInterview);
router.post('/behavioral-interview/submit', verifyToken, submitBehavioralResponse);
router.post('/behavioral-interview/feedback', verifyToken, getBehavioralFeedback);
router.post('/behavioral-interview/end', verifyToken, endBehavioralInterview);

router.post('/system-design-interview/start', verifyToken, startSystemDesignInterview);
router.post('/system-design-interview/submit', verifyToken, submitSystemDesignSolution);
router.post('/system-design-interview/feedback', verifyToken, getSystemDesignFeedback);
router.post('/system-design-interview/end', verifyToken, endSystemDesignInterview);

// 音频转录 - 需要用户登录
router.post('/transcribe-audio', verifyToken, transcribeAudio);

// 用户历史记录 - 需要用户登录
router.get('/user-history', verifyToken, getUserHistory);

module.exports = router;