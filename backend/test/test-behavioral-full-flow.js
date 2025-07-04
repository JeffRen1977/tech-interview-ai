import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testBehavioralFullFlow() {
    console.log('🧪 Testing Behavioral Full Flow (Analyze + Save)...\n');

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

        // 步骤2: 获取真实的行为面试题目
        console.log('\n2. Getting real behavioral questions...');
        const questionsResponse = await fetch(`${BASE_URL}/behavioral/questions/filtered`, { 
            method: 'GET' 
        });
        
        if (!questionsResponse.ok) {
            console.log(`   ❌ Failed to fetch questions: ${questionsResponse.status}`);
            return;
        }
        
        const questionsData = await questionsResponse.json();
        console.log(`   ✅ Found ${questionsData.questions.length} questions`);
        
        if (questionsData.questions.length === 0) {
            console.log('   ❌ No questions found');
            return;
        }
        
        const testQuestion = questionsData.questions[0];
        console.log(`   Using question: ${testQuestion.title}`);

        // 步骤3: 模拟AI分析
        console.log('\n3. Testing AI analysis...');
        const analysisData = {
            questionId: testQuestion.id,
            userAnswer: 'This is a test answer for behavioral analysis',
            question: testQuestion.prompt || testQuestion.title
        };
        
        console.log('   Analysis data:', JSON.stringify(analysisData, null, 2));
        
        const analysisResponse = await fetch(`${BASE_URL}/behavioral/analyze`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(analysisData)
        });
        
        console.log(`   Analysis status: ${analysisResponse.status}`);
        const analysisResult = await analysisResponse.text();
        console.log(`   Analysis response: ${analysisResult}`);
        
        if (!analysisResponse.ok) {
            console.log(`   ❌ Analysis failed`);
            return;
        }
        
        const analysisJson = JSON.parse(analysisResult);
        console.log(`   ✅ Analysis successful`);

        // 步骤4: 保存到学习历史（模拟前端调用）
        console.log('\n4. Testing save to learning history...');
        
        const saveData = {
            questionId: testQuestion.id,
            userAnswer: 'This is a test answer for behavioral analysis',
            feedback: analysisJson,
            completedAt: new Date().toISOString(),
            questionData: {
                title: testQuestion.title,
                prompt: testQuestion.prompt,
                category: testQuestion.category,
                difficulty: testQuestion.difficulty,
                sampleAnswer: testQuestion.sampleAnswer
            }
        };
        
        console.log('   Save data:', JSON.stringify(saveData, null, 2));
        
        const saveResponse = await fetch(`${BASE_URL}/behavioral/learning-history`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(saveData)
        });
        
        console.log(`   Save status: ${saveResponse.status}`);
        const saveResult = await saveResponse.text();
        console.log(`   Save response: ${saveResult}`);
        
        if (saveResponse.ok) {
            console.log(`   ✅ Save successful`);
        } else {
            console.log(`   ❌ Save failed`);
        }

        console.log('\n🎉 Full flow test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            const errorText = await error.response.text();
            console.error('Response:', errorText);
        }
    }
}

testBehavioralFullFlow(); 