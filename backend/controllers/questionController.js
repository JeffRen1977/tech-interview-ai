const { admin, db } = require('../config/firebase');

// 使用动态导入来支持 node-fetch v3
let fetch;
(async () => {
    const nodeFetch = await import('node-fetch');
    fetch = nodeFetch.default;
})();

// 帮助函数: 从Gemini响应中提取纯净的JSON
function extractJson(text) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("Could not find a valid JSON object in the API response.");
    }
    return text.substring(firstBrace, lastBrace + 1);
}

// 帮助函数: 调用Gemini API
async function callGeminiAPI(prompt) {
    // 确保 fetch 已经加载
    if (!fetch) {
        const nodeFetch = await import('node-fetch');
        fetch = nodeFetch.default;
    }
    
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file or environment variables.');
    }
    
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    
    try {
        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

// --- 编程题逻辑 ---
exports.generateCodingQuestion = async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }
    
    const prompt = `
        Act as an expert computer science tutor. Based on the following interview problem, generate a detailed analysis.
        Problem Title: "${title}"
        Problem Description: "${description}"
        Provide the output in a single, clean JSON object format...
        {
          "questionId": "A unique, URL-friendly string ID...", "title": "${title}", "description": "${description}",
          "example": "...", "solution": "...", "explanation": "...", "testCases": "...",
          "complexity": { "time": "...", "space": "..." }, "dataStructures": [...],
          "algorithms": [...], "difficulty": "..."
        }
    `;

    try {
        const geminiData = await callGeminiAPI(prompt);
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const questionData = JSON.parse(jsonText);
        res.status(200).json({ questionData });
    } catch (error) {
        console.error("Error generating coding question:", error);
        res.status(500).json({ message: `Failed to generate question: ${error.message}` });
    }
};

