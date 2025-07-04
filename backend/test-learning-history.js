import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testLearningHistory() {
    console.log('🧪 Testing Learning History Save Functionality...\n');

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

        // 步骤2: 测试编程题学习历史保存
        console.log('\n2. Testing coding question learning history save...');
        const codingQuestionsResponse = await fetch(`${BASE_URL}/code/questions/filtered`, { method: 'GET' });
        if (!codingQuestionsResponse.ok) {
            console.log(`   ❌ Failed to fetch coding questions: ${codingQuestionsResponse.status}`);
            return;
        }
        const codingData = await codingQuestionsResponse.json();
        
        if (codingData.questions && codingData.questions.length > 0) {
            const testQuestion = codingData.questions[0];
            console.log(`   Testing with question: ${testQuestion.title}`);
            
            const codingSaveResponse = await fetch(`${BASE_URL}/code/learning-history`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    questionId: testQuestion.id,
                    userCode: 'def solution():\n    return "test"',
                    language: 'python',
                    feedback: { test: 'feedback' },
                    completedAt: new Date().toISOString()
                })
            });
            
            console.log(`   Status: ${codingSaveResponse.status}`);
            if (codingSaveResponse.ok) {
                const result = await codingSaveResponse.json();
                console.log(`   ✅ Coding save successful: ${result.message}`);
            } else {
                const errorText = await codingSaveResponse.text();
                console.log(`   ❌ Coding save failed: ${errorText}`);
            }
        }

        // 步骤3: 测试系统设计学习历史保存
        console.log('\n3. Testing system design learning history save...');
        const systemDesignResponse = await fetch(`${BASE_URL}/system-design/questions/filtered`, { method: 'GET' });
        if (!systemDesignResponse.ok) {
            console.log(`   ❌ Failed to fetch system design questions: ${systemDesignResponse.status}`);
            return;
        }
        const systemDesignData = await systemDesignResponse.json();
        
        if (systemDesignData.questions && systemDesignData.questions.length > 0) {
            const testQuestion = systemDesignData.questions[0];
            console.log(`   Testing with question: ${testQuestion.title}`);
            
            const systemDesignSaveResponse = await fetch(`${BASE_URL}/system-design/learning-history`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    questionId: testQuestion.id,
                    completedAt: new Date().toISOString()
                })
            });
            
            console.log(`   Status: ${systemDesignSaveResponse.status}`);
            if (systemDesignSaveResponse.ok) {
                const result = await systemDesignSaveResponse.json();
                console.log(`   ✅ System design save successful: ${result.message}`);
            } else {
                const errorText = await systemDesignSaveResponse.text();
                console.log(`   ❌ System design save failed: ${errorText}`);
            }
        }

        // 步骤4: 测试行为面试学习历史保存
        console.log('\n4. Testing behavioral learning history save...');
        const behavioralResponse = await fetch(`${BASE_URL}/behavioral/questions/filtered`, { method: 'GET' });
        if (!behavioralResponse.ok) {
            console.log(`   ❌ Failed to fetch behavioral questions: ${behavioralResponse.status}`);
            return;
        }
        const behavioralData = await behavioralResponse.json();
        
        if (behavioralData.questions && behavioralData.questions.length > 0) {
            const testQuestion = behavioralData.questions[0];
            console.log(`   Testing with question: ${testQuestion.title}`);
            
            const behavioralSaveResponse = await fetch(`${BASE_URL}/behavioral/learning-history`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    questionId: testQuestion.id,
                    userAnswer: 'This is a test answer',
                    feedback: { test: 'feedback' },
                    completedAt: new Date().toISOString()
                })
            });
            
            console.log(`   Status: ${behavioralSaveResponse.status}`);
            if (behavioralSaveResponse.ok) {
                const result = await behavioralSaveResponse.json();
                console.log(`   ✅ Behavioral save successful: ${result.message}`);
            } else {
                const errorText = await behavioralSaveResponse.text();
                console.log(`   ❌ Behavioral save failed: ${errorText}`);
            }
        }

        console.log('\n🎉 All learning history tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            const errorText = await error.response.text();
            console.error('Response:', errorText);
        }
    }
}

testLearningHistory(); 