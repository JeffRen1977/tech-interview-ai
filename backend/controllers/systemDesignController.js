const admin = require('firebase-admin');
const db = admin.firestore();

// 获取所有系统设计问题
const getAllQuestions = async (req, res) => {
    try {
        const questionsRef = db.collection('system-design-questions');
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
        
        let questionsRef = db.collection('system-design-questions');
        
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
        
        const questionDoc = await db.collection('system-design-questions').doc(id).get();
        
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
        const questionDoc = await db.collection('system-design-questions').doc(questionId).get();
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

        const docRef = await db.collection('user-learning-history').add(historyData);
        res.status(200).json({ 
            message: "System design question saved to learning history successfully.",
            historyId: docRef.id 
        });
    } catch (error) {
        console.error("Error saving to learning history:", error);
        res.status(500).json({ message: "Failed to save to learning history." });
    }
};

module.exports = {
    getAllQuestions,
    getFilteredQuestions,
    getQuestionById,
    saveToLearningHistory
}; 