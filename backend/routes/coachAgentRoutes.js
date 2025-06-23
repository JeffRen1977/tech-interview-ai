const express = require('express');
const router = express.Router();
const { saveUserProfile, getUserProfile, getDailyPlan } = require('../controllers/coachAgentController');

router.post('/profile', saveUserProfile);
router.get('/profile', getUserProfile);
router.get('/daily-plan', getDailyPlan);

module.exports = router; 