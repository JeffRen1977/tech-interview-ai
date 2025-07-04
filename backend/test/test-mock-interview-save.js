async function testMockInterviewSave() {
    const testData = {
        questionId: 'test_question_123',
        questionData: {
            title: 'Test Coding Question',
            description: 'This is a test question for mock interview',
            difficulty: 'medium',
            topic: 'algorithms'
        },
        userSolution: 'function test() { return "Hello World"; }',
        feedback: {
            complexity: {
                time: 'O(1)',
                space: 'O(1)'
            },
            aiAnalysis: 'This is a good solution with proper time and space complexity.',
            score: 85,
            strengths: ['Good code structure', 'Proper complexity analysis'],
            areasForImprovement: ['Could add more comments'],
            recommendations: ['Add input validation']
        },
        interviewType: 'coding',
        timeSpent: 1200, // 20 minutes in seconds
        completedAt: new Date().toISOString()
    };

    try {
        console.log('Testing mock interview save endpoint...');
        console.log('Test data:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('http://localhost:3000/api/mock/save-interview-result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test_token' // This will fail auth, but we can see the endpoint exists
            },
            body: JSON.stringify(testData)
        });
        
        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response body:', responseText);
        
        if (response.status === 401) {
            console.log('✅ Endpoint exists and requires authentication (expected)');
        } else {
            console.log('❌ Unexpected response status');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testMockInterviewSave(); 