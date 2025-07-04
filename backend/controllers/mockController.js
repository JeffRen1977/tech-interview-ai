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
    const { type, difficulty, saveToDatabase = false } = req.body;
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

    // 如果请求保存到数据库
    if (saveToDatabase) {
      try {
        let collectionName;
        let formattedQuestion;

        switch (type) {
          case 'coding':
            collectionName = 'coding-ai-questions';
            formattedQuestion = {
              title: question.title,
              description: question.description,
              example: question.example,
              solution: question.solution,
              explanation: question.explanation,
              testCases: question.testCases,
              complexity: question.complexity,
              dataStructures: question.dataStructures || [],
              algorithms: question.algorithms || [],
              difficulty: question.difficulty,
              createdAt: new Date(),
              source: 'ai-generated'
            };
            break;
          
          case 'system-design':
            collectionName = 'system-design-ai-questions';
            formattedQuestion = {
              title: question.title,
              description: question.description,
              category: question.category,
              detailedAnswer: question.detailedAnswer,
              tags: question.tags || [],
              difficulty: question.difficulty,
              createdAt: new Date(),
              source: 'ai-generated'
            };
            break;
          
          case 'behavioral':
            collectionName = 'behavioral-ai-questions';
            formattedQuestion = {
              title: question.title,
              prompt: question.prompt,
              category: question.category,
              sampleAnswer: question.sampleAnswer,
              difficulty: question.difficulty,
              createdAt: new Date(),
              source: 'ai-generated'
            };
            break;
        }

        const docRef = await db.collection(collectionName).add(formattedQuestion);
        question.id = docRef.id;
        question.savedToDatabase = true;
        question.collectionName = collectionName;
      } catch (saveError) {
        console.error('Error saving AI question to database:', saveError);
        // 即使保存失败，也返回生成的题目
        question.saveError = saveError.message;
      }
    }

    res.json({ question });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate question', details: err.message });
  }
};

// 获取AI生成的编程题
exports.getAICodingQuestions = async (req, res) => {
  try {
    const { difficulty } = req.query;
    let ref = db.collection('coding-ai-questions');
    if (difficulty && difficulty !== 'all') {
      let formattedDifficulty;
      if (difficulty === 'easy') {
        formattedDifficulty = 'Easy';
      } else if (difficulty === 'medium') {
        formattedDifficulty = 'Medium';
      } else if (difficulty === 'hard') {
        formattedDifficulty = 'Hard';
      } else {
        formattedDifficulty = difficulty;
      }
      ref = ref.where('difficulty', '==', formattedDifficulty);
    }
    const snapshot = await ref.get();
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch AI coding questions', details: err.message });
  }
};

// 获取AI生成的系统设计题
exports.getAISystemDesignQuestions = async (req, res) => {
  try {
    const { difficulty } = req.query;
    let ref = db.collection('system-design-ai-questions');
    if (difficulty && difficulty !== 'all') {
      let formattedDifficulty;
      if (difficulty === 'easy') {
        formattedDifficulty = '入门';
      } else if (difficulty === 'medium') {
        formattedDifficulty = '中等';
      } else if (difficulty === 'hard') {
        formattedDifficulty = '困难';
      } else {
        formattedDifficulty = difficulty;
      }
      ref = ref.where('difficulty', '==', formattedDifficulty);
    }
    const snapshot = await ref.get();
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch AI system design questions', details: err.message });
  }
};

// 获取AI生成的行为面试题
exports.getAIBehavioralQuestions = async (req, res) => {
  try {
    const { difficulty } = req.query;
    let ref = db.collection('behavioral-ai-questions');
    if (difficulty && difficulty !== 'all') {
      ref = ref.where('difficulty', '==', difficulty);
    }
    const snapshot = await ref.get();
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch AI behavioral questions', details: err.message });
  }
}; 

// 保存模拟面试结果到用户面试历史
exports.saveMockInterviewResult = async (req, res) => {
  try {
    const { 
      questionId, 
      questionData, 
      userSolution, 
      feedback, 
      interviewType, 
      timeSpent = 0,
      completedAt 
    } = req.body;
    
    const userId = req.user.email; // 使用email作为用户标识符
    const userEmail = req.user.email;
    
    if (!questionId || !questionData || !userSolution || !feedback || !interviewType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 清理questionData，移除undefined值
    const cleanQuestionData = {};
    if (questionData && typeof questionData === 'object') {
      Object.keys(questionData).forEach(key => {
        if (questionData[key] !== undefined) {
          cleanQuestionData[key] = questionData[key];
        }
      });
    }

    // 清理feedback，移除undefined值
    let cleanFeedback = {};
    if (feedback && typeof feedback === 'object') {
      Object.keys(feedback).forEach(key => {
        if (feedback[key] !== undefined) {
          if (key === 'complexity' && typeof feedback[key] === 'object') {
            cleanFeedback[key] = {
              time: feedback[key].time || '',
              space: feedback[key].space || ''
            };
          } else if (key === 'testResults' && typeof feedback[key] === 'object') {
            cleanFeedback[key] = {
              passed: Boolean(feedback[key].passed),
              summary: feedback[key].summary || ''
            };
          } else {
            cleanFeedback[key] = feedback[key];
          }
        }
      });
    }

    const interviewHistoryData = {
      sessionId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      interviewType: interviewType,
      userEmail: userEmail,
      questionData: cleanQuestionData,
      userSolutions: [{
        solution: userSolution,
        feedback: cleanFeedback,
        timeSpent: timeSpent,
        timestamp: new Date()
      }],
      feedback: [cleanFeedback],
      startTime: completedAt ? new Date(completedAt) : new Date(),
      endTime: new Date(),
      timeSpent: timeSpent,
      topic: cleanQuestionData.topic || cleanQuestionData.category || 'general',
      difficulty: cleanQuestionData.difficulty || 'medium',
      finalReport: {
        overallScore: cleanFeedback.score || 0,
        strengths: cleanFeedback.strengths || [],
        areasForImprovement: cleanFeedback.areasForImprovement || [],
        recommendations: cleanFeedback.recommendations || [],
        finalAssessment: cleanFeedback.aiAnalysis || cleanFeedback.message || '',
        hiringRecommendation: 'mock_interview'
      }
    };

    console.log('Saving mock interview result to user-interview-history:', {
      sessionId: interviewHistoryData.sessionId,
      interviewType: interviewHistoryData.interviewType,
      questionDataKeys: Object.keys(interviewHistoryData.questionData),
      userSolutionLength: typeof userSolution === 'string' ? userSolution.length : 'object',
      feedbackKeys: Object.keys(interviewHistoryData.feedback[0]),
      timeSpent: interviewHistoryData.timeSpent
    });

    const docRef = await db.collection('user-interview-history').add(interviewHistoryData);
    
    res.status(200).json({ 
      message: "Mock interview result saved to interview history successfully.",
      historyId: docRef.id,
      sessionId: interviewHistoryData.sessionId
    });
  } catch (error) {
    console.error("Error saving mock interview result:", error);
    res.status(500).json({ message: "Failed to save mock interview result." });
  }
}; 