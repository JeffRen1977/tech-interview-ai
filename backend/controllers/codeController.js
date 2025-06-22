const fetch = require('node-fetch');
const admin = require('firebase-admin');

const db = admin.firestore();

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
