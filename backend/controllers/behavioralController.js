const admin = require('firebase-admin');
const db = admin.firestore();

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
        
        // 这里可以集成AI分析逻辑
        // 目前返回模拟的AI分析结果
        const analysis = {
            success: true,
            message: `基于你的回答，我提供以下反馈和建议：

**回答结构分析：**
你的回答展现了良好的思考过程，但可以在以下几个方面进行改进：

**优点：**
- 回答逻辑清晰
- 包含了具体的例子
- 体现了问题解决能力

**改进建议：**
1. 可以更详细地描述具体的行动步骤
2. 建议增加量化的结果
3. 可以补充一些反思和学习经验

**STAR方法建议：**
- Situation: 更清晰地描述背景情况
- Task: 明确说明你的任务和责任
- Action: 详细描述你采取的具体行动
- Result: 强调可量化的结果和影响

**示例改进：**
"我通过制定详细的项目计划，与团队密切协作，最终在预期时间内完成了项目，客户满意度达到95%。"

继续练习，你的回答会越来越出色！`
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

module.exports = {
    getAllQuestions,
    getFilteredQuestions,
    getQuestionById,
    analyzeAnswer
}; 