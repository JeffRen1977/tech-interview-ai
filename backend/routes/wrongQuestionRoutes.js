const express = require('express');
const router = express.Router();
const { getWrongQuestions, getAIExplanationAndRedoPlan, getAbilityMap, videoInterviewFeedback } = require('../controllers/wrongQuestionController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/', getWrongQuestions);
router.post('/:id/ai-feedback', getAIExplanationAndRedoPlan);
router.get('/ability-map', getAbilityMap);
router.post('/learn-feedback/video-feedback', upload.single('video'), videoInterviewFeedback);

module.exports = router; 