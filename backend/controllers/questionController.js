const fetch = require('node-fetch');
const { admin, db } = require('../config/firebase');

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
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error('Gemini API key is not configured on the server.');
    }
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    
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
        
        // 更新会话状态
        await sessionRef.update({
            status: 'completed',
            endTime: new Date(),
            finalReport
        });
        
        res.status(200).json({ 
            finalReport,
            message: 'Interview completed successfully'
        });
    } catch (error) {
        console.error("Error ending interview:", error);
        res.status(500).json({ message: `Failed to end interview: ${error.message}` });
    }
};