exports.saveCodingQuestion = async (req, res) => {
    const { questionData } = req.body;
    if (!questionData || !questionData.questionId) {
        return res.status(400).json({ message: 'Valid question data is required.' });
    }
    try {
        await db.collection('coding-questions').doc(questionData.questionId).set(questionData);
        res.status(201).json({ message: `Question "${questionData.title}" saved successfully!` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save question to database.' });
    }
};

// --- 系统设计题逻辑 ---
exports.generateSystemDesignQuestion = async (req, res) => {
    const { title, description } = req.body;
     if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }
    
    const prompt = `
        Act as a senior system architect. Based on the following design problem, provide a detailed solution.
        Problem Title: "${title}"
        Core Description: "${description}"
        Provide the output in a single, clean JSON object format...
        {
          "title": "${title}", "description": "${description}", "category": "...",
          "detailedAnswer": "...", "tags": [...]
        }
    `;

    try {
        const geminiData = await callGeminiAPI(prompt);
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const questionData = JSON.parse(jsonText);
        res.status(200).json({ questionData });
    } catch (error) {
        console.error("Error generating system design question:", error);
        res.status(500).json({ message: `Failed to generate question: ${error.message}` });
    }
};

exports.saveSystemDesignQuestion = async (req, res) => {
    const { questionData } = req.body;
    if (!questionData || !questionData.title) {
        return res.status(400).json({ message: 'Valid question data is required.' });
    }
    try {
        const docId = questionData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (!docId) {
            return res.status(400).json({ message: 'A valid ID could not be generated from the title.' });
        }
        await db.collection('system-design-questions').doc(docId).set(questionData);
        res.status(201).json({ message: `System design question "${questionData.title}" saved successfully!` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save question to database.' });
    }
};

// --- 编程面试逻辑 ---
exports.startCodingInterview = async (req, res) => {
    const { difficulty, language, topic } = req.body;
    
    const prompt = `
        Act as an expert coding interviewer. Generate a coding interview question with the following specifications:
        - Difficulty: ${difficulty || 'medium'}
        - Programming Language: ${language || 'any'}
        - Topic: ${topic || 'algorithms'}
        
        Provide the output in a single, clean JSON object format:
        {
          "questionId": "unique-id",
          "title": "Question title",
          "description": "Detailed problem description",
          "example": "Example input/output",
          "constraints": "Problem constraints",
          "testCases": [
            {"input": "...", "output": "...", "explanation": "..."}
          ],
          "hints": ["Hint 1", "Hint 2"],
          "expectedApproach": "Expected solution approach",
          "difficulty": "${difficulty || 'medium'}",
          "topic": "${topic || 'algorithms'}"
        }
    `;

    try {
        const geminiData = await callGeminiAPI(prompt);
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const questionData = JSON.parse(jsonText);
        
        // 创建面试会话
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sessionData = {
            sessionId,
            questionData,
            startTime: new Date(),
            status: 'active',
            userSolutions: [],
            feedback: []
        };
        
        await db.collection('coding-interviews').doc(sessionId).set(sessionData);
        
        res.status(200).json({ 
            sessionId,
            questionData,
            message: 'Coding interview started successfully'
        });
    } catch (error) {
        console.error("Error starting coding interview:", error);
        res.status(500).json({ message: `Failed to start interview: ${error.message}` });
    }
};

exports.submitCodingSolution = async (req, res) => {
    const { sessionId, solution, approach, timeSpent } = req.body;
    
    if (!sessionId || !solution) {
        return res.status(400).json({ message: 'Session ID and solution are required' });
    }
    
    try {
        const sessionRef = db.collection('coding-interviews').doc(sessionId);
        const sessionDoc = await sessionRef.get();
        
        if (!sessionDoc.exists) {
            return res.status(404).json({ message: 'Interview session not found' });
        }
        
        const sessionData = sessionDoc.data();
        const questionData = sessionData.questionData;
        
        // 分析用户解答
        const analysisPrompt = `
            Act as an expert coding interviewer evaluating a candidate's solution.
            
            Question: ${questionData.title}
            Description: ${questionData.description}
            Expected Approach: ${questionData.expectedApproach}
            
            Candidate's Solution:
            ${solution}
            
            Candidate's Approach: ${approach || 'Not specified'}
            Time Spent: ${timeSpent || 'Unknown'}
            
            Provide a detailed evaluation in JSON format:
            {
              "correctness": "correct/partially_correct/incorrect",
              "efficiency": "excellent/good/fair/poor",
              "codeQuality": "excellent/good/fair/poor",
              "problemSolving": "excellent/good/fair/poor",
              "communication": "excellent/good/fair/poor",
              "detailedFeedback": "Detailed feedback on the solution",
              "suggestions": ["Suggestion 1", "Suggestion 2"],
              "score": 85,
              "nextHints": ["Hint if needed"]
            }
        `;
        
        const geminiData = await callGeminiAPI(analysisPrompt);
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const feedback = JSON.parse(jsonText);
        
        // 保存解答和反馈
        const solutionData = {
            solution,
            approach,
            timeSpent,
            feedback,
            timestamp: new Date()
        };
        
        await sessionRef.update({
            userSolutions: admin.firestore.FieldValue.arrayUnion(solutionData),
            feedback: admin.firestore.FieldValue.arrayUnion(feedback)
        });
        
        res.status(200).json({ 
            feedback,
            message: 'Solution submitted and evaluated successfully'
        });
    } catch (error) {
        console.error("Error submitting solution:", error);
        res.status(500).json({ message: `Failed to submit solution: ${error.message}` });
    }
};

exports.getCodingFeedback = async (req, res) => {
    const { sessionId } = req.body;
    
    if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
    }
    
    try {
        const sessionRef = db.collection('coding-interviews').doc(sessionId);
        const sessionDoc = await sessionRef.get();
        
        if (!sessionDoc.exists) {
            return res.status(404).json({ message: 'Interview session not found' });
        }
        
        const sessionData = sessionDoc.data();
        const latestFeedback = sessionData.feedback[sessionData.feedback.length - 1];
        
        if (!latestFeedback) {
            return res.status(404).json({ message: 'No feedback available for this session' });
        }
        
        res.status(200).json({ feedback: latestFeedback });
    } catch (error) {
        console.error("Error getting feedback:", error);
        res.status(500).json({ message: `Failed to get feedback: ${error.message}` });
    }
};

exports.endCodingInterview = async (req, res) => {
    const { sessionId } = req.body;
    
    if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
    }
    
    try {
        const sessionRef = db.collection('coding-interviews').doc(sessionId);
        const sessionDoc = await sessionRef.get();
        
        if (!sessionDoc.exists) {
            return res.status(404).json({ message: 'Interview session not found' });
        }
        
        const sessionData = sessionDoc.data();
        
        // 生成最终评估报告
        const finalReportPrompt = `
            Act as an expert coding interviewer providing a final assessment.
            
            Interview Session Data:
            - Question: ${sessionData.questionData.title}
            - Number of attempts: ${sessionData.userSolutions.length}
            - Total feedback: ${sessionData.feedback.length}
            
            Provide a comprehensive final report in JSON format:
            {
              "overallScore": 85,
              "strengths": ["Strength 1", "Strength 2"],
              "areasForImprovement": ["Area 1", "Area 2"],
              "recommendations": ["Recommendation 1", "Recommendation 2"],
              "finalAssessment": "Overall assessment of the candidate's performance",
              "nextSteps": "Suggested next steps for improvement"
            }
        `;
        
        const geminiData = await callGeminiAPI(finalReportPrompt);
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const finalReport = JSON.parse(jsonText);
        
        // 保存到用户历史
        const userHistoryData = {
            sessionId,
            interviewType: 'coding',
            questionData: sessionData.questionData,
            finalReport,
            startTime: sessionData.startTime,
            endTime: new Date(),
            timeSpent: sessionData.timeSpent || 0,
            topic: sessionData.questionData.topic || 'programming',
            difficulty: sessionData.questionData.difficulty || 'medium',
            userSolutions: sessionData.userSolutions || [],
            feedback: sessionData.feedback || []
        };
        
        // 更新会话状态
        await sessionRef.update({
            status: 'completed',
            endTime: new Date(),
            finalReport
        });
        
        // 保存到用户历史记录
        await db.collection('user-interview-history').add(userHistoryData);
        
        res.status(200).json({ 
            finalReport,
            message: 'Interview completed successfully'
        });
    } catch (error) {
        console.error("Error ending interview:", error);
        res.status(500).json({ message: `Failed to end interview: ${error.message}` });
    }
};

// --- 行为面试逻辑 ---
exports.startBehavioralInterview = async (req, res) => {
    const { role, level, company } = req.body;
    
    const prompt = `
        Act as an expert behavioral interviewer. Generate a behavioral interview session with STAR framework questions.
        
        Role: ${role || 'Software Engineer'}
        Level: ${level || 'Mid-level'}
        Company: ${company || 'Tech Company'}
        
        Generate 5-7 behavioral questions covering key areas like leadership, conflict resolution, teamwork, problem-solving, and technical challenges.
        
        Provide the output in a single, clean JSON object format:
        {
          "sessionId": "unique-session-id",
          "role": "${role || 'Software Engineer'}",
          "level": "${level || 'Mid-level'}",
          "company": "${company || 'Tech Company'}",
          "duration": 45,
          "questions": [
            {
              "id": "q1",
              "category": "leadership",
              "question": "Tell me about a time when you had to lead a team through a difficult project.",
              "starFramework": {
                "situation": "Describe the specific situation or context",
                "task": "Explain your responsibility and what needed to be accomplished",
                "action": "Detail the specific actions you took",
                "result": "Share the outcomes and what you learned"
              },
              "expectedKeywords": ["leadership", "team", "project", "challenge"],
              "scoringCriteria": {
                "clarity": "How clearly the candidate explains the situation",
                "specificity": "Use of specific examples and details",
                "outcome": "Demonstration of positive results",
                "learning": "Reflection and lessons learned"
              }
            }
          ],
          "evaluationCriteria": {
            "communication": "Clarity and effectiveness of communication",
            "specificity": "Use of specific examples and details",
            "problemSolving": "Demonstration of problem-solving skills",
            "leadership": "Leadership and teamwork abilities",
            "selfAwareness": "Self-reflection and learning ability"
          }
        }
    `;

    try {
        const geminiData = await callGeminiAPI(prompt);
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const interviewData = JSON.parse(jsonText);
        
        // 创建面试会话
        const sessionId = `behavioral_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sessionData = {
            sessionId,
            interviewData,
            startTime: new Date(),
            status: 'active',
            currentQuestionIndex: 0,
            responses: [],
            feedback: [],
            timeRemaining: 45 * 60 // 45 minutes in seconds
        };
        
        await db.collection('behavioral-interviews').doc(sessionId).set(sessionData);
        
        res.status(200).json({ 
            sessionId,
            interviewData,
            message: 'Behavioral interview started successfully'
        });
    } catch (error) {
        console.error("Error starting behavioral interview:", error);
        res.status(500).json({ message: `Failed to start interview: ${error.message}` });
    }
};

exports.submitBehavioralResponse = async (req, res) => {
    const { sessionId, questionId, response, responseType } = req.body;
    
    if (!sessionId || !questionId || !response) {
        return res.status(400).json({ message: 'Session ID, question ID, and response are required' });
    }
    
    try {
        const sessionRef = db.collection('behavioral-interviews').doc(sessionId);
        const sessionDoc = await sessionRef.get();
        
        if (!sessionDoc.exists) {
            return res.status(404).json({ message: 'Interview session not found' });
        }
        
        const sessionData = sessionDoc.data();
        const currentQuestion = sessionData.interviewData.questions.find(q => q.id === questionId);
        
        if (!currentQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        // 分析用户回答
        const analysisPrompt = `
            Act as an expert behavioral interviewer evaluating a candidate's response using the STAR framework.
            
            Question: ${currentQuestion.question}
            Category: ${currentQuestion.category}
            STAR Framework:
            - Situation: ${currentQuestion.starFramework.situation}
            - Task: ${currentQuestion.starFramework.task}
            - Action: ${currentQuestion.starFramework.action}
            - Result: ${currentQuestion.starFramework.result}
            
            Candidate's Response: ${response}
            Response Type: ${responseType || 'text'}
            
            Evaluate the response based on the STAR framework and provide detailed feedback in JSON format:
            {
              "starAnalysis": {
                "situation": {
                  "score": 85,
                  "feedback": "How well the situation was described",
                  "strengths": ["Strength 1"],
                  "improvements": ["Improvement 1"]
                },
                "task": {
                  "score": 80,
                  "feedback": "How clearly the task was explained",
                  "strengths": ["Strength 1"],
                  "improvements": ["Improvement 1"]
                },
                "action": {
                  "score": 90,
                  "feedback": "How specific and detailed the actions were",
                  "strengths": ["Strength 1"],
                  "improvements": ["Improvement 1"]
                },
                "result": {
                  "score": 85,
                  "feedback": "How well the results were quantified and explained",
                  "strengths": ["Strength 1"],
                  "improvements": ["Improvement 1"]
                }
              },
              "overallScore": 85,
              "communication": "excellent/good/fair/poor",
              "specificity": "excellent/good/fair/poor",
              "problemSolving": "excellent/good/fair/poor",
              "leadership": "excellent/good/fair/poor",
              "selfAwareness": "excellent/good/fair/poor",
              "detailedFeedback": "Comprehensive feedback on the response",
              "suggestions": ["Suggestion 1", "Suggestion 2"],
              "nextQuestion": "Guidance for the next question"
            }
        `;
        
        const geminiData = await callGeminiAPI(analysisPrompt);
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const feedback = JSON.parse(jsonText);
        
        // 保存回答和反馈
        const responseData = {
            questionId,
            response,
            responseType: responseType || 'text',
            feedback,
            timestamp: new Date()
        };
        
        await sessionRef.update({
            responses: admin.firestore.FieldValue.arrayUnion(responseData),
            feedback: admin.firestore.FieldValue.arrayUnion(feedback),
            currentQuestionIndex: admin.firestore.FieldValue.increment(1)
        });
        
        res.status(200).json({ 
            feedback,
            nextQuestion: sessionData.interviewData.questions[sessionData.currentQuestionIndex + 1] || null,
            message: 'Response submitted and evaluated successfully'
        });
    } catch (error) {
        console.error("Error submitting behavioral response:", error);
        res.status(500).json({ message: `Failed to submit response: ${error.message}` });
    }
};

exports.getBehavioralFeedback = async (req, res) => {
    const { sessionId } = req.body;
    
    if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
    }
    
    try {
        const sessionRef = db.collection('behavioral-interviews').doc(sessionId);
        const sessionDoc = await sessionRef.get();
        
        if (!sessionDoc.exists) {
            return res.status(404).json({ message: 'Interview session not found' });
        }
        
        const sessionData = sessionDoc.data();
        const latestFeedback = sessionData.feedback[sessionData.feedback.length - 1];
        
        if (!latestFeedback) {
            return res.status(404).json({ message: 'No feedback available for this session' });
        }
        
        res.status(200).json({ feedback: latestFeedback });
    } catch (error) {
        console.error("Error getting behavioral feedback:", error);
        res.status(500).json({ message: `Failed to get feedback: ${error.message}` });
    }
};

exports.endBehavioralInterview = async (req, res) => {
    const { sessionId } = req.body;
    
    if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
    }
    
    try {
        const sessionRef = db.collection('behavioral-interviews').doc(sessionId);
        const sessionDoc = await sessionRef.get();
        
        if (!sessionDoc.exists) {
            return res.status(404).json({ message: 'Interview session not found' });
        }
        
        const sessionData = sessionDoc.data();
        
        // 生成最终评估报告
        const finalReportPrompt = `
            Act as an expert behavioral interviewer providing a comprehensive final assessment.
            
            Interview Session Data:
            - Role: ${sessionData.interviewData.role}
            - Level: ${sessionData.interviewData.level}
            - Company: ${sessionData.interviewData.company}
            - Questions Answered: ${sessionData.responses.length}
            - Total Feedback: ${sessionData.feedback.length}
            
            Provide a comprehensive final behavioral assessment in JSON format:
            {
              "overallScore": 85,
              "categoryScores": {
                "communication": 85,
                "specificity": 80,
                "problemSolving": 90,
                "leadership": 85,
                "selfAwareness": 80
              },
              "starFrameworkAnalysis": {
                "situation": "Overall performance in describing situations",
                "task": "Overall performance in explaining tasks",
                "action": "Overall performance in detailing actions",
                "result": "Overall performance in sharing results"
              },
              "strengths": ["Strength 1", "Strength 2", "Strength 3"],
              "areasForImprovement": ["Area 1", "Area 2", "Area 3"],
              "recommendations": ["Recommendation 1", "Recommendation 2"],
              "finalAssessment": "Overall assessment of the candidate's behavioral interview performance",
              "nextSteps": "Suggested next steps for improvement",
              "hiringRecommendation": "strong_yes/yes/maybe/no"
            }
        `;
        
        const geminiData = await callGeminiAPI(finalReportPrompt);
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const finalReport = JSON.parse(jsonText);
        
        // 保存到用户历史
        const userHistoryData = {
            sessionId,
            interviewType: 'behavioral',
            questionData: {
                title: `Behavioral Interview - ${sessionData.interviewData.role} at ${sessionData.interviewData.company}`,
                description: `Behavioral interview for ${sessionData.interviewData.level} ${sessionData.interviewData.role} position`,
                role: sessionData.interviewData.role,
                level: sessionData.interviewData.level,
                company: sessionData.interviewData.company,
                questions: sessionData.interviewData.questions || []
            },
            finalReport,
            startTime: sessionData.startTime,
            endTime: new Date(),
            timeSpent: (45 * 60) - (sessionData.timeRemaining || 0), // 计算实际花费时间
            topic: 'behavioral',
            difficulty: 'medium',
            responses: sessionData.responses || [],
            feedback: sessionData.feedback || []
        };
        
        // 更新会话状态
        await sessionRef.update({
            status: 'completed',
            endTime: new Date(),
            finalReport
        });
        
        // 保存到用户历史记录
        await db.collection('user-interview-history').add(userHistoryData);
        
        res.status(200).json({ 
            finalReport,
            message: 'Behavioral interview completed successfully'
        });
    } catch (error) {
        console.error("Error ending behavioral interview:", error);
        res.status(500).json({ message: `Failed to end interview: ${error.message}` });
    }
};

// --- 系统设计面试逻辑 ---
exports.startSystemDesignInterview = async (req, res) => {
    const { topic, difficulty, language } = req.body;
    
    const prompt = `
        Act as an expert system design interviewer specializing in AI/ML systems. Generate a comprehensive system design interview question.
        
        Topic: ${topic || 'machine-learning'}
        Difficulty: ${difficulty || 'medium'}
        Language: ${language || 'chinese'}
        
        Focus on modern AI/ML system design challenges including:
        - Machine Learning Infrastructure
        - Computer Vision Systems
        - Natural Language Processing
        - Reinforcement Learning
        - Deep Learning Systems
        - AI Infrastructure
        - Recommendation Systems
        - Autonomous Systems
        
        Provide the output in a single, clean JSON object format:
        {
          "questionId": "unique-id",
          "title": "Question title",
          "description": "Detailed problem description",
          "requirements": [
            "Requirement 1",
            "Requirement 2",
            "Requirement 3"
          ],
          "constraints": "System constraints and limitations",
          "expectedComponents": [
            "Component 1",
            "Component 2",
            "Component 3"
          ],
          "hints": [
            "Hint 1",
            "Hint 2"
          ],
          "evaluationCriteria": {
            "systemDesign": "System architecture and design quality",
            "technicalDepth": "Technical knowledge and depth",
            "communication": "Clarity of explanation",
            "innovation": "Innovative thinking and approach",
            "scalability": "Scalability considerations",
            "reliability": "Reliability and fault tolerance"
          },
          "difficulty": "${difficulty || 'medium'}",
          "topic": "${topic || 'machine-learning'}",
          "estimatedTime": 60,
          "category": "ai-ml-system-design"
        }
    `;

    try {
        const geminiData = await callGeminiAPI(prompt);
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const questionData = JSON.parse(jsonText);
        
        // 创建面试会话
        const sessionId = `system_design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sessionData = {
            sessionId,
            questionData,
            startTime: new Date(),
            status: 'active',
            voiceInputs: [],
            whiteboardData: [],
            feedback: [],
            timeSpent: 0
        };
        
        await db.collection('system-design-interviews').doc(sessionId).set(sessionData);
        
        res.status(200).json({ 
            sessionId,
            questionData,
            message: 'System design interview started successfully'
        });
    } catch (error) {
        console.error("Error starting system design interview:", error);
        res.status(500).json({ message: `Failed to start interview: ${error.message}` });
    }
};

exports.submitSystemDesignSolution = async (req, res) => {
    const { sessionId, voiceInput, whiteboardData, timeSpent } = req.body;
    
    if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
    }
    
    if (!voiceInput && (!whiteboardData || whiteboardData.length === 0)) {
        return res.status(400).json({ message: 'Voice input or whiteboard data is required' });
    }
    
    try {
        const sessionRef = db.collection('system-design-interviews').doc(sessionId);
        const sessionDoc = await sessionRef.get();
        
        if (!sessionDoc.exists) {
            return res.status(404).json({ message: 'Interview session not found' });
        }
        
        const sessionData = sessionDoc.data();
        const questionData = sessionData.questionData;
        
        // 分析用户解答
        const analysisPrompt = `
            Act as an expert system design interviewer evaluating a candidate's solution for an AI/ML system design problem.
            
            Question: ${questionData.title}
            Description: ${questionData.description}
            Requirements: ${questionData.requirements?.join(', ')}
            Constraints: ${questionData.constraints}
            
            Candidate's Voice Input: ${voiceInput || 'No voice input provided'}
            Whiteboard Data: ${whiteboardData ? JSON.stringify(whiteboardData) : 'No whiteboard data provided'}
            Time Spent: ${timeSpent || 0} seconds
            
            Evaluate the candidate's system design approach and provide comprehensive feedback in JSON format:
            {
              "systemDesign": "excellent/good/fair/poor",
              "technicalDepth": "excellent/good/fair/poor",
              "communication": "excellent/good/fair/poor",
              "innovation": "excellent/good/fair/poor",
              "scalability": "excellent/good/fair/poor",
              "reliability": "excellent/good/fair/poor",
              "score": 85,
              "detailedFeedback": "Comprehensive feedback on the system design approach",
              "strengths": ["Strength 1", "Strength 2"],
              "weaknesses": ["Weakness 1", "Weakness 2"],
              "suggestions": ["Suggestion 1", "Suggestion 2"],
              "architectureAnalysis": "Analysis of the proposed architecture",
              "technicalAnalysis": "Analysis of technical decisions",
              "improvementAreas": ["Area 1", "Area 2"]
            }
        `;
        
        const geminiData = await callGeminiAPI(analysisPrompt);
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const feedback = JSON.parse(jsonText);
        
        // 保存解答和反馈
        const solutionData = {
            voiceInput,
            whiteboardData,
            timeSpent,
            feedback,
            timestamp: new Date()
        };
        
        await sessionRef.update({
            voiceInputs: admin.firestore.FieldValue.arrayUnion(voiceInput),
            whiteboardData: admin.firestore.FieldValue.arrayUnion(whiteboardData || []),
            feedback: admin.firestore.FieldValue.arrayUnion(feedback),
            timeSpent: timeSpent || 0
        });
        
        res.status(200).json({ 
            feedback,
            message: 'Solution submitted and evaluated successfully'
        });
    } catch (error) {
        console.error("Error submitting system design solution:", error);
        res.status(500).json({ message: `Failed to submit solution: ${error.message}` });
    }
};

