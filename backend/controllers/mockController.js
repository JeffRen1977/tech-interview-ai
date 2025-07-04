const { db } = require('../config/firebase');
const { generateCodingQuestion, generateSystemDesignQuestion } = require('../utils/geminiService');

// 获取编程题
exports.getCodingQuestions = async (req, res) => {
  try {
    const { difficulty } = req.query;
    let ref = db.collection('coding-questions');
    if (difficulty) {
      ref = ref.where('difficulty', '==', difficulty);
    }
    const snapshot = await ref.get();
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coding questions', details: err.message });
  }
};

// 获取系统设计题
exports.getSystemDesignQuestions = async (req, res) => {
  try {
    const { difficulty } = req.query;
    let ref = db.collection('system-design-questions');
    if (difficulty) {
      ref = ref.where('difficulty', '==', difficulty);
    }
    const snapshot = await ref.get();
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch system design questions', details: err.message });
  }
};

// AI生成题目
exports.generateQuestion = async (req, res) => {
  try {
    const { type, difficulty } = req.body;
    if (!type || !['coding', 'system-design'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    let question;
    if (type === 'coding') {
      question = await generateCodingQuestion(difficulty);
    } else {
      question = await generateSystemDesignQuestion(difficulty);
    }
    res.json({ question });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate question', details: err.message });
  }
}; 