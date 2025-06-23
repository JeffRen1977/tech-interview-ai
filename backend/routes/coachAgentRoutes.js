const express = require('express');
const router = express.Router();
const { saveUserProfile, getUserProfile, getDailyPlan, goalChat } = require('../controllers/coachAgentController');

router.post('/profile', saveUserProfile);
router.get('/profile', getUserProfile);
router.get('/daily-plan', getDailyPlan);
router.post('/goal-chat', goalChat);

module.exports = router; 