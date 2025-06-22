const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

// --- 初始化 ---
const app = express();
app.use(cors());
app.use(express.json());

// 初始化 Firebase Admin SDK
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    console.error("Firebase Admin SDK 初始化失败。", error);
    process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

// --- API 路由 ---
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const userRecord = await auth.createUser({ email, password });
        await db.collection('users').doc(userRecord.uid).set({
            email: userRecord.email,
            createdAt: new Date()
        });
        res.status(201).json({ message: 'User created successfully', uid: userRecord.uid, email: userRecord.email });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const userRecord = await auth.getUserByEmail(email);
        res.status(200).json({ message: 'Login successful', uid: userRecord.uid, email: userRecord.email });
    } catch (error) {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});


function extractJson(text) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("Could not find a valid JSON object in the API response.");
    }
    return text.substring(firstBrace, lastBrace + 1);
}

// --- 问题生成与存储 API ---
app.post('/api/questions/generate-coding', async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        return res.status(500).json({ message: 'Gemini API key is not configured on the server. Please check your .env file.' });
    }
    
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    const prompt = `
        Act as an expert computer science tutor. Based on the following interview problem, generate a detailed analysis.
        Problem Title: "${title}"
        Problem Description: "${description}"

        Provide the output in a single, clean JSON object format. Do not include any text outside of the JSON object, not even the opening and closing \`\`\`json markdown tags.
        
        The JSON object must have the following exact structure:
        {
          "questionId": "A unique, URL-friendly string ID based on the title (e.g., 'two-sum').",
          "title": "\${title}",
          "description": "\${description}",
          "example": "A concise example with input and output, clearly formatted with newlines.",
          "solution": "A correct and well-commented Python solution, formatted as a single string with escaped newlines (\\\\n).",
          "explanation": "A detailed, step-by-step explanation of the solution's logic.",
          "testCases": "A block of Python code as a string with a 'main' function to test the solution. Include a few meaningful edge cases. Use escaped newlines (\\\\n).",
          "complexity": { "time": "The time complexity (e.g., O(N)).", "space": "The space complexity (e.g., O(1))." },
          "dataStructures": ["List", "of", "relevant", "data", "structures"],
          "algorithms": ["List", "of", "relevant", "algorithms"],
          "difficulty": "Easy, Medium, or Hard"
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
        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error("Could not find a valid JSON object in the API response.");
        }
        
        const jsonText = responseText.substring(firstBrace, lastBrace + 1);
        const questionData = JSON.parse(jsonText);
        
        res.status(200).json({ questionData });

    } catch (error) {
        console.error("Error calling AI or parsing response:", error);
        res.status(500).json({ message: `Failed to generate question from AI model: ${error.message}` });
    }
});

app.post('/api/questions/save-coding', async (req, res) => {
    const { questionData } = req.body;
    if (!questionData || !questionData.questionId) {
        return res.status(400).json({ message: 'Valid question data is required.' });
    }
    try {
        await db.collection('coding-questions').doc(questionData.questionId).set(questionData);
        res.status(201).json({ message: `Question "${questionData.title}" saved successfully!` });
    } catch (error) {
        console.error("Error saving to Firestore:", error);
        res.status(500).json({ message: 'Failed to save question to database.' });
    }
});

app.post('/api/questions/generate-system', async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    const prompt = `
        Act as a senior system architect. Based on the following design problem, provide a detailed solution.
        Problem Title: "${title}"
        Core Description: "${description}"

        Provide the output in a single, clean JSON object format. Do not include any text outside of the JSON object.
        
        The JSON object must have the following structure:
        {
          "title": "${title}",
          "description": "${description}",
          "category": "A relevant category like 'Large Model Design', 'Object-Oriented Design', 'Machine Learning Design', or 'General System Design'.",
          "detailedAnswer": "A detailed, well-structured answer in markdown format. Use escaped newlines (\\\\n) and markdown elements like headers (e.g., ### Core Components) and lists.",
          "tags": ["relevant", "keywords"]
        }
    `;

    try {
        const geminiResponse = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
        });

        if (!geminiResponse.ok) throw new Error(`Gemini API request failed: ${await geminiResponse.text()}`);

        const geminiData = await geminiResponse.json();
        // **FIX:** Using the robust JSON extraction helper function.
        const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
        const questionData = JSON.parse(jsonText); 
        
        res.status(200).json({ questionData });
    } catch (error) {
        console.error("Error generating system design question:", error);
        res.status(500).json({ message: `Failed to generate question: ${error.message}` });
    }
});

app.post('/api/questions/save-system-design', async (req, res) => {
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
        console.error("Error saving to Firestore:", error);
        res.status(500).json({ message: 'Failed to save question to database.' });
    }
});

// -- 行为面试题 (新增) --
app.post('/api/questions/generate-behavioral', async (req, res) => {
    const { skill } = req.body;
    if (!skill) {
        return res.status(400).json({ message: 'Skill is required' });
    }
    // TODO: (此处可以添加调用Gemini生成问题的逻辑)
    // For now, we will just create a simple question structure
    const questionData = {
        title: `Tell me about a time you demonstrated ${skill}`,
        prompt: `Describe a situation where you had to use your ${skill} skills. What was the context, what did you do, and what was the result?`,
        category: 'Behavioral',
        tags: [skill.toLowerCase()]
    };
    res.status(200).json({ questionData });
});

app.post('/api/questions/save-behavioral', async (req, res) => {
    const { questionData } = req.body;
    if (!questionData || !questionData.title) {
        return res.status(400).json({ message: 'Valid question data is required.' });
    }
    try {
        const docId = questionData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (!docId) {
            return res.status(400).json({ message: 'A valid ID could not be generated from the title.' });
        }
        await db.collection('behavioral-questions').doc(docId).set(questionData);
        res.status(201).json({ message: `Behavioral question "${questionData.title}" saved successfully!` });
    } catch (error) {
        console.error("Error saving to Firestore:", error);
        res.status(500).json({ message: 'Failed to save question to database.' });
    }
});


// --- 启动服务器 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
