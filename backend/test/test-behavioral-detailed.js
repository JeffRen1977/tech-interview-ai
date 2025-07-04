const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3000/api';

async function testBehavioralAnalyzeDetailed() {
    console.log('🧪 Testing Behavioral Analyze API (Detailed)...\n');

    try {
        // 测试1: 不带认证的分析请求
        console.log('1. Testing behavioral analysis WITHOUT authentication...');
        const analyzeResponse1 = await fetch(`${BASE_URL}/behavioral/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionId: 'test-question-1',
                userAnswer: 'I would like to share a situation where I had to lead a team through a challenging project.',
                question: 'Tell me about a time when you had to lead a team through a difficult project.'
            })
        });

        console.log(`   Status: ${analyzeResponse1.status}`);
        const responseText1 = await analyzeResponse1.text();
        console.log(`   Response: ${responseText1}\n`);

        // 测试2: 检查认证中间件是否正确工作
        console.log('2. Testing authentication middleware...');
        const authResponse = await fetch(`${BASE_URL}/auth/me`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        console.log(`   Auth Status: ${authResponse.status}`);
        const authText = await authResponse.text();
        console.log(`   Auth Response: ${authText}\n`);

        // 测试3: 检查行为面试问题获取
        console.log('3. Testing behavioral questions endpoint...');
        const questionsResponse = await fetch(`${BASE_URL}/behavioral/questions`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        console.log(`   Questions Status: ${questionsResponse.status}`);
        const questionsText = await questionsResponse.text();
        console.log(`   Questions Response: ${questionsText.substring(0, 200)}...\n`);

        console.log('🎉 Detailed test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            const errorText = await error.response.text();
            console.error('Response:', errorText);
        }
    }
}

testBehavioralAnalyzeDetailed(); 