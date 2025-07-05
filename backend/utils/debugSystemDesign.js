// 使用现有的Firebase配置
const { getDb } = require('../config/firebase');

const debugSystemDesignQuestions = async () => {
    try {
        console.log('正在检查系统设计题目数据结构...');
        
        const questionsRef = getDb().collection('system-design-questions');
        const snapshot = await questionsRef.get();
        
        console.log(`找到 ${snapshot.size} 个系统设计题目`);
        
        let count = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            count++;
            
            console.log(`\n题目 ${count}:`);
            console.log(`ID: ${doc.id}`);
            console.log(`标题: ${data.title || 'N/A'}`);
            console.log(`难度: "${data.difficulty}" (类型: ${typeof data.difficulty})`);
            console.log(`难度字段存在: ${data.hasOwnProperty('difficulty')}`);
            console.log(`所有字段:`, Object.keys(data));
            
            if (count >= 5) {
                console.log('\n只显示前5个题目作为示例...');
                return;
            }
        });
        
    } catch (error) {
        console.error('Error debugging system design questions:', error);
    }
};

// 如果直接运行此脚本
if (require.main === module) {
    debugSystemDesignQuestions().then(() => {
        console.log('调试完成');
        process.exit(0);
    }).catch(error => {
        console.error('调试失败:', error);
        process.exit(1);
    });
}

module.exports = { debugSystemDesignQuestions }; 