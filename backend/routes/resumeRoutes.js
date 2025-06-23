const express = require('express');
const router = express.Router();
const { analyzeResume, assessJDMatching, generateCoverLetter } = require('../controllers/resumeController');

// Resume Analyzer - Analyze resume and provide optimization suggestions
router.post('/analyze', analyzeResume);

// JD Matching Assessment - Analyze job description and calculate matching degree
router.post('/match', assessJDMatching);

// Cover Letter Generator - Generate customized cover letters
router.post('/cover-letter', generateCoverLetter);

module.exports = router; 