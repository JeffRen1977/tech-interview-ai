// 使用动态导入来支持 node-fetch v3
let fetch;
const express = require('express');
const { getDb } = require('../config/firebase');

// 初始化 fetch
(async () => {
    try {
        const nodeFetch = await import('node-fetch');
        fetch = nodeFetch.default;
    } catch (error) {
        console.error('Failed to load node-fetch:', error);
    }
})();

// 确保fetch在模块加载时就初始化
setTimeout(async () => {
    if (!fetch) {
        try {
            const nodeFetch = await import('node-fetch');
            fetch = nodeFetch.default;
        } catch (error) {
            console.error('Failed to load node-fetch in timeout:', error);
        }
    }
}, 1000);

// 帮助函数: 从可能包含Markdown的文本中稳健地提取JSON对象
function extractJson(text) {
    // 寻找第一个 '{' 和最后一个 '}' 来定位JSON对象的边界
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
        // 如果在响应中找不到有效的JSON对象，则抛出错误
        throw new Error("Could not find a valid JSON object in the API response.");
    }
    
    // 提取JSON字符串
    return text.substring(firstBrace, lastBrace + 1);
}

// 获取所有编程题
exports.getCodingQuestions = async (req, res) => {
    try {
        const snapshot = await getDb().collection('coding-questions').get();
        const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ questions });
    } catch (error) {
        console.error("Error fetching coding questions:", error);
        res.status(500).json({ message: "Failed to fetch coding questions." });
    }
};

// 执行代码（模拟编译和运行测试用例）
exports.executeCode = async (req, res) => {
    const { userCode, language, testCases } = req.body;
    console.log("Executing code...");
    try {
        // 模拟: 70% 的概率编译和测试通过
        const success = Math.random() > 0.3; 
        if (success) {
            res.status(200).json({ success: true, message: "所有测试用例通过！" });
        } else {
            res.status(200).json({ success: false, message: "编译错误或部分测试用例未通过。" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: `执行时发生服务器错误: ${error.message}` });
    }
};

// 提交代码以供AI分析
exports.submitCodeForAnalysis = async (req, res) => {
    // 确保 fetch 已经加载
    if (!fetch) {
        try {
            const nodeFetch = await import('node-fetch');
            fetch = nodeFetch.default;
        } catch (error) {
            console.error('Failed to load node-fetch:', error);
            return res.status(500).json({ message: "Failed to initialize fetch library." });
        }
    }

    const { question, userCode, language } = req.body;
    if (!question || !userCode || !language) {
        return res.status(400).json({ message: "Missing required fields for code submission." });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

    // **FIX:** 优化了Prompt，更严格地要求JSON格式并强调转义
    const prompt = `
        Act as an expert code reviewer for a job interview practice platform.
        Analyze the following code submission for the problem described below.

        Problem Title: "${question.title}"
        Problem Description: "${question.description}"

        User's Code (${language}):
        \`\`\`${language}
        ${userCode}
        \`\`\`

        Provide a concise analysis in a single, valid JSON object format. 
        Do not include any text, comments, or markdown formatting like \`\`\`json outside of the JSON object itself.
        Ensure that any double quotes within the JSON string values (especially in the 'aiAnalysis' field) are properly escaped with a backslash (\\").

        The JSON object must have the following structure:
        {
          "complexity": { "time": "The time complexity of the user's code, e.g., O(N)", "space": "The space complexity, e.g., O(1)" },
          "aiAnalysis": "A constructive code review in Chinese. Start with an overall evaluation, then list specific strengths (优点) and areas for improvement (改进建议). Be encouraging and professional."
        }
    `;

    try {
        const geminiResponse = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
        });
        
        if (!geminiResponse.ok) {
             const errorText = await geminiResponse.text();
             throw new Error(`Gemini API request failed with status ${geminiResponse.status}: ${errorText}`);
        }
        
        const geminiData = await geminiResponse.json();
        const responseText = geminiData.candidates[0].content.parts[0].text;
        
        // **FIX:** 使用更稳健的JSON提取和解析逻辑
        const jsonText = extractJson(responseText);
        const analysisData = JSON.parse(jsonText);
        console.log("--- Raw response from Gemini API ---");
        console.log(analysisData);
        console.log("------------------------------------");
        // 模拟测试结果
        const passed = Math.random() > 0.3;
        
        res.status(200).json({
            testResults: {
                passed: passed,
                summary: passed ? "10/10 测试用例通过" : "7/10 测试用例通过"
            },
            ...analysisData
        });

    } catch (error) {
        console.error("Error calling AI or parsing response:", error);
        res.status(500).json({ message: `Failed to analyze code: ${error.message}` });
    }
};

