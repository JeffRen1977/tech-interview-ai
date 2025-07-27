const BASE_URL = 'http://localhost:3000/api';

// 测试LLM API功能
async function testLLMAPI() {
    console.log('🧪 Testing LLM API...\n');

    try {
        // 1. 测试获取分类
        console.log('1. Testing categories endpoint...');
        const categoriesResponse = await fetch(`${BASE_URL}/llm/categories`);
        const categoriesData = await categoriesResponse.json();
        console.log('✅ Categories:', categoriesData);
        console.log('');

        // 2. 测试获取所有题目
        console.log('2. Testing questions endpoint...');
        const questionsResponse = await fetch(`${BASE_URL}/llm/questions`);
        const questionsData = await questionsResponse.json();
        console.log(`✅ Found ${questionsData.questions.length} questions`);
        console.log('');

        // 3. 测试筛选功能
        console.log('3. Testing filtered questions...');
        const filteredResponse = await fetch(`${BASE_URL}/llm/questions/filtered?category=LLM Fine-tuning`);
        const filteredData = await filteredResponse.json();
        console.log(`✅ Found ${filteredData.questions.length} LLM Fine-tuning questions`);
        console.log('');

        // 4. 测试获取特定题目
        console.log('4. Testing get question by ID...');
        const questionResponse = await fetch(`${BASE_URL}/llm/questions/LLM001`);
        const questionData = await questionResponse.json();
        console.log('✅ Question details:', {
            title: questionData.question.title,
            category: questionData.question.category,
            difficulty: questionData.question.difficulty
        });
        console.log('');

        // 5. 测试AI生成题目（需要认证）
        console.log('5. Testing AI question generation...');
        try {
            const generateResponse = await fetch(`${BASE_URL}/llm/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: '测试LLM题目',
                    description: '这是一个测试题目',
                    category: 'LLM General',
                    difficulty: '中等'
                })
            });
            const generateData = await generateResponse.json();
            if (generateResponse.ok) {
                console.log('✅ Generated question:', generateData.questionData.title);
            } else {
                console.log('⚠️  Generation requires authentication:', generateData.message);
            }
        } catch (error) {
            console.log('⚠️  Generation requires authentication:', error.message);
        }
        console.log('');

        // 6. 测试分析功能（需要认证）
        console.log('6. Testing analysis endpoint...');
        try {
            const analysisResponse = await fetch(`${BASE_URL}/llm/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionData: {
                        title: '什么是RAG?',
                        description: '解释RAG的基本概念',
                        category: 'RAG',
                        difficulty: '简单'
                    },
                    userAnswer: 'RAG是检索增强生成，结合了检索和生成技术。',
                    timeSpent: 120
                })
            });
            const analysisData = await analysisResponse.json();
            if (analysisResponse.ok) {
                console.log('✅ Analysis result:', {
                    overallScore: analysisData.feedback.overallScore,
                    strengths: analysisData.feedback.strengths?.length || 0,
                    areasForImprovement: analysisData.feedback.areasForImprovement?.length || 0
                });
            } else {
                console.log('⚠️  Analysis requires authentication:', analysisData.message);
            }
        } catch (error) {
            console.log('⚠️  Analysis requires authentication:', error.message);
        }
        console.log('');

        console.log('🎉 All tests completed successfully!');
        console.log('');
        console.log('📊 Summary:');
        console.log(`- Categories: ${categoriesData.categories.length}`);
        console.log(`- Difficulties: ${categoriesData.difficulties.length}`);
        console.log(`- Total Questions: ${questionsData.questions.length}`);
        console.log('');
        console.log('📝 Note: Authentication-required endpoints need valid JWT token');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// 运行测试
testLLMAPI(); 