exports.getSystemDesignFeedback = async (req, res) => {
    const { sessionId } = req.body;
    
    if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
    }
    
    try {
        const sessionRef = db.collection('system-design-interviews').doc(sessionId);
        const sessionDoc = await sessionRef.get();
        
        if (!sessionDoc.exists) {
            return res.status(404).json({ message: 'Interview session not found' });
        }
        
        const sessionData = sessionDoc.data();
        const latestFeedback = sessionData.feedback[sessionData.feedback.length - 1];
        
        if (!latestFeedback) {
            return res.status(404).json({ message: 'No feedback available for this session' });
        }
        
        res.status(200).json({ feedback: latestFeedback });
    } catch (error) {
        console.error("Error getting system design feedback:", error);
        res.status(500).json({ message: `Failed to get feedback: ${error.message}` });
    }
};

exports.endSystemDesignInterview = async (req, res) => {
    const { sessionId } = req.body;
    
    if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
    }
    
    try {
        const sessionRef = db.collection('system-design-interviews').doc(sessionId);
        const sessionDoc = await sessionRef.get();
        
        if (!sessionDoc.exists) {
            return res.status(404).json({ message: 'Interview session not found' });
        }
        
        const sessionData = sessionDoc.data();
        
        // 生成最终评估报告
        const finalReportPrompt = `
            Act as an expert system design interviewer providing a comprehensive final assessment for an AI/ML system design interview.
            
            Interview Session Data:
            - Question: ${sessionData.questionData.title}
            - Topic: ${sessionData.questionData.topic}
            - Difficulty: ${sessionData.questionData.difficulty}
            - Time Spent: ${sessionData.timeSpent} seconds
            - Number of submissions: ${sessionData.feedback.length}
            
            Provide a comprehensive final system design assessment in JSON format:
            {
              "overallScore": 85,
              "categoryScores": {
                "systemDesign": 85,
                "technicalDepth": 80,
                "communication": 90,
                "innovation": 85,
                "scalability": 80,
                "reliability": 85
              },
              "strengths": ["Strength 1", "Strength 2", "Strength 3"],
              "areasForImprovement": ["Area 1", "Area 2", "Area 3"],
              "recommendations": ["Recommendation 1", "Recommendation 2"],
              "finalAssessment": "Overall assessment of the candidate's system design capabilities",
              "nextSteps": "Suggested next steps for improvement",
              "hiringRecommendation": "strong_yes/yes/maybe/no",
              "technicalEvaluation": "Detailed technical evaluation",
              "architectureEvaluation": "Detailed architecture evaluation"
            }
        `;
        
        const geminiData = await callGeminiAPI(finalReportPrompt);
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const finalReport = JSON.parse(jsonText);
        
        // 保存到用户历史
        const userHistoryData = {
            sessionId,
            interviewType: 'system-design',
            questionData: sessionData.questionData,
            finalReport,
            startTime: sessionData.startTime,
            endTime: new Date(),
            timeSpent: sessionData.timeSpent,
            topic: sessionData.questionData.topic,
            difficulty: sessionData.questionData.difficulty,
            voiceInputs: sessionData.voiceInputs || [],
            whiteboardData: sessionData.whiteboardData || [],
            feedback: sessionData.feedback || []
        };
        
        // 更新会话状态
        await sessionRef.update({
            status: 'completed',
            endTime: new Date(),
            finalReport
        });
        
        // 保存到用户历史记录
        await db.collection('user-interview-history').add(userHistoryData);
        
        res.status(200).json({ 
            finalReport,
            message: 'System design interview completed successfully'
        });
    } catch (error) {
        console.error("Error ending system design interview:", error);
        res.status(500).json({ message: `Failed to end interview: ${error.message}` });
    }
};

