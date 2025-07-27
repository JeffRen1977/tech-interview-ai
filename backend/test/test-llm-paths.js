const BASE_URL = 'http://localhost:3000/api';

async function testLLMPaths() {
    console.log('🧪 Testing LLM API paths...\n');

    const endpoints = [
        '/llm/categories',
        '/llm/questions',
        '/llm/questions/filtered?category=RAG&difficulty=简单'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`Testing: ${endpoint}`);
            const response = await fetch(`${BASE_URL}${endpoint}`);
            const data = await response.json();
            
            if (response.ok) {
                console.log(`✅ Success: ${endpoint}`);
                if (endpoint.includes('categories')) {
                    console.log(`   Categories: ${data.categories?.length || 0}`);
                    console.log(`   Difficulties: ${data.difficulties?.length || 0}`);
                } else if (endpoint.includes('questions')) {
                    console.log(`   Questions: ${data.questions?.length || 0}`);
                }
            } else {
                console.log(`❌ Failed: ${endpoint} - ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ Error: ${endpoint} - ${error.message}`);
        }
        console.log('');
    }

    console.log('🎉 Path testing completed!');
}

testLLMPaths(); 