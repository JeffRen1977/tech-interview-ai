const express = require('express');
const router = express.Router();
const { 
    analyzeResume, 
    assessJDMatching, 
    generateCoverLetter 
} = require('../controllers/resumeController');
const { verifyToken } = require('../controllers/authController');

// 简历优化功能 - 需要用户登录
router.post('/analyze', verifyToken, analyzeResume);
router.post('/jd-matching', verifyToken, assessJDMatching);
router.post('/cover-letter', verifyToken, generateCoverLetter);

module.exports = router; 