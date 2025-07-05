// 使用动态导入来支持 node-fetch v3
let fetch;

// 初始化 fetch
(async () => {
    try {
        const fetchModule = await import('node-fetch');
        fetch = fetchModule.default;
    } catch (error) {
        console.error('Failed to import node-fetch:', error);
        // 如果 node-fetch 不可用，使用全局 fetch（Node.js 18+）
        if (typeof globalThis.fetch === 'function') {
            fetch = globalThis.fetch;
        } else {
            console.error('No fetch implementation available');
        }
    }
})();

const BASE_URL = 'http://localhost:3000/api';

async function testBehavioralInterviewAPI() {
    console.log('🧪 Testing Behavioral Interview API...\n');

    try {
        // Test 1: Start a behavioral interview
        console.log('1. Testing behavioral interview start...');
        const startResponse = await fetch(`${BASE_URL}/questions/behavioral-interview/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: 'Software Engineer',
                level: 'Mid-level',
                company: 'Tech Company'
            })
        });

        if (!startResponse.ok) {
            throw new Error(`Start behavioral interview failed: ${startResponse.status}`);
        }

        const startData = await startResponse.json();
        console.log('✅ Behavioral interview started successfully');
        console.log(`   Session ID: ${startData.sessionId}`);
        console.log(`   Role: ${startData.interviewData.role}`);
        console.log(`   Questions: ${startData.interviewData.questions.length}\n`);

        const sessionId = startData.sessionId;
        const firstQuestion = startData.interviewData.questions[0];

        // Test 2: Submit a behavioral response
        console.log('2. Testing behavioral response submission...');
        const response = `
        I'd like to share a situation where I had to lead a team through a challenging project. 
        
        Situation: We were developing a new e-commerce platform with a tight deadline of 3 months, and our team was facing technical challenges with the payment integration system.
        
        Task: As the lead developer, I was responsible for coordinating a team of 5 developers, ensuring we met the deadline while maintaining code quality and system reliability.
        
        Action: I immediately organized daily stand-ups to track progress, implemented a code review process, and set up automated testing. I also worked closely with the payment provider to resolve integration issues and created detailed documentation for the team.
        
        Result: We successfully delivered the project on time with 95% test coverage. The payment system processed over $1M in transactions during the first month with zero critical bugs. The team's morale improved significantly, and we received positive feedback from stakeholders.
        `;

        const submitResponse = await fetch(`${BASE_URL}/questions/behavioral-interview/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId,
                questionId: firstQuestion.id,
                response,
                responseType: 'text'
            })
        });

        if (!submitResponse.ok) {
            throw new Error(`Submit behavioral response failed: ${submitResponse.status}`);
        }

        const submitData = await submitResponse.json();
        console.log('✅ Behavioral response submitted successfully');
        console.log(`   Overall Score: ${submitData.feedback.overallScore}/100`);
        console.log(`   Communication: ${submitData.feedback.communication}`);
        console.log(`   STAR Analysis - Situation: ${submitData.feedback.starAnalysis.situation.score}/100\n`);

        // Test 3: End the behavioral interview
        console.log('3. Testing behavioral interview end...');
        const endResponse = await fetch(`${BASE_URL}/questions/behavioral-interview/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });

        if (!endResponse.ok) {
            throw new Error(`End behavioral interview failed: ${endResponse.status}`);
        }

        const endData = await endResponse.json();
        console.log('✅ Behavioral interview ended successfully');
        console.log(`   Overall Score: ${endData.finalReport.overallScore}/100`);
        console.log(`   Hiring Recommendation: ${endData.finalReport.hiringRecommendation}`);
        console.log(`   Strengths: ${endData.finalReport.strengths.length} identified`);
        console.log(`   Areas for improvement: ${endData.finalReport.areasForImprovement.length} identified\n`);

        console.log('🎉 All behavioral interview tests passed! The API is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            const errorText = await error.response.text();
            console.error('Response:', errorText);
        }
    }
}

// Run the test
testBehavioralInterviewAPI(); 