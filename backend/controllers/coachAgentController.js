const { db } = require('../config/firebase');
const fetch = require('node-fetch');

// POST /api/coach-agent/profile
const saveProfile = async (req, res) => {
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
const getProfile = async (req, res) => {
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

// GET /api/coach-agent/daily-plan?userId=xxx
const getDailyPlan = async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  try {
    // Fetch user profile
    const profileDoc = await db.collection('coachAgentProfiles').doc(userId).get();
    if (!profileDoc.exists) return res.status(400).json({ error: 'User profile not found' });
    const profile = profileDoc.data();
    // Fetch ability map (reuse ability map logic or mock for now)
    let abilityMap = null;
    const abilityDoc = await db.collection('abilityMaps').doc(userId).get();
    if (abilityDoc.exists) abilityMap = abilityDoc.data();
    // If not in DB, use mock or fallback
    if (!abilityMap) {
      abilityMap = {
        abilities: [
          { type: 'Algorithms', knowledgePoint: 'Binary Search', correct: 8, wrong: 2 },
          { type: 'JavaScript', knowledgePoint: 'Type Coercion', correct: 3, wrong: 5 },
          { type: 'System Design', knowledgePoint: 'Scalability', correct: 2, wrong: 4 },
          { type: 'Algorithms', knowledgePoint: 'Dynamic Programming', correct: 1, wrong: 6 },
          { type: 'JavaScript', knowledgePoint: 'Closures', correct: 7, wrong: 1 }
        ]
      };
    }
    // Compose prompt for Gemini
    const prompt = `
You are an AI interview coach. Based on the following user profile and ability map, generate a personalized daily training plan for today. The plan should fit within the user's available time and focus on their weak areas, but also reinforce strengths. Include a mix of coding, behavioral, and system design tasks as appropriate.

User Profile:
${JSON.stringify(profile, null, 2)}

Ability Map:
${JSON.stringify(abilityMap.abilities, null, 2)}

Return the plan as a JSON array, each item with: { type, title, description, estimatedTime (minutes) }
`;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await response.json();
    let text = '';
    if (data.candidates && data.candidates[0]) {
      text = data.candidates[0].content.parts[0].text;
      if (text.startsWith('```json')) text = text.substring(7, text.length - 3).trim();
      else if (text.startsWith('```')) text = text.substring(3, text.length - 3).trim();
      let plan;
      try {
        plan = JSON.parse(text);
      } catch (e) {
        plan = [];
      }
      res.json({ success: true, plan });
    } else {
      res.status(500).json({ error: 'Gemini plan generation failed', details: data });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate daily plan', details: err.message });
  }
};

// POST /api/coach-agent/goal-chat
const goalChat = async (req, res) => {
  const { goal, messages, newMessage } = req.body;
  if (!goal || !messages || !Array.isArray(messages) || !newMessage) {
    return res.status(400).json({ error: 'goal, messages, and newMessage are required' });
  }
  try {
    // Compose conversation history for Gemini
    let historyText = messages.map(m => (m.role === 'user' ? 'User: ' : 'AI: ') + m.content).join('\n');
    const prompt = `
You are an AI interview coach. The user has set the following goal: "${goal}".
Continue the following conversation, always keeping the user's goal in mind. Be proactive, supportive, and provide actionable advice. If the user asks for a plan, break it down into steps. If the user seems lost, help them clarify their next actions.

Conversation so far:
${historyText}

User: ${newMessage}
AI:`;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      // Mock reply if no API key
      return res.json({ reply: `（模拟回复）你的目标是：${goal}。你刚才说：“${newMessage}”。AI建议：坚持下去，每天进步一点点！` });
    }
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await response.json();
    let text = '';
    if (data.candidates && data.candidates[0]) {
      text = data.candidates[0].content.parts[0].text;
      // Remove code block markers if present
      if (text.startsWith('```')) text = text.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim();
      return res.json({ reply: text });
    } else {
      return res.status(500).json({ error: 'Gemini chat failed', details: data });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate chat reply', details: err.message });
  }
};

module.exports = { saveProfile, getProfile, getDailyPlan, goalChat }; 