// 获取用户学习历史
exports.getUserLearningHistory = async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }

    try {
        const snapshot = await getDb().collection('user-learning-history')
            .where('userId', '==', userId)
            .get();
        
        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ history });
    } catch (error) {
        console.error("Error fetching user learning history:", error);
        res.status(500).json({ message: "Failed to fetch learning history." });
    }
};

// 保存问题到用户学习历史
exports.saveToLearningHistory = async (req, res) => {
    const { questionId, feedback, userCode, language, completedAt } = req.body;
    const userId = req.user.email; // 用邮箱作为userId
    
    console.log("Saving to learning history with data:", {
        userId,
        questionId,
        feedback: feedback ? Object.keys(feedback) : 'no feedback',
        userCodeLength: userCode ? userCode.length : 0,
        language,
        completedAt
    });
    
    if (!questionId) {
        return res.status(400).json({ message: "Question ID is required." });
    }

    try {
        let questionData = null;
        
        // 检查questionId是否是有效的Firestore文档ID（通常包含字母、数字、连字符，长度在1-1500之间）
        const isValidFirestoreId = /^[a-zA-Z0-9_-]{1,1500}$/.test(questionId);
        
        if (isValidFirestoreId) {
            // 尝试从数据库获取题目详情
            try {
                const questionDoc = await getDb().collection('coding-questions').doc(questionId).get();
                if (questionDoc.exists) {
                    questionData = questionDoc.data();
                    console.log("Found question in database:", questionData.title);
                }
            } catch (dbError) {
                console.log("Question not found in database or invalid ID:", questionId);
            }
        }
        
        // 如果没有找到题目数据，创建一个基本的题目数据结构
        if (!questionData) {
            console.log("Using fallback question data structure for:", questionId);
            questionData = {
                title: questionId, // 使用questionId作为title
                description: 'Mock interview question',
                difficulty: 'medium',
                topic: 'programming',
                algorithms: [],
                dataStructures: []
            };
        }
        
        console.log("Question data keys:", Object.keys(questionData));
        
        // 清理数据，移除 undefined 值并确保所有字段都有有效值
        const cleanQuestionData = {
            title: questionData.title || questionId,
            description: questionData.description || '',
            difficulty: questionData.difficulty || 'medium',
            topic: questionData.topic || 'programming',
            algorithms: Array.isArray(questionData.algorithms) ? questionData.algorithms : [],
            dataStructures: Array.isArray(questionData.dataStructures) ? questionData.dataStructures : []
        };

        // 确保feedback是一个有效的对象
        let cleanFeedback = {};
        if (feedback && typeof feedback === 'object') {
            // 只保留有效的字段
            if (feedback.complexity && typeof feedback.complexity === 'object') {
                cleanFeedback.complexity = {
                    time: feedback.complexity.time || '',
                    space: feedback.complexity.space || ''
                };
            }
            if (feedback.aiAnalysis && typeof feedback.aiAnalysis === 'string') {
                cleanFeedback.aiAnalysis = feedback.aiAnalysis;
            }
            if (feedback.testResults && typeof feedback.testResults === 'object') {
                cleanFeedback.testResults = {
                    passed: Boolean(feedback.testResults.passed),
                    summary: feedback.testResults.summary || ''
                };
            }
        }

        const historyData = {
            userId,
            questionId,
            questionData: cleanQuestionData,
            userCode: userCode || '',
            language: language || 'javascript',
            feedback: cleanFeedback,
            completedAt: completedAt ? new Date(completedAt) : new Date(),
            savedAt: new Date(),
            interviewType: 'coding'
        };

        console.log("Final history data structure:", {
            userId: historyData.userId,
            questionId: historyData.questionId,
            questionDataKeys: Object.keys(historyData.questionData),
            userCodeLength: historyData.userCode.length,
            feedbackKeys: Object.keys(historyData.feedback),
            completedAt: historyData.completedAt,
            savedAt: historyData.savedAt,
            interviewType: historyData.interviewType
        });

        const docRef = await getDb().collection('user-learning-history').add(historyData);
        res.status(200).json({ 
            message: "Problem saved to learning history successfully.",
            historyId: docRef.id 
        });
    } catch (error) {
        console.error("Error saving to learning history:", error);
        res.status(500).json({ message: "Failed to save to learning history." });
    }
};

// 从用户学习历史中移除问题
exports.removeFromLearningHistory = async (req, res) => {
    const { historyId } = req.params;
    
    if (!historyId) {
        return res.status(400).json({ message: "History ID is required." });
    }

    try {
        await getDb().collection('user-learning-history').doc(historyId).delete();
        res.status(200).json({ message: "Problem removed from learning history successfully." });
    } catch (error) {
        console.error("Error removing from learning history:", error);
        res.status(500).json({ message: "Failed to remove from learning history." });
    }
};

