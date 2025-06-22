const fetch = require('node-fetch');
const admin = require('firebase-admin');

const db = admin.firestore();

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
