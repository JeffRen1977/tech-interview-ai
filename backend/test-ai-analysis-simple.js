// 简单的测试脚本来验证AI分析功能
let fetch;

async function initFetch() {
    if (!fetch) {
        const nodeFetch = await import('node-fetch');
        fetch = nodeFetch.default;
    }
}

async function testAIAnalysis() {
    await initFetch();
    const testData = {
        question: {
            id: 'test-question-1',
            title: 'Two Sum',
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.'
        },
        userCode: `
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
        `,
        language: 'python'
    };

    try {
        console.log('Testing AI Analysis API...');
        const response = await fetch('http://localhost:3000/api/code/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify(testData)
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ AI Analysis API test passed!');
            console.log('Response data:', JSON.stringify(data, null, 2));
        } else {
            const errorData = await response.json();
            console.log('❌ AI Analysis API test failed!');
            console.log('Error data:', errorData);
        }
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// 等待服务器启动
setTimeout(() => {
    testAIAnalysis();
}, 3000); 