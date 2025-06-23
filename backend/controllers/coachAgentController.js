const { db } = require('../config/firebase');

// POST /api/coach-agent/profile
const saveUserProfile = async (req, res) => {
  const { userId, targetCompanies, techStacks, language, availableTime, preferences } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  try {
    await db.collection('coachAgentProfiles').doc(userId).set({
      targetCompanies,
      techStacks,
      language,
      availableTime,
      preferences,
      updatedAt: new Date()
    }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save profile', details: err.message });
  }
};

// GET /api/coach-agent/profile?userId=xxx
const getUserProfile = async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  try {
    const doc = await db.collection('coachAgentProfiles').doc(userId).get();
    if (!doc.exists) return res.json({ success: true, profile: null });
    res.json({ success: true, profile: doc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get profile', details: err.message });
  }
};

module.exports = { saveUserProfile, getUserProfile }; 