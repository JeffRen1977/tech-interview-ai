const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;

function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;
        
        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: `/api${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ status: res.statusCode, data: response });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function testWrongQuestionsAPI() {
    try {
        console.log('🧪 Testing Wrong Questions API...\n');

        // 首先获取认证token
        let loginResponse;
        try {
            loginResponse = await makeRequest('POST', '/auth/login', {
                email: 'test@example.com',
                password: 'password123'
            });
        } catch (error) {
            console.log('❌ Login failed, trying to register...');
            try {
                await makeRequest('POST', '/auth/register', {
                    email: 'test@example.com',
                    password: 'password123',
                    name: 'Test User'
                });
                
                loginResponse = await makeRequest('POST', '/auth/login', {
                    email: 'test@example.com',
                    password: 'password123'
                });
            } catch (registerError) {
                console.log(`❌ Registration failed: ${registerError.message}`);
                return;
            }
        }

        if (loginResponse.status !== 200) {
            console.log(`❌ Login failed with status: ${loginResponse.status}`);
            return;
        }

        const token = loginResponse.data.token;
        console.log('✅ Authentication successful');

        // 测试错题本API
        console.log('\n📚 Testing wrong questions API...');
        
        try {
            const wrongQuestionsResponse = await makeRequest('GET', '/code/wrong-questions', null, token);

            if (wrongQuestionsResponse.status === 200) {
                console.log(`✅ Wrong questions API successful`);
                console.log(`📊 Found ${wrongQuestionsResponse.data.wrongQuestions?.length || 0} wrong questions`);
                
                if (wrongQuestionsResponse.data.wrongQuestions && wrongQuestionsResponse.data.wrongQuestions.length > 0) {
                    console.log('\n📋 Sample wrong questions:');
                    wrongQuestionsResponse.data.wrongQuestions.slice(0, 3).forEach((question, index) => {
                        console.log(`  ${index + 1}. ${question.questionData?.title || 'Unknown'} (${question.interviewType})`);
                    });
                }
            } else {
                console.log(`❌ Wrong questions API failed with status: ${wrongQuestionsResponse.status}`);
                console.log(`Response: ${JSON.stringify(wrongQuestionsResponse.data)}`);
            }
        } catch (error) {
            console.log(`❌ Wrong questions API failed: ${error.message}`);
        }

        console.log('\n🎉 Wrong questions API test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testWrongQuestionsAPI(); 