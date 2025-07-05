const axios = require('axios');

// 测试错题本API
async function testWrongQuestionsAPI() {
    try {
        // 首先登录获取token
        console.log('🔐 正在登录...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'test@example.com',
            password: 'password123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ 登录成功，获取到token');
        
        // 测试错题本API
        console.log('📚 正在获取错题本数据...');
        const wrongQuestionsResponse = await axios.get('http://localhost:3000/api/code/wrong-questions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ 错题本API调用成功');
        console.log('📊 响应数据:', JSON.stringify(wrongQuestionsResponse.data, null, 2));
        
        if (wrongQuestionsResponse.data.wrongQuestions && wrongQuestionsResponse.data.wrongQuestions.length > 0) {
            console.log(`🎉 找到 ${wrongQuestionsResponse.data.wrongQuestions.length} 条错题记录`);
        } else {
            console.log('⚠️  没有找到错题记录');
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.response ? error.response.data : error.message);
    }
}

// 运行测试
testWrongQuestionsAPI(); 