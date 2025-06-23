const express = require('express');
const router = express.Router();
const { saveUserProfile, getUserProfile } = require('../controllers/coachAgentController');

router.post('/profile', saveUserProfile);
router.get('/profile', getUserProfile);

module.exports = router; 