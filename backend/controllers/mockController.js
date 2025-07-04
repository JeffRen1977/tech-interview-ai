const { db } = require('../config/firebase');
const { generateCodingQuestion, generateSystemDesignQuestion, generateBehavioralQuestion } = require('../utils/geminiService');

// 获取编程题
exports.getCodingQuestions = async (req, res) => {
  try {
    const { difficulty } = req.query;
    let ref = db.collection('coding-questions');
    if (difficulty && difficulty !== 'all') {
      // 处理不同格式的难度标签
      let formattedDifficulty;
      if (difficulty === 'easy') {
        formattedDifficulty = 'Easy';
      } else if (difficulty === 'medium') {
        formattedDifficulty = 'Medium';
      } else if (difficulty === 'hard') {
        formattedDifficulty = 'Hard';
      } else {
        // 对于中文难度标签，保持原样
        formattedDifficulty = difficulty;
      }
      ref = ref.where('difficulty', '==', formattedDifficulty);
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
    if (difficulty && difficulty !== 'all') {
      // 处理不同格式的难度标签
      let formattedDifficulty;
      if (difficulty === 'easy') {
        formattedDifficulty = '入门';
      } else if (difficulty === 'medium') {
        formattedDifficulty = '中等';
      } else if (difficulty === 'hard') {
        formattedDifficulty = '困难';
      } else {
        // 对于中文难度标签，保持原样
        formattedDifficulty = difficulty;
      }
      ref = ref.where('difficulty', '==', formattedDifficulty);
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
    // 行为面试题目没有难度字段，所以不进行难度过滤
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