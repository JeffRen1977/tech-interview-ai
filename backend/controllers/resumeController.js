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

require('dotenv').config();

// Resume Analyzer - Analyze resume and provide optimization suggestions
const analyzeResume = async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;
        const geminiApiKey = process.env.GEMINI_API_KEY;
        
        if (!resumeText) {
            return res.status(400).json({ error: 'Resume text is required' });
        }

        const prompt = `
        Analyze the following resume and provide optimization suggestions for the job description:
        
        RESUME:
        ${resumeText}
        
        JOB DESCRIPTION:
        ${jobDescription || 'General optimization'}
        
        Please provide:
        1. Overall assessment of the resume
        2. Specific optimization suggestions
        3. Recommended modifications
        4. Skills to highlight or add
        5. Experience improvements
        6. Formatting suggestions
        
        Format your response as JSON with the following structure:
        {
            "overallAssessment": "string",
            "optimizationSuggestions": ["array of suggestions"],
            "recommendedModifications": ["array of modifications"],
            "skillsToHighlight": ["array of skills"],
            "experienceImprovements": ["array of improvements"],
            "formattingSuggestions": ["array of formatting tips"]
        }
        `;

        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]) {
            let analysisText = data.candidates[0].content.parts[0].text;
            let analysis;
            
            // Clean the text before parsing to remove markdown code blocks
            if (analysisText.startsWith('```json')) {
                analysisText = analysisText.substring(7, analysisText.length - 3).trim();
            } else if (analysisText.startsWith('```')) {
                analysisText = analysisText.substring(3, analysisText.length - 3).trim();
            }

            try {
                analysis = JSON.parse(analysisText);
            } catch (e) {
                analysis = {
                    overallAssessment: analysisText,
                    optimizationSuggestions: [],
                    recommendedModifications: [],
                    skillsToHighlight: [],
                    experienceImprovements: [],
                    formattingSuggestions: []
                };
            }
            
            res.json({ success: true, analysis });
        } else {
            console.error("Gemini API Error:", data.error);
            res.status(500).json({ error: 'Failed to analyze resume' });
        }
    } catch (error) {
        console.error('Resume analysis error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// JD Matching Assessment - Analyze job description and calculate matching degree
const assessJDMatching = async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;
        const geminiApiKey = process.env.GEMINI_API_KEY;
        
        if (!resumeText || !jobDescription) {
            return res.status(400).json({ error: 'Both resume text and job description are required' });
        }

        const prompt = `
        Analyze the matching degree between the resume and job description, and provide reinforcement suggestions:
        
        RESUME:
        ${resumeText}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        Please provide:
        1. Overall matching score (0-100)
        2. Detailed matching analysis by category
        3. Missing skills that should be added
        4. Project suggestions to improve matching
        5. Experience gaps and how to address them
        6. Specific reinforcement points
        
        Format your response as JSON with the following structure:
        {
            "matchingScore": number,
            "matchingAnalysis": {
                "skills": { "score": number, "details": "string" },
                "experience": { "score": number, "details": "string" },
                "education": { "score": number, "details": "string" },
                "projects": { "score": number, "details": "string" }
            },
            "missingSkills": ["array of missing skills"],
            "projectSuggestions": ["array of project suggestions"],
            "experienceGaps": ["array of gaps and solutions"],
            "reinforcementPoints": ["array of reinforcement suggestions"]
        }
        `;

        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]) {
            let assessmentText = data.candidates[0].content.parts[0].text;
            let assessment;
            
            // Clean the text before parsing
            if (assessmentText.startsWith('```json')) {
                assessmentText = assessmentText.substring(7, assessmentText.length - 3).trim();
            } else if (assessmentText.startsWith('```')) {
                assessmentText = assessmentText.substring(3, assessmentText.length - 3).trim();
            }
            
            try {
                assessment = JSON.parse(assessmentText);
            } catch (e) {
                assessment = {
                    matchingScore: 0,
                    matchingAnalysis: {},
                    missingSkills: [],
                    projectSuggestions: [],
                    experienceGaps: [],
                    reinforcementPoints: []
                };
            }
            
            res.json({ success: true, assessment });
        } else {
            console.error("Gemini API Error:", data.error);
            res.status(500).json({ error: 'Failed to assess JD matching' });
        }
    } catch (error) {
        console.error('JD matching assessment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Cover Letter Generator - Generate customized cover letters
const generateCoverLetter = async (req, res) => {
    try {
        const { resumeText, jobDescription, companyName, positionTitle, companyCulture } = req.body;
        const geminiApiKey = process.env.GEMINI_API_KEY;
        
        if (!resumeText || !jobDescription || !companyName || !positionTitle) {
            return res.status(400).json({ error: 'Resume text, job description, company name, and position title are required' });
        }

        const prompt = `
        Generate a customized cover letter based on the following information:
        
        RESUME:
        ${resumeText}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        COMPANY NAME: ${companyName}
        POSITION TITLE: ${positionTitle}
        COMPANY CULTURE: ${companyCulture || 'Not specified'}
        
        Please create a professional cover letter that:
        1. Addresses the specific requirements in the job description
        2. Highlights relevant experience from the resume
        3. Shows enthusiasm for the company and position
        4. Is tailored to the company culture if provided
        5. Includes a strong opening and closing
        
        Format your response as JSON with the following structure:
        {
            "coverLetter": "full cover letter text",
            "keyHighlights": ["array of key points highlighted"],
            "customizationNotes": "explanation of how the letter was customized"
        }
        `;
        
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]) {
            let coverLetterText = data.candidates[0].content.parts[0].text;
            let coverLetter;
            
            // Clean the text before parsing
            if (coverLetterText.startsWith('```json')) {
                coverLetterText = coverLetterText.substring(7, coverLetterText.length - 3).trim();
            } else if (coverLetterText.startsWith('```')) {
                coverLetterText = coverLetterText.substring(3, coverLetterText.length - 3).trim();
            }
            
            try {
                coverLetter = JSON.parse(coverLetterText);
            } catch (e) {
                coverLetter = {
                    coverLetter: coverLetterText,
                    keyHighlights: [],
                    customizationNotes: "Generated based on resume and job description"
                };
            }
            
            res.json({ success: true, coverLetter });
        } else {
            console.error("Gemini API Error:", data.error);
            res.status(500).json({ error: 'Failed to generate cover letter' });
        }
    } catch (error) {
        console.error('Cover letter generation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    analyzeResume,
    assessJDMatching,
    generateCoverLetter
}; 