const express = require('express');
const router = express.Router();
const { 
    generateCodingQuestion, 
    saveCodingQuestion,
    generateSystemDesignQuestion,
    saveSystemDesignQuestion
} = require('../controllers/questionController');

// 路由: /api/questions/generate-coding
router.post('/generate-coding', generateCodingQuestion);

// 路由: /api/questions/save-coding
router.post('/save-coding', saveCodingQuestion);

// 路由: /api/questions/generate-system
router.post('/generate-system', generateSystemDesignQuestion);

// 路由: /api/questions/save-system-design
router.post('/save-system-design', saveSystemDesignQuestion);

module.exports = router;