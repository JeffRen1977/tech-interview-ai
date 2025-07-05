const admin = require('firebase-admin');
const serviceAccount = require('./config/firebase.js');

// 初始化 Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkWrongQuestionsData() {
    try {
        // 测试用户ID - 请替换为实际的用户ID
        const userId = 'JU1R6UyI41cVFYBWXVuUAmURxO63';
        
        console.log(`检查用户 ${userId} 的错题本数据...\n`);
        
        // 检查 user-learning-history 集合
        console.log('=== 检查 user-learning-history 集合 ===');
        const learningHistorySnapshot = await db.collection('user-learning-history')
            .where('userId', '==', userId)
            .get();
        
        console.log(`user-learning-history 中有 ${learningHistorySnapshot.size} 条记录`);
        
        learningHistorySnapshot.forEach((doc, index) => {
            const data = doc.data();
            console.log(`${index + 1}. ID: ${doc.id}`);
            console.log(`   面试类型: ${data.interviewType || 'unknown'}`);
            console.log(`   问题ID: ${data.questionId || 'N/A'}`);
            console.log(`   完成时间: ${JSON.stringify(data.completedAt)}`);
            console.log(`   保存时间: ${JSON.stringify(data.savedAt)}`);
            console.log(`   用户答案长度: ${(data.userAnswer || data.userCode || '').length}`);
            console.log(`   反馈类型: ${typeof data.feedback}`);
            console.log(`   完整数据:`, JSON.stringify(data, null, 2));
            console.log('');
        });
        
        // 检查 user-interview-history 集合
        console.log('=== 检查 user-interview-history 集合 ===');
        const interviewHistorySnapshot = await db.collection('user-interview-history')
            .where('userId', '==', userId)
            .get();
        
        console.log(`user-interview-history 中有 ${interviewHistorySnapshot.size} 条记录`);
        
        interviewHistorySnapshot.forEach((doc, index) => {
            const data = doc.data();
            console.log(`${index + 1}. ID: ${doc.id}`);
            console.log(`   面试类型: ${data.interviewType || 'unknown'}`);
            console.log(`   结束时间: ${JSON.stringify(data.endTime)}`);
            console.log(`   用户解决方案数量: ${data.userSolutions ? data.userSolutions.length : 0}`);
            console.log(`   完整数据:`, JSON.stringify(data, null, 2));
            
            if (data.userSolutions && data.userSolutions.length > 0) {
                data.userSolutions.forEach((solution, solIndex) => {
                    console.log(`   - 解决方案 ${solIndex + 1}:`);
                    console.log(`     答案长度: ${(solution.solution || '').length}`);
                    console.log(`     时间戳: ${JSON.stringify(solution.timestamp)}`);
                    console.log(`     反馈类型: ${typeof solution.feedback}`);
                });
            }
            console.log('');
        });
        
        // 模拟 getWrongQuestions 函数的逻辑
        console.log('=== 模拟错题本数据处理 ===');
        const wrongQuestions = [];
        
        // 处理学习历史数据
        learningHistorySnapshot.forEach(doc => {
            const data = doc.data();
            wrongQuestions.push({
                id: doc.id,
                type: 'learning',
                interviewType: data.interviewType || 'unknown',
                questionData: data.questionData || {},
                userAnswer: data.userAnswer || data.userCode || '',
                feedback: data.feedback || {},
                completedAt: data.completedAt,
                savedAt: data.savedAt
            });
        });
        
        // 处理面试历史数据
        interviewHistorySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.userSolutions && data.userSolutions.length > 0) {
                data.userSolutions.forEach((solution, index) => {
                    wrongQuestions.push({
                        id: `${doc.id}_${index}`,
                        type: 'interview',
                        interviewType: data.interviewType || 'unknown',
                        questionData: data.questionData || {},
                        userAnswer: solution.solution || '',
                        feedback: solution.feedback || {},
                        completedAt: solution.timestamp || data.endTime,
                        savedAt: data.endTime
                    });
                });
            }
        });
        
        // 按完成时间排序
        wrongQuestions.sort((a, b) => {
            const dateA = new Date(a.completedAt);
            const dateB = new Date(b.completedAt);
            return dateB - dateA;
        });
        
        console.log(`最终错题本中有 ${wrongQuestions.length} 条记录`);
        
        wrongQuestions.forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id}`);
            console.log(`   类型: ${item.type}`);
            console.log(`   面试类型: ${item.interviewType}`);
            console.log(`   完成时间: ${JSON.stringify(item.completedAt)}`);
            console.log(`   答案长度: ${item.userAnswer.length}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('检查错题本数据时出错:', error);
    }
}

// 运行检查
checkWrongQuestionsData().then(() => {
    console.log('检查完成');
    process.exit(0);
}).catch(error => {
    console.error('脚本执行失败:', error);
    process.exit(1);
}); 