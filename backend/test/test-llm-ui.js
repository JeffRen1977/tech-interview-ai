const BASE_URL = 'http://localhost:3000/api';

async function testLLMAPI() {
    console.log('🧪 Testing LLM Interview API...\n');

    try {
        // 测试获取分类
        console.log('1. Testing categories endpoint...');
        const categoriesResponse = await fetch(`${BASE_URL}/llm/categories`);
        const categoriesData = await categoriesResponse.json();
        console.log('✅ Categories:', categoriesData.categories);
        console.log('✅ Difficulties:', categoriesData.difficulties);

        // 测试获取所有题目
        console.log('\n2. Testing questions endpoint...');
        const questionsResponse = await fetch(`${BASE_URL}/llm/questions`);
        const questionsData = await questionsResponse.json();
        console.log(`✅ Found ${questionsData.questions.length} questions`);

        // 显示前3个题目的信息
        questionsData.questions.slice(0, 3).forEach((q, index) => {
            console.log(`   ${index + 1}. ${q.title} (${q.category}, ${q.difficulty})`);
        });

        // 测试筛选功能
        console.log('\n3. Testing filtered questions...');
        const filterParams = new URLSearchParams({
            category: 'RAG',
            difficulty: '简单'
        });
        const filteredResponse = await fetch(`${BASE_URL}/llm/questions/filtered?${filterParams}`);
        const filteredData = await filteredResponse.json();
        console.log(`✅ Found ${filteredData.questions.length} filtered questions`);

        // 测试获取特定题目
        if (questionsData.questions.length > 0) {
            console.log('\n4. Testing specific question...');
            const firstQuestion = questionsData.questions[0];
            const specificResponse = await fetch(`${BASE_URL}/llm/questions/${firstQuestion.id}`);
            const specificData = await specificResponse.json();
            console.log(`✅ Retrieved question: ${specificData.question.title}`);
        }

        console.log('\n🎉 All API tests passed!');
        console.log('\n📋 Summary:');
        console.log(`   - Categories: ${categoriesData.categories.length}`);
        console.log(`   - Difficulties: ${categoriesData.difficulties.length}`);
        console.log(`   - Total Questions: ${questionsData.questions.length}`);
        console.log(`   - Filtered Questions: ${filteredData.questions.length}`);

    } catch (error) {
        console.error('❌ Error testing LLM API:', error.message);
    }
}

// 运行测试
testLLMAPI(); 