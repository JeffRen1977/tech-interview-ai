const express = require('express');
const router = express.Router();
const { 
    getCodingQuestions, 
    executeCode, 
    submitCodeForAnalysis,
    getUserLearningHistory,
    saveToLearningHistory,
    removeFromLearningHistory,
    getFilteredCodingQuestions,
    getFilterOptions
} = require('../controllers/codeController');

// GET /api/code/questions
router.get('/questions', getCodingQuestions);

// GET /api/code/questions/filtered
router.get('/questions/filtered', getFilteredCodingQuestions);

// GET /api/code/filter-options
router.get('/filter-options', getFilterOptions);

// POST /api/code/execute
router.post('/execute', executeCode);

// POST /api/code/submit
router.post('/submit', submitCodeForAnalysis);

// Learning history routes
// GET /api/code/learning-history/:userId
router.get('/learning-history/:userId', getUserLearningHistory);

// POST /api/code/learning-history
router.post('/learning-history', saveToLearningHistory);

// DELETE /api/code/learning-history/:historyId
router.delete('/learning-history/:historyId', removeFromLearningHistory);

module.exports = router;
