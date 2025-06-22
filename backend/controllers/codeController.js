const fetch = require('node-fetch');
const { db } = require('../config/firebase');

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
        const snapshot = await db.collection('coding-questions').get();
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
        const snapshot = await db.collection('user-learning-history')
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
    const { userId, questionId, feedback, userCode, language, completedAt } = req.body;
    
    if (!userId || !questionId) {
        return res.status(400).json({ message: "User ID and Question ID are required." });
    }

    try {
        const historyData = {
            userId,
            questionId,
            feedback,
            userCode,
            language,
            completedAt: completedAt || new Date(),
            savedAt: new Date()
        };

        const docRef = await db.collection('user-learning-history').add(historyData);
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
        await db.collection('user-learning-history').doc(historyId).delete();
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
        let query = db.collection('coding-questions');
        
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
            const historySnapshot = await db.collection('user-learning-history')
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
        const snapshot = await db.collection('coding-questions').get();
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
