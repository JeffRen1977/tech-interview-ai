const admin = require('firebase-admin');
const db = admin.firestore();

// 导入Gemini API调用函数
const { callGeminiAPI } = require('../utils/geminiService');

// 获取所有行为面试问题
const getAllQuestions = async (req, res) => {
    try {
        const questionsRef = db.collection('behavioral-questions');
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
        console.error('Error getting behavioral questions:', error);
        res.status(500).json({ error: 'Failed to get behavioral questions' });
    }
};

// 获取筛选后的行为面试问题
const getFilteredQuestions = async (req, res) => {
    try {
        const { category } = req.query;
        
        let questionsRef = db.collection('behavioral-questions');
        
        // 应用筛选条件
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
        console.error('Error getting filtered behavioral questions:', error);
        res.status(500).json({ error: 'Failed to get filtered behavioral questions' });
    }
};

// 根据ID获取特定行为面试问题
const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const questionDoc = await db.collection('behavioral-questions').doc(id).get();
        
        if (!questionDoc.exists) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        const question = {
            id: questionDoc.id,
            ...questionDoc.data()
        };
        
        res.json({ question });
    } catch (error) {
        console.error('Error getting behavioral question by ID:', error);
        res.status(500).json({ error: 'Failed to get behavioral question' });
    }
};

// AI分析用户答案
const analyzeAnswer = async (req, res) => {
    try {
        const { questionId, userAnswer, question } = req.body;
        
        if (!userAnswer || !question) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // 调用Gemini API进行智能分析
        const analysisPrompt = `
            Act as an expert behavioral interviewer evaluating a candidate's response.
            
            Question: ${question}
            Question ID: ${questionId}
            Candidate's Answer: ${userAnswer}
            
            Please provide a comprehensive analysis of the candidate's response in Chinese, including:
            
            1. **回答结构分析**: Evaluate how well the response follows the STAR framework
            2. **优点**: Identify strengths in the response
            3. **改进建议**: Provide specific suggestions for improvement
            4. **STAR方法建议**: Give specific guidance on each STAR component
            5. **示例改进**: Provide a concrete example of how to improve the response
            6. **总体评分**: Give a score out of 100 with brief explanation
            
            Format your response as a detailed analysis with clear sections and actionable feedback.
            Focus on the specific question context and provide relevant examples.
        `;
        
        // 调用Gemini API
        const geminiData = await callGeminiAPI(analysisPrompt);
        const analysisText = geminiData.candidates[0].content.parts[0].text;
        
        const analysis = {
            success: true,
            message: analysisText
        };
        
        res.json(analysis);
    } catch (error) {
        console.error('Error analyzing behavioral answer:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to analyze answer' 
        });
    }
};

// 保存行为面试问题到用户学习历史
const saveToLearningHistory = async (req, res) => {
    const { questionId, userAnswer, feedback, completedAt } = req.body;
    const userId = req.user.userId; // 从认证中间件获取用户ID
    
    if (!questionId) {
        return res.status(400).json({ message: "Question ID is required." });
    }

    try {
        // 获取题目详情
        const questionDoc = await db.collection('behavioral-questions').doc(questionId).get();
        let questionData;
        if (questionDoc.exists) {
            questionData = questionDoc.data();
        } else {
            // 兼容AI生成的题目，直接用前端传来的字段
            questionData = req.body.questionData || {
                title: req.body.title || '',
                prompt: req.body.prompt || '',
                category: req.body.category || '',
                difficulty: req.body.difficulty || '',
                sampleAnswer: req.body.sampleAnswer || ''
            };
        }
        
        // 处理feedback字段，限制长度避免Firestore限制
        let processedFeedback = feedback;
        if (feedback && typeof feedback === 'object' && feedback.message) {
            // 如果feedback.message太长，截断它
            if (feedback.message.length > 10000) {
                processedFeedback = {
                    ...feedback,
                    message: feedback.message.substring(0, 10000) + '... (truncated)'
                };
            }
        }
        
        const historyData = {
            userId,
            questionId,
            questionData: {
                title: questionData.title || '',
                prompt: questionData.prompt || '',
                category: questionData.category || '',
                difficulty: questionData.difficulty || '',
                sampleAnswer: questionData.sampleAnswer || ''
            },
            userAnswer: userAnswer || '',
            feedback: processedFeedback && processedFeedback.message ? processedFeedback.message : null,
            completedAt: completedAt ? new Date(completedAt) : new Date(),
            savedAt: new Date(),
            interviewType: 'behavioral'
        };

        console.log('Saving behavioral history with data:', {
            userId,
            questionId,
            questionDataKeys: Object.keys(historyData.questionData),
            userAnswerLength: historyData.userAnswer.length,
            feedbackType: typeof historyData.feedback,
            feedbackKeys: historyData.feedback ? Object.keys(historyData.feedback) : null
        });

        const docRef = await db.collection('user-learning-history').add(historyData);
        res.status(200).json({ 
            message: "Behavioral question saved to learning history successfully.",
            historyId: docRef.id 
        });
    } catch (error) {
        console.error("Error saving to learning history:", error);
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({ message: "Failed to save to learning history." });
    }
};

module.exports = {
    getAllQuestions,
    getFilteredQuestions,
    getQuestionById,
    analyzeAnswer,
    saveToLearningHistory
}; 