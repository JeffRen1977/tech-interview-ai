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

// 获取所有LLM问题
const getAllQuestions = async (req, res) => {
    try {
        const questionsRef = getDb().collection('llm-questions');
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
        console.error('Error getting LLM questions:', error);
        res.status(500).json({ error: 'Failed to get LLM questions' });
    }
};

// 获取筛选后的LLM问题
const getFilteredQuestions = async (req, res) => {
    try {
        const { difficulty, category } = req.query;
        
        let questionsRef = getDb().collection('llm-questions');
        
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
        console.error('Error getting filtered LLM questions:', error);
        res.status(500).json({ error: 'Failed to get filtered LLM questions' });
    }
};

// 根据ID获取特定LLM问题
const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const questionDoc = await getDb().collection('llm-questions').doc(id).get();
        
        if (!questionDoc.exists) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        const question = {
            id: questionDoc.id,
            ...questionDoc.data()
        };
        
        res.json({ question });
    } catch (error) {
        console.error('Error getting LLM question by ID:', error);
        res.status(500).json({ error: 'Failed to get LLM question' });
    }
};

// 生成LLM问题
const generateLLMQuestion = async (req, res) => {
    const { title, description, category, difficulty } = req.body;
    
    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }
    
    const prompt = `
        Act as an expert in Large Language Models (LLMs). Based on the following LLM topic, provide a detailed interview question and comprehensive answer.
        
        Topic Title: "${title}"
        Description: "${description}"
        Category: "${category || 'LLM General'}"
        Difficulty: "${difficulty || 'medium'}"
        
        Please provide the output in a single, clean JSON object format:
        {
          "title": "${title}",
          "englishTitle": "English translation of the title",
          "description": "${description}",
          "category": "${category || 'LLM General'}",
          "difficulty": "${difficulty || 'medium'}",
          "detailedAnswer": "Comprehensive technical answer with detailed explanations, implementation steps, and best practices",
          "tags": ["tag1", "tag2", "tag3"],
          "designSteps": ["Step 1", "Step 2", "Step 3"],
          "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
        }
        
        The answer should be comprehensive and include:
        1. Technical concepts and principles
        2. Implementation approaches and strategies
        3. Best practices and optimization techniques
        4. Common challenges and solutions
        5. Real-world applications and examples
    `;

    try {
        const geminiData = await callGeminiAPI(prompt);
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const questionData = JSON.parse(jsonText);
        res.status(200).json({ questionData });
    } catch (error) {
        console.error("Error generating LLM question:", error);
        res.status(500).json({ message: `Failed to generate question: ${error.message}` });
    }
};

// 保存LLM问题
const saveLLMQuestion = async (req, res) => {
    const { questionData } = req.body;
    if (!questionData || !questionData.title) {
        return res.status(400).json({ message: 'Valid question data is required.' });
    }
    try {
        const docId = questionData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (!docId) {
            return res.status(400).json({ message: 'A valid ID could not be generated from the title.' });
        }
        
        // 添加时间戳
        const questionWithTimestamp = {
            ...questionData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        await getDb().collection('llm-questions').doc(docId).set(questionWithTimestamp);
        res.status(201).json({ message: `LLM question "${questionData.title}" saved successfully!` });
    } catch (error) {
        console.error("Error saving LLM question:", error);
        res.status(500).json({ message: 'Failed to save question to database.' });
    }
};

// 保存到学习历史
const saveToLearningHistory = async (req, res) => {
    const { questionId, completedAt } = req.body;
    const userId = req.user.userId; // 从认证中间件获取用户ID
    
    if (!questionId) {
        return res.status(400).json({ message: 'Question ID is required.' });
    }
    
    try {
        // 获取题目信息
        const questionDoc = await getDb().collection('llm-questions').doc(questionId).get();
        if (!questionDoc.exists) {
            return res.status(404).json({ message: 'Question not found.' });
        }
        
        const questionData = questionDoc.data();
        
        // 保存到用户学习历史
        const historyData = {
            userId,
            questionId,
            questionType: 'llm',
            questionData: {
                title: questionData.title,
                category: questionData.category,
                difficulty: questionData.difficulty
            },
            completedAt: completedAt || new Date(),
            createdAt: new Date()
        };
        
        const historyRef = getDb().collection('user-learning-history').doc();
        await historyRef.set(historyData);
        
        res.status(201).json({ 
            message: 'LLM question saved to learning history successfully!',
            historyId: historyRef.id
        });
    } catch (error) {
        console.error("Error saving to learning history:", error);
        res.status(500).json({ message: 'Failed to save to learning history.' });
    }
};

// 分析LLM解答
const analyzeLLMSolution = async (req, res) => {
    const { questionData, userAnswer, timeSpent } = req.body;
    
    if (!questionData || !userAnswer) {
        return res.status(400).json({ message: "Question data and user answer are required." });
    }

    try {
        // 构建分析提示
        const analysisPrompt = `
你是一个资深的LLM技术面试官。请分析以下LLM相关问题的解答：

题目：${questionData.title || 'LLM Question'}
描述：${questionData.description || ''}
难度：${questionData.difficulty || 'medium'}
分类：${questionData.category || 'LLM General'}

用户解答：
${userAnswer}
用时：${timeSpent || 0}秒

请提供详细的LLM技术评估，包括：

1. 技术理解的准确性
2. 实现方案的可行性
3. 技术深度和广度
4. 实际应用考虑
5. 优化和改进建议
6. 相关技术扩展

请以JSON格式返回评估结果：
{
  "overallScore": 85,
  "categoryScores": {
    "technicalAccuracy": 85,
    "implementationFeasibility": 80,
    "technicalDepth": 85,
    "practicalApplication": 80,
    "optimization": 85
  },
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areasForImprovement": ["Area 1", "Area 2", "Area 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "technicalFeedback": "Detailed technical feedback",
  "implementationSuggestions": "Implementation suggestions",
  "nextSteps": "Suggested next steps for improvement",
  "hiringRecommendation": "strong_yes/yes/maybe/no"
}
        `;

        const geminiData = await callGeminiAPI(analysisPrompt);
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const feedback = JSON.parse(jsonText);
        
        res.status(200).json({ feedback });
    } catch (error) {
        console.error("Error analyzing LLM solution:", error);
        res.status(500).json({ message: `Failed to analyze solution: ${error.message}` });
    }
};

// 获取LLM题目分类
const getLLMCategories = async (req, res) => {
    try {
        const questionsRef = getDb().collection('llm-questions');
        const snapshot = await questionsRef.get();
        
        const categories = new Set();
        const difficulties = new Set();
        
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.category) categories.add(data.category);
            if (data.difficulty) difficulties.add(data.difficulty);
        });
        
        res.json({ 
            categories: Array.from(categories),
            difficulties: Array.from(difficulties)
        });
    } catch (error) {
        console.error('Error getting LLM categories:', error);
        res.status(500).json({ error: 'Failed to get LLM categories' });
    }
};

module.exports = {
    getAllQuestions,
    getFilteredQuestions,
    getQuestionById,
    generateLLMQuestion,
    saveLLMQuestion,
    saveToLearningHistory,
    analyzeLLMSolution,
    getLLMCategories
}; 