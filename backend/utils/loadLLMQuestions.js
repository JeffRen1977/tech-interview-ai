const { getDb } = require('../config/firebase');
const fs = require('fs');
const path = require('path');

// 读取LLM题目数据
const loadLLMQuestions = async (clearExisting = false) => {
    try {
        const db = getDb();
        const collectionRef = db.collection('llm-questions');
        
        // 如果需要清除现有数据
        if (clearExisting) {
            console.log('Clearing existing LLM questions...');
            const snapshot = await collectionRef.get();
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log('Existing LLM questions cleared.');
        }
        
        // 读取JSON文件
        const jsonPath = path.join(__dirname, '../../doc/llm_questions.json');
        const questionsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        console.log(`Loading ${questionsData.length} LLM questions...`);
        
        // 批量写入数据
        const batch = db.batch();
        questionsData.forEach(question => {
            const docId = question.id || question.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const docRef = collectionRef.doc(docId);
            
            // 添加时间戳
            const questionWithTimestamp = {
                ...question,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            batch.set(docRef, questionWithTimestamp);
        });
        
        await batch.commit();
        console.log('LLM questions loaded successfully!');
        
        return questionsData.length;
    } catch (error) {
        console.error('Error loading LLM questions:', error);
        throw error;
    }
};

// 验证加载的题目
const verifyLLMQuestions = async () => {
    try {
        const db = getDb();
        const snapshot = await db.collection('llm-questions').get();
        
        console.log(`Found ${snapshot.size} LLM questions in database:`);
        
        const categories = {};
        const difficulties = {};
        
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`- ${data.title} (${data.category}, ${data.difficulty})`);
            
            // 统计分类
            categories[data.category] = (categories[data.category] || 0) + 1;
            difficulties[data.difficulty] = (difficulties[data.difficulty] || 0) + 1;
        });
        
        console.log('\nCategory distribution:');
        Object.entries(categories).forEach(([category, count]) => {
            console.log(`  ${category}: ${count} questions`);
        });
        
        console.log('\nDifficulty distribution:');
        Object.entries(difficulties).forEach(([difficulty, count]) => {
            console.log(`  ${difficulty}: ${count} questions`);
        });
        
    } catch (error) {
        console.error('Error verifying LLM questions:', error);
        throw error;
    }
};

// 主函数
const main = async () => {
    const args = process.argv.slice(2);
    const shouldClear = args.includes('--clear') || args.includes('-c');
    
    try {
        const count = await loadLLMQuestions(shouldClear);
        console.log(`\nSuccessfully loaded ${count} LLM questions.`);
        
        // 验证加载结果
        await verifyLLMQuestions();
        
    } catch (error) {
        console.error('Failed to load LLM questions:', error);
        process.exit(1);
    }
};

// 如果直接运行此文件
if (require.main === module) {
    main();
}

module.exports = {
    loadLLMQuestions,
    verifyLLMQuestions
}; 