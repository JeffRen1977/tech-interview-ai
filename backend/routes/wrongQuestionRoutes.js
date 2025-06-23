const express = require('express');
const router = express.Router();
const { getWrongQuestions, getAIExplanationAndRedoPlan, getAbilityMap } = require('../controllers/wrongQuestionController');

router.get('/', getWrongQuestions);
router.post('/:id/ai-feedback', getAIExplanationAndRedoPlan);
router.get('/ability-map', getAbilityMap);

module.exports = router; 