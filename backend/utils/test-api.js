const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testCodingInterviewAPI() {
    console.log('🧪 Testing Coding Interview API...\n');

    try {
        // Test 1: Start a coding interview
        console.log('1. Testing interview start...');
        const startResponse = await fetch(`${BASE_URL}/questions/coding-interview/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                difficulty: 'medium',
                language: 'python',
                topic: 'algorithms'
            })
        });

        if (!startResponse.ok) {
            throw new Error(`Start interview failed: ${startResponse.status}`);
        }

        const startData = await startResponse.json();
        console.log('✅ Interview started successfully');
        console.log(`   Session ID: ${startData.sessionId}`);
        console.log(`   Question: ${startData.questionData.title}\n`);

        const sessionId = startData.sessionId;

        // Test 2: Submit a solution
        console.log('2. Testing solution submission...');
        const solution = `
def two_sum(nums, target):
    """
    Find two numbers in the array that add up to the target.
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
        `;

        const submitResponse = await fetch(`${BASE_URL}/questions/coding-interview/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId,
                solution,
                approach: 'I used a hash map to store seen numbers and their indices. For each number, I check if its complement exists in the map.',
                timeSpent: 300
            })
        });

        if (!submitResponse.ok) {
            throw new Error(`Submit solution failed: ${submitResponse.status}`);
        }

        const submitData = await submitResponse.json();
        console.log('✅ Solution submitted successfully');
        console.log(`   Score: ${submitData.feedback.score}/100`);
        console.log(`   Correctness: ${submitData.feedback.correctness}`);
        console.log(`   Efficiency: ${submitData.feedback.efficiency}\n`);

        // Test 3: End the interview
        console.log('3. Testing interview end...');
        const endResponse = await fetch(`${BASE_URL}/questions/coding-interview/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });

        if (!endResponse.ok) {
            throw new Error(`End interview failed: ${endResponse.status}`);
        }

        const endData = await endResponse.json();
        console.log('✅ Interview ended successfully');
        console.log(`   Overall Score: ${endData.finalReport.overallScore}/100`);
        console.log(`   Strengths: ${endData.finalReport.strengths.length} identified`);
        console.log(`   Areas for improvement: ${endData.finalReport.areasForImprovement.length} identified\n`);

        console.log('🎉 All tests passed! The coding interview API is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            const errorText = await error.response.text();
            console.error('Response:', errorText);
        }
    }
}

// Run the test
testCodingInterviewAPI(); 