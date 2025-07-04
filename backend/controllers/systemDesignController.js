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

module.exports = {
    getAllQuestions,
    getFilteredQuestions,
    getQuestionById
}; 