// 获取过滤后的编程题（排除已完成的）
exports.getFilteredCodingQuestions = async (req, res) => {
    const { userId, difficulty, algorithms, dataStructures, companies } = req.query;
    
    try {
        let query = getDb().collection('coding-questions');
        
        // Apply filters
        if (difficulty) {
            query = query.where('difficulty', '==', difficulty);
        }
        
        // Get all questions first (Firestore doesn't support array-contains-any with multiple fields)
        const snapshot = await query.get();
        let questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Apply additional filters in memory
        if (algorithms) {
            const algorithmList = algorithms.split(',');
            questions = questions.filter(q => 
                q.algorithms && algorithmList.some(alg => 
                    q.algorithms.some(qAlg => qAlg.toLowerCase().includes(alg.toLowerCase()))
                )
            );
        }
        
        if (dataStructures) {
            const dsList = dataStructures.split(',');
            questions = questions.filter(q => 
                q.dataStructures && dsList.some(ds => 
                    q.dataStructures.some(qDs => qDs.toLowerCase().includes(ds.toLowerCase()))
                )
            );
        }
        
        if (companies) {
            const companyList = companies.split(',');
            questions = questions.filter(q => 
                q.companies && companyList.some(company => 
                    q.companies.some(qCompany => qCompany.toLowerCase().includes(company.toLowerCase()))
                )
            );
        }
        
        // Filter out completed questions if userId is provided
        if (userId) {
            const historySnapshot = await getDb().collection('user-learning-history')
                .where('userId', '==', userId)
                .get();
            
            const completedQuestionIds = historySnapshot.docs.map(doc => doc.data().questionId);
            questions = questions.filter(q => !completedQuestionIds.includes(q.id));
        }
        
        res.status(200).json({ 
            questions,
            total: questions.length,
            filters: { difficulty, algorithms, dataStructures, companies }
        });
    } catch (error) {
        console.error("Error fetching filtered coding questions:", error);
        res.status(500).json({ message: "Failed to fetch filtered questions." });
    }
};

// 获取可用的过滤选项
exports.getFilterOptions = async (req, res) => {
    try {
        const snapshot = await getDb().collection('coding-questions').get();
        const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Extract unique values
        const difficulties = [...new Set(questions.map(q => q.difficulty).filter(Boolean))];
        const algorithms = [...new Set(questions.flatMap(q => q.algorithms || []))];
        const dataStructures = [...new Set(questions.flatMap(q => q.dataStructures || []))];
        const companies = [...new Set(questions.flatMap(q => q.companies || []))];
        
        res.status(200).json({
            difficulties,
            algorithms,
            dataStructures,
            companies
        });
    } catch (error) {
        console.error("Error fetching filter options:", error);
        res.status(500).json({ message: "Failed to fetch filter options." });
    }
};

// 获取错题本数据
exports.getWrongQuestions = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // 从user-learning-history获取数据
        const learningHistorySnapshot = await getDb().collection('user-learning-history')
            .where('userId', '==', userId)
            .orderBy('completedAt', 'desc')
            .get();
        
        // 从user-interview-history获取数据
        const interviewHistorySnapshot = await getDb().collection('user-interview-history')
            .where('userId', '==', userId)
            .orderBy('endTime', 'desc')
            .get();
        
        const wrongQuestions = [];
        
        // 处理学习历史数据
        learningHistorySnapshot.forEach(doc => {
            const data = doc.data();
            wrongQuestions.push({
                id: doc.id,
                type: 'learning',
                interviewType: data.interviewType || 'unknown',
                questionData: data.questionData || {},
                userAnswer: data.userAnswer || data.userCode || '',
                feedback: data.feedback || {},
                completedAt: data.completedAt,
                savedAt: data.savedAt
            });
        });
        
        // 处理面试历史数据
        interviewHistorySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.userSolutions && data.userSolutions.length > 0) {
                data.userSolutions.forEach((solution, index) => {
                    wrongQuestions.push({
                        id: `${doc.id}_${index}`,
                        type: 'interview',
                        interviewType: data.interviewType || 'unknown',
                        questionData: data.questionData || {},
                        userAnswer: solution.solution || '',
                        feedback: solution.feedback || {},
                        completedAt: solution.timestamp || data.endTime,
                        savedAt: data.endTime
                    });
                });
            }
        });
        
        // 按完成时间排序
        wrongQuestions.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        
        console.log(`Found ${wrongQuestions.length} wrong questions for user ${userId}`);
        
        res.status(200).json({ 
            wrongQuestions,
            message: 'Wrong questions retrieved successfully'
        });
    } catch (error) {
        console.error("Error fetching wrong questions:", error);
        res.status(500).json({ message: "Failed to fetch wrong questions." });
    }
};