// --- 音频转录功能 ---
exports.transcribeAudio = async (req, res) => {
    if (!req.files || !req.files.audio) {
        return res.status(400).json({ message: 'Audio file is required' });
    }
    
    const audioFile = req.files.audio;
    
    try {
        // 这里应该集成实际的语音识别API，如Google Speech-to-Text, Azure Speech Services等
        // 为了演示，我们使用一个模拟的转录结果
        
        const transcriptionPrompt = `
            This is a placeholder for audio transcription. In a real implementation, you would:
            1. Send the audio file to a speech-to-text service
            2. Get the transcription result
            3. Return the transcribed text
            
            For now, we'll simulate a transcription result.
        `;
        
        // 模拟转录结果
        const mockTranscription = "这是一个模拟的语音转录结果。在实际实现中，这里应该是真实的语音识别结果。";
        
        res.status(200).json({ 
            transcription: mockTranscription,
            confidence: 0.95,
            message: 'Audio transcribed successfully'
        });
    } catch (error) {
        console.error("Error transcribing audio:", error);
        res.status(500).json({ message: `Failed to transcribe audio: ${error.message}` });
    }
};

// --- 用户历史记录 ---
exports.getUserHistory = async (req, res) => {
    try {
        // 从用户历史记录集合中获取数据
        const historySnapshot = await db.collection('user-interview-history')
            .orderBy('startTime', 'desc')
            .limit(50) // 限制返回最近50条记录
            .get();
        
        const history = [];
        historySnapshot.forEach(doc => {
            history.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        res.status(200).json({ 
            history,
            message: 'User history retrieved successfully'
        });
    } catch (error) {
        console.error("Error getting user history:", error);
        res.status(500).json({ message: `Failed to get user history: ${error.message}` });
    }
};
