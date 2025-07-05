// 测试错题本API
async function testWrongQuestionsAPI() {
    try {
        // 首先登录获取token
        console.log('🔐 正在登录...');
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`登录失败: ${loginResponse.status}`);
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ 登录成功，获取到token');
        
        // 测试错题本API
        console.log('📚 正在获取错题本数据...');
        const wrongQuestionsResponse = await fetch('http://localhost:3000/api/code/wrong-questions', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!wrongQuestionsResponse.ok) {
            throw new Error(`错题本API调用失败: ${wrongQuestionsResponse.status}`);
        }
        
        const wrongQuestionsData = await wrongQuestionsResponse.json();
        console.log('✅ 错题本API调用成功');
        console.log('📊 响应数据:', JSON.stringify(wrongQuestionsData, null, 2));
        
        if (wrongQuestionsData.wrongQuestions && wrongQuestionsData.wrongQuestions.length > 0) {
            console.log(`🎉 找到 ${wrongQuestionsData.wrongQuestions.length} 条错题记录`);
        } else {
            console.log('⚠️  没有找到错题记录');
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

// 运行测试
testWrongQuestionsAPI(); 