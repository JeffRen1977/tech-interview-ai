const express = require('express');
const router = express.Router();
const { getWrongQuestions, getAIExplanationAndRedoPlan } = require('../controllers/wrongQuestionController');

router.get('/', getWrongQuestions);
router.post('/:id/ai-feedback', getAIExplanationAndRedoPlan);

module.exports = router; 