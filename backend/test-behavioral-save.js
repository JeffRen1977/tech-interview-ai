import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testBehavioralSave() {
    console.log('🧪 Testing Behavioral Save Functionality...\n');

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

        // 步骤2: 测试行为面试保存（模拟前端调用）
        console.log('\n2. Testing behavioral save with questionData...');
        
        const testData = {
            questionId: 'test-question-id',
            userAnswer: 'This is a test answer for behavioral question',
            feedback: { 
                success: true, 
                message: 'This is a test feedback from AI analysis' 
            },
            completedAt: new Date().toISOString(),
            questionData: {
                title: 'Test Behavioral Question',
                prompt: 'Tell me about a time you demonstrated leadership',
                category: 'leadership',
                difficulty: 'medium',
                sampleAnswer: 'This is a sample answer'
            }
        };
        
        console.log('   Sending data:', JSON.stringify(testData, null, 2));
        
        const saveResponse = await fetch(`${BASE_URL}/behavioral/learning-history`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testData)
        });
        
        console.log(`   Status: ${saveResponse.status}`);
        const responseText = await saveResponse.text();
        console.log(`   Response: ${responseText}`);
        
        if (saveResponse.ok) {
            console.log(`   ✅ Behavioral save successful`);
        } else {
            console.log(`   ❌ Behavioral save failed: ${responseText}`);
        }

        console.log('\n🎉 Test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            const errorText = await error.response.text();
            console.error('Response:', errorText);
        }
    }
}

testBehavioralSave(); 