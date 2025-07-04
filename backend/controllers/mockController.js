const { db } = require('../config/firebase');
const { generateCodingQuestion, generateSystemDesignQuestion, generateBehavioralQuestion } = require('../utils/geminiService');

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

// 获取行为面试题
exports.getBehavioralQuestions = async (req, res) => {
  try {
    const { difficulty } = req.query;
    let ref = db.collection('behavioral-questions');
    if (difficulty) {
      ref = ref.where('difficulty', '==', difficulty);
    }
    const snapshot = await ref.get();
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch behavioral questions', details: err.message });
  }
};

// AI生成题目
exports.generateQuestion = async (req, res) => {
  try {
    const { type, difficulty } = req.body;
    if (!type || !['coding', 'system-design', 'behavioral'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    let question;
    if (type === 'coding') {
      question = await generateCodingQuestion(difficulty);
    } else if (type === 'system-design') {
      question = await generateSystemDesignQuestion(difficulty);
    } else if (type === 'behavioral') {
      question = await generateBehavioralQuestion(difficulty);
    }
    res.json({ question });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate question', details: err.message });
  }
}; 