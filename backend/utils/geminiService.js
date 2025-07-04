const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function extractJson(text) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("Could not find a valid JSON object in the API response.");
    }
    return text.substring(firstBrace, lastBrace + 1);
}

async function callGeminiAPI(prompt) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file or environment variables.');
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

exports.generateCodingQuestion = async function(difficulty = 'medium') {
    const prompt = `
        Act as an expert computer science interviewer. Generate a new coding interview question for a candidate.
        Difficulty: ${difficulty}
        Please provide the output in a single, clean JSON object format:
        {
          "title": "...",
          "description": "...",
          "example": "...",
          "solution": "...",
          "explanation": "...",
          "testCases": "...",
          "complexity": { "time": "...", "space": "..." },
          "dataStructures": [...],
          "algorithms": [...],
          "difficulty": "${difficulty}"
        }
    `;
    const geminiData = await callGeminiAPI(prompt);
    const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
    const questionData = JSON.parse(jsonText);
    return questionData;
};

exports.generateSystemDesignQuestion = async function(difficulty = 'medium') {
    const prompt = `
        Act as a senior system architect. Generate a new system design interview question for a candidate.
        Difficulty: ${difficulty}
        Please provide the output in a single, clean JSON object format:
        {
          "title": "...",
          "description": "...",
          "category": "...",
          "detailedAnswer": "...",
          "tags": [...],
          "difficulty": "${difficulty}"
        }
    `;
    const geminiData = await callGeminiAPI(prompt);
    const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
    const questionData = JSON.parse(jsonText);
    return questionData;
};

exports.generateBehavioralQuestion = async function(difficulty = 'medium') {
    const prompt = `
        Act as an expert behavioral interviewer. Generate a new behavioral interview question for a candidate.
        Difficulty: ${difficulty}
        Please provide the output in a single, clean JSON object format:
        {
          "title": "...",
          "prompt": "...",
          "category": "...",
          "sampleAnswer": "...",
          "difficulty": "${difficulty}"
        }
    `;
    const geminiData = await callGeminiAPI(prompt);
    const jsonText = extractJson(geminiData.candidates[0].content.parts[0].text);
    const questionData = JSON.parse(jsonText);
    return questionData;
}; 