const express = require('express');
const router = express.Router();
const { 
    getCodingQuestions, 
    executeCode, 
    submitCodeForAnalysis 
} = require('../controllers/codeController');

// GET /api/code/questions
router.get('/questions', getCodingQuestions);

// POST /api/code/execute
router.post('/execute', executeCode);

// POST /api/code/submit
router.post('/submit', submitCodeForAnalysis);

module.exports = router;
