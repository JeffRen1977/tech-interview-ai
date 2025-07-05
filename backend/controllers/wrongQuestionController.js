// 使用动态导入来支持 node-fetch v3
let fetch;

// 初始化 fetch
(async () => {
    try {
        const fetchModule = await import('node-fetch');
        fetch = fetchModule.default;
    } catch (error) {
        console.error('Failed to import node-fetch:', error);
        // 如果 node-fetch 不可用，使用全局 fetch（Node.js 18+）
        if (typeof globalThis.fetch === 'function') {
            fetch = globalThis.fetch;
        } else {
            console.error('No fetch implementation available');
        }
    }
})();

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Mock user wrong questions (replace with DB in production)
const mockWrongQuestions = [
  {
    id: '1',
    question: 'What is the output of 1 + "2" in JavaScript?',
    userAnswer: '3',
    correctAnswer: '"12"',
    type: 'JavaScript',
    knowledgePoint: 'Type Coercion',
    timestamp: Date.now() - 86400000
  },
  {
    id: '2',
    question: 'What is the time complexity of binary search?',
    userAnswer: 'O(n)',
    correctAnswer: 'O(log n)',
    type: 'Algorithms',
    knowledgePoint: 'Complexity',
    timestamp: Date.now() - 43200000
  }
];

// GET /api/wrong-questions
const getWrongQuestions = async (req, res) => {
  // In production, filter by userId from auth
  res.json({ success: true, questions: mockWrongQuestions });
};

// POST /api/wrong-questions/:id/ai-feedback
const getAIExplanationAndRedoPlan = async (req, res) => {
  const { id } = req.params;
  const questionObj = mockWrongQuestions.find(q => q.id === id);
  if (!questionObj) {
    return res.status(404).json({ error: 'Question not found' });
  }
  const { question, userAnswer, correctAnswer, type, knowledgePoint } = questionObj;

  const prompt = `
You are an interview coach. For the following question the user got wrong, provide:
1. A clear, concise explanation of the correct answer (as if teaching a student).
2. A step-by-step redo plan for the user to master this knowledge point.

Question: ${question}
User's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}
Type: ${type}
Knowledge Point: ${knowledgePoint}

Format your response as JSON:
{
  "explanation": "...",
  "redoPlan": ["step 1", "step 2", ...]
}
`;

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await response.json();
    if (data.candidates && data.candidates[0]) {
      let text = data.candidates[0].content.parts[0].text;
      // Clean markdown code block if present
      if (text.startsWith('```json')) text = text.substring(7, text.length - 3).trim();
      else if (text.startsWith('```')) text = text.substring(3, text.length - 3).trim();
      let ai;
      try {
        ai = JSON.parse(text);
      } catch (e) {
        ai = { explanation: text, redoPlan: [] };
      }
      res.json({ success: true, ...ai });
    } else {
      res.status(500).json({ error: 'AI feedback failed' });
    }
  } catch (error) {
    console.error('AI feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/ability-map
const getAbilityMap = async (req, res) => {
  // Mocked ability stats
  const abilities = [
    { type: 'Algorithms', knowledgePoint: 'Binary Search', correct: 8, wrong: 2 },
    { type: 'JavaScript', knowledgePoint: 'Type Coercion', correct: 3, wrong: 5 },
    { type: 'System Design', knowledgePoint: 'Scalability', correct: 2, wrong: 4 },
    { type: 'Algorithms', knowledgePoint: 'Dynamic Programming', correct: 1, wrong: 6 },
    { type: 'JavaScript', knowledgePoint: 'Closures', correct: 7, wrong: 1 }
  ];
  // Recommend exercises for weak points (wrong > correct)
  const recommendations = abilities
    .filter(a => a.wrong > a.correct)
    .map(a => ({
      type: a.type,
      knowledgePoint: a.knowledgePoint,
      exerciseId: `${a.type.toLowerCase().replace(/\s/g, '-')}-${a.knowledgePoint.toLowerCase().replace(/\s/g, '-')}`,
      title: `${a.knowledgePoint} Practice`
    }));
  res.json({ success: true, abilities, recommendations });
};

// POST /api/learn-feedback/video-feedback
const videoInterviewFeedback = async (req, res) => {
  const videoPath = req.file.path;
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const videoData = fs.readFileSync(videoPath);
    const base64Video = videoData.toString('base64');
    const prompt = `
Please:
1. Transcribe all spoken words in this video.
2. Analyze the transcript for language expression, logical structure, and (if possible) body language cues.
Return a JSON object with keys: transcript, languageFeedback, logicFeedback, bodyLanguageFeedback.
`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: req.file.mimetype || 'video/mp4',
                    data: base64Video
                  }
                }
              ]
            }
          ]
        })
      }
    );
    const data = await response.json();
    // Extract and parse the feedback from Gemini's response
    let text = '';
    if (data.candidates && data.candidates[0]) {
      text = data.candidates[0].content.parts[0].text;
      // Clean markdown code block if present
      if (text.startsWith('```json')) text = text.substring(7, text.length - 3).trim();
      else if (text.startsWith('```')) text = text.substring(3, text.length - 3).trim();
      let feedback;
      try {
        feedback = JSON.parse(text);
      } catch (e) {
        feedback = { transcript: '', languageFeedback: text, logicFeedback: '', bodyLanguageFeedback: '' };
      }
      res.json({ success: true, ...feedback });
    } else {
      res.status(500).json({ error: 'Gemini feedback failed', details: data });
    }
  } catch (err) {
    res.status(500).json({ error: 'Video analysis failed', details: err.message });
  } finally {
    // Clean up uploaded file
    fs.unlink(videoPath, () => {});
  }
};

module.exports = {
  getWrongQuestions,
  getAIExplanationAndRedoPlan,
  getAbilityMap,
  videoInterviewFeedback
}; 