const { getDb } = require('../config/firebase');
const { callGeminiAPI } = require('../utils/geminiService');

// 从questionController复制extractJson函数
function extractJson(text) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return jsonMatch[0];
        } catch (error) {
            console.error('Error parsing JSON:', error);
            throw new Error('Failed to parse AI response');
        }
    }
    throw new Error('No JSON found in AI response');
}

// 获取所有系统设计问题
const getAllQuestions = async (req, res) => {
    try {
        const questionsRef = getDb().collection('system-design-questions');
        const snapshot = await questionsRef.get();
        
        const questions = [];
        snapshot.forEach(doc => {
            questions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        res.json({ questions });
    } catch (error) {
        console.error('Error getting system design questions:', error);
        res.status(500).json({ error: 'Failed to get system design questions' });
    }
};

// 获取筛选后的系统设计问题
const getFilteredQuestions = async (req, res) => {
    try {
        const { difficulty, category } = req.query;
        
        let questionsRef = getDb().collection('system-design-questions');
        
        // 应用筛选条件
        if (difficulty) {
            questionsRef = questionsRef.where('difficulty', '==', difficulty);
        }
        
        if (category) {
            questionsRef = questionsRef.where('category', '==', category);
        }
        
        const snapshot = await questionsRef.get();
        
        const questions = [];
        snapshot.forEach(doc => {
            questions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        res.json({ questions });
    } catch (error) {
        console.error('Error getting filtered system design questions:', error);
        res.status(500).json({ error: 'Failed to get filtered system design questions' });
    }
};

// 根据ID获取特定系统设计问题
const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const questionDoc = await getDb().collection('system-design-questions').doc(id).get();
        
        if (!questionDoc.exists) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        const question = {
            id: questionDoc.id,
            ...questionDoc.data()
        };
        
        res.json({ question });
    } catch (error) {
        console.error('Error getting system design question by ID:', error);
        res.status(500).json({ error: 'Failed to get system design question' });
    }
};

// 保存系统设计问题到用户学习历史
const saveToLearningHistory = async (req, res) => {
    const { questionId, completedAt } = req.body;
    const userId = req.user.userId; // 从认证中间件获取用户ID
    
    if (!questionId) {
        return res.status(400).json({ message: "Question ID is required." });
    }

    try {
        // 获取题目详情
        const questionDoc = await getDb().collection('system-design-questions').doc(questionId).get();
        if (!questionDoc.exists) {
            return res.status(404).json({ message: "Question not found." });
        }
        
        const questionData = questionDoc.data();
        
        const historyData = {
            userId,
            questionId,
            questionData: {
                title: questionData.title,
                description: questionData.description,
                category: questionData.category,
                difficulty: questionData.difficulty,
                answer: questionData.answer,
                design_steps: questionData.design_steps || []
            },
            completedAt: completedAt ? new Date(completedAt) : new Date(),
            savedAt: new Date(),
            interviewType: 'system-design'
        };

        const docRef = await getDb().collection('user-learning-history').add(historyData);
        res.status(200).json({ 
            message: "System design question saved to learning history successfully.",
            historyId: docRef.id 
        });
    } catch (error) {
        console.error("Error saving to learning history:", error);
        res.status(500).json({ message: "Failed to save to learning history." });
    }
};

// 分析系统设计解答（用于模拟面试）
const analyzeSystemDesignSolution = async (req, res) => {
    const { questionData, whiteboardData, voiceInput, timeSpent } = req.body;
    
    if (!questionData || (!whiteboardData && !voiceInput)) {
        return res.status(400).json({ message: "Question data and solution are required." });
    }

    try {
        // 构建分析提示
        const analysisPrompt = `
你是一个资深的系统设计面试官。请分析以下系统设计解答：

题目：${questionData.title || 'System Design Question'}
描述：${questionData.description || ''}
难度：${questionData.difficulty || 'medium'}
主题：${questionData.topic || 'general'}

用户解答：
${voiceInput ? `语音输入：${voiceInput}` : ''}
${whiteboardData && whiteboardData.length > 0 ? `白板数据：包含${whiteboardData.length}个绘制元素` : ''}
用时：${timeSpent || 0}秒

请提供详细的系统设计评估，包括：

1. 架构设计的合理性
2. 技术选择的适当性
3. 可扩展性考虑
4. 性能优化
5. 可靠性设计
6. 安全性考虑
7. 成本效益分析

请以JSON格式返回评估结果：
{
  "overallScore": 85,
  "categoryScores": {
    "architecture": 85,
    "scalability": 80,
    "performance": 85,
    "reliability": 80,
    "security": 75,
    "costEfficiency": 85
  },
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areasForImprovement": ["Area 1", "Area 2", "Area 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "finalAssessment": "Overall assessment of the system design",
  "nextSteps": "Suggested next steps for improvement",
  "hiringRecommendation": "strong_yes/yes/maybe/no",
  "technicalEvaluation": "Detailed technical evaluation",
  "architectureEvaluation": "Detailed architecture evaluation"
}
        `;

        const geminiData = await callGeminiAPI(analysisPrompt);
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const feedback = JSON.parse(jsonText);

        res.status(200).json({ 
            feedback,
            message: 'System design analysis completed successfully'
        });
    } catch (error) {
        console.error("Error analyzing system design solution:", error);
        res.status(500).json({ message: `Failed to analyze solution: ${error.message}` });
    }
};

module.exports = {
    getAllQuestions,
    getFilteredQuestions,
    getQuestionById,
    saveToLearningHistory,
    analyzeSystemDesignSolution
}; 