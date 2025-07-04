const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3000/api';

async function testBehavioralWithAuth() {
    console.log('🧪 Testing Behavioral Analyze API with Authentication...\n');

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

        // 步骤2: 使用token进行行为面试分析
        console.log('\n2. Testing behavioral analysis WITH authentication...');
        const analyzeResponse = await fetch(`${BASE_URL}/behavioral/analyze`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                questionId: 'test-question-1',
                userAnswer: 'I would like to share a situation where I had to lead a team through a challenging project. The situation was that we were developing a new e-commerce platform with a tight deadline of 3 months, and our team was facing technical challenges with the payment integration system. As the lead developer, I was responsible for coordinating a team of 5 developers, ensuring we met the deadline while maintaining code quality and system reliability. I immediately organized daily stand-ups to track progress, implemented a code review process, and set up automated testing. I also worked closely with the payment provider to resolve integration issues and created detailed documentation for the team. We successfully delivered the project on time with 95% test coverage. The payment system processed over $1M in transactions during the first month with zero critical bugs. The team\'s morale improved significantly, and we received positive feedback from stakeholders.',
                question: 'Tell me about a time when you had to lead a team through a difficult project.'
            })
        });

        console.log(`   Status: ${analyzeResponse.status}`);
        const responseText = await analyzeResponse.text();
        console.log(`   Response: ${responseText.substring(0, 200)}...\n`);

        if (analyzeResponse.ok) {
            console.log('🎉 Behavioral analysis with authentication successful!');
        } else {
            console.log('❌ Behavioral analysis failed even with authentication');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            const errorText = await error.response.text();
            console.error('Response:', errorText);
        }
    }
}

testBehavioralWithAuth(); 