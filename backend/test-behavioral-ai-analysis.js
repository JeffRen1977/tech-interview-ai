const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3000/api';

async function testBehavioralAIAnalysis() {
    console.log('🧪 Testing Behavioral AI Analysis with Real Questions...\n');

    let token = null;

    try {
        // 步骤1: 登录获取token
        console.log('1. Logging in to get authentication token...');
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        if (!loginResponse.ok) {
            console.log('   Login failed, trying to register...');
            const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123',
                    name: 'Test User'
                })
            });

            if (!registerResponse.ok) {
                const errorText = await registerResponse.text();
                throw new Error(`Registration failed: ${registerResponse.status} - ${errorText}`);
            }

            const registerData = await registerResponse.json();
            token = registerData.token;
            console.log('   ✅ Registration successful, got token');
        } else {
            const loginData = await loginResponse.json();
            token = loginData.token;
            console.log('   ✅ Login successful, got token');
        }

        // 步骤2: 测试不同题目的AI分析
        const testCases = [
            {
                questionId: 'demonstrating-leadership',
                question: 'Describe a situation where you showed leadership or ownership.',
                userAnswer: 'I was working on a project where our team was falling behind schedule. I took the initiative to organize daily stand-up meetings and created a detailed project timeline. I also identified bottlenecks and worked with team members to resolve them. As a result, we completed the project on time and received positive feedback from the client.'
            },
            {
                questionId: 'handling-technical-challenges',
                question: 'Give an example of an interesting technical problem you\'ve solved.',
                userAnswer: 'I encountered a performance issue where our application was taking too long to load data. I analyzed the database queries and found that we were making too many individual requests. I implemented connection pooling and optimized the queries to use batch operations. This reduced the loading time from 30 seconds to 3 seconds.'
            },
            {
                questionId: 'interpersonal-challenges',
                question: 'Tell me about a time you overcame an interpersonal challenge with a colleague.',
                userAnswer: 'I had a colleague who was very critical of my work and it was affecting our collaboration. Instead of avoiding the situation, I scheduled a one-on-one meeting to understand their perspective. I learned they were under pressure from their own deadlines. We agreed on better communication protocols and now we work together effectively.'
            }
        ];

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            console.log(`\n${i + 2}. Testing AI analysis for: "${testCase.question}"`);
            
            const analyzeResponse = await fetch(`${BASE_URL}/behavioral/analyze`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    questionId: testCase.questionId,
                    userAnswer: testCase.userAnswer,
                    question: testCase.question
                })
            });

            console.log(`   Status: ${analyzeResponse.status}`);
            const responseText = await analyzeResponse.text();
            
            if (analyzeResponse.ok) {
                const responseData = JSON.parse(responseText);
                console.log(`   ✅ Analysis successful`);
                console.log(`   Success: ${responseData.success}`);
                console.log(`   Analysis length: ${responseData.message.length} characters`);
                console.log(`   Preview: ${responseData.message.substring(0, 150)}...`);
            } else {
                console.log(`   ❌ Analysis failed: ${responseText}`);
            }
        }

        console.log('\n🎉 All behavioral AI analysis tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            const errorText = await error.response.text();
            console.error('Response:', errorText);
        }
    }
}

testBehavioralAIAnalysis(); 