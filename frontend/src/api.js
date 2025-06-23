export async function apiRequest(endpoint, method, body) {
    const url = `http://localhost:3000/api${endpoint}`;
    console.log(`DEBUG: Making API request to ${url}`);
    console.log(`DEBUG: Method: ${method}`);
    console.log(`DEBUG: Body:`, body);
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : null,
        });
        
        console.log(`DEBUG: Response status: ${response.status}`);
        console.log(`DEBUG: Response headers:`, Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log(`DEBUG: Response data:`, data);
        
        if (!response.ok) {
            // 如果请求失败，抛出一个包含后端错误信息的错误
            throw new Error(data.message || 'An unknown error occurred');
        }
        
        return data;
    } catch (error) {
        console.error(`API Request Error on ${endpoint}:`, error);
        // 将错误继续向上抛出，让调用者处理
        throw error;
    }
}

// Resume API functions
export const resumeAPI = {
    // Analyze resume and provide optimization suggestions
    analyzeResume: async (resumeText, jobDescription = '') => {
        return await apiRequest('/resume/analyze', 'POST', {
            resumeText,
            jobDescription
        });
    },

    // Assess JD matching and calculate matching degree
    assessJDMatching: async (resumeText, jobDescription) => {
        return await apiRequest('/resume/match', 'POST', {
            resumeText,
            jobDescription
        });
    },

    // Generate customized cover letter
    generateCoverLetter: async (resumeText, jobDescription, companyName, positionTitle, companyCulture = '') => {
        return await apiRequest('/resume/cover-letter', 'POST', {
            resumeText,
            jobDescription,
            companyName,
            positionTitle,
            companyCulture
        });
    }
};

// Wrong Question Book API
export const wrongQuestionAPI = {
  getWrongQuestions: async () => {
    return await apiRequest('/wrong-questions', 'GET');
  },
  getAIFeedback: async (id) => {
    return await apiRequest(`/wrong-questions/${id}/ai-feedback`, 'POST');
  }
};
