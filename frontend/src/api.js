// 获取token的辅助函数
const getToken = () => {
    return localStorage.getItem('token');
};

// 检查token是否有效
const isTokenValid = () => {
    const token = getToken();
    if (!token) return false;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch (error) {
        return false;
    }
};

// 清除认证信息
export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export async function apiRequest(endpoint, method, body) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    // 确保 baseUrl 不以斜杠结尾，避免双斜杠问题
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const url = `${cleanBaseUrl}/api${endpoint}`;
    console.log(`DEBUG: Making API request to ${url}`);
    console.log(`DEBUG: Method: ${method}`);
    console.log(`DEBUG: Body:`, body);
    
    // 准备请求头
    const headers = { 'Content-Type': 'application/json' };
    
    // 如果是需要认证的请求，添加token
    const token = getToken();
    if (token && isTokenValid()) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body ? JSON.stringify(body) : null,
        });
        
        console.log(`DEBUG: Response status: ${response.status}`);
        console.log(`DEBUG: Response headers:`, Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log(`DEBUG: Response data:`, data);
        
        if (!response.ok) {
            // 如果是401错误且不是登录请求，才清除认证信息
            if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
                clearAuth();
                // 重定向到登录页面
                window.location.reload();
            }
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

// 认证相关的API函数
export const authAPI = {
    // 获取当前用户信息
    getCurrentUser: async () => {
        return await apiRequest('/auth/me', 'GET');
    },
    
    // 更新用户资料
    updateProfile: async (profileData) => {
        return await apiRequest('/auth/profile', 'PUT', profileData);
    },
    
    // 修改密码
    changePassword: async (currentPassword, newPassword) => {
        return await apiRequest('/auth/change-password', 'PUT', {
            currentPassword,
            newPassword
        });
    }
};

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
        return await apiRequest('/resume/jd-matching', 'POST', {
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

// System Design API
export const systemDesignAPI = {
  getAllQuestions: async () => {
    return await apiRequest('/system-design/questions', 'GET');
  },
  getFilteredQuestions: async (filters) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/system-design/questions/filtered?${queryParams}`, 'GET');
  },
  getQuestionById: async (id) => {
    return await apiRequest(`/system-design/questions/${id}`, 'GET');
  },
  analyzeSolution: async (questionData, whiteboardData, voiceInput, timeSpent) => {
    return await apiRequest('/system-design/analyze', 'POST', {
      questionData,
      whiteboardData,
      voiceInput,
      timeSpent
    });
  }
};

// Behavioral API
export const behavioralAPI = {
  getAllQuestions: async () => {
    return await apiRequest('/behavioral/questions', 'GET');
  },
  getFilteredQuestions: async (filters) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/behavioral/questions/filtered?${queryParams}`, 'GET');
  },
  getQuestionById: async (id) => {
    return await apiRequest(`/behavioral/questions/${id}`, 'GET');
  },
  analyzeAnswer: async (questionId, userAnswer, question) => {
    return await apiRequest('/behavioral/analyze', 'POST', {
      questionId,
      userAnswer,
      question
    });
  }
};

// Mock Interview API
export const mockInterviewAPI = {
  // 获取数据库中的题目
  getCodingQuestions: async (difficulty = 'all') => {
    const queryParams = new URLSearchParams({ difficulty }).toString();
    return await apiRequest(`/mock/coding-questions?${queryParams}`, 'GET');
  },
  
  getSystemDesignQuestions: async (difficulty = 'all') => {
    const queryParams = new URLSearchParams({ difficulty }).toString();
    return await apiRequest(`/mock/system-design-questions?${queryParams}`, 'GET');
  },
  
  getBehavioralQuestions: async (difficulty = 'all') => {
    const queryParams = new URLSearchParams({ difficulty }).toString();
    return await apiRequest(`/mock/behavioral-questions?${queryParams}`, 'GET');
  },
  
  // 获取AI生成的题目
  getAICodingQuestions: async (difficulty = 'all') => {
    const queryParams = new URLSearchParams({ difficulty }).toString();
    return await apiRequest(`/mock/ai-coding-questions?${queryParams}`, 'GET');
  },
  
  getAISystemDesignQuestions: async (difficulty = 'all') => {
    const queryParams = new URLSearchParams({ difficulty }).toString();
    return await apiRequest(`/mock/ai-system-design-questions?${queryParams}`, 'GET');
  },
  
  getAIBehavioralQuestions: async (difficulty = 'all') => {
    const queryParams = new URLSearchParams({ difficulty }).toString();
    return await apiRequest(`/mock/ai-behavioral-questions?${queryParams}`, 'GET');
  },
  
  // AI生成新题目
  generateQuestion: async (type, difficulty, saveToDatabase = false) => {
    return await apiRequest('/mock/ai-generate', 'POST', {
      type,
      difficulty,
      saveToDatabase
    });
  },
  
  // 保存模拟面试结果到用户面试历史
  saveInterviewResult: async (questionId, questionData, userSolution, feedback, interviewType, timeSpent = 0, completedAt) => {
    return await apiRequest('/mock/save-interview-result', 'POST', {
      questionId,
      questionData,
      userSolution,
      feedback,
      interviewType,
      timeSpent,
      completedAt
    });
  }
};

// Programming Practice API
export const programmingAPI = {
  // 获取编程题
  getQuestions: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/questions/coding?${queryParams}`, 'GET');
  },
  
  // 获取过滤后的编程题
  getFilteredQuestions: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/questions/coding/filtered?${queryParams}`, 'GET');
  },
  
  // 获取过滤选项
  getFilterOptions: async () => {
    return await apiRequest('/questions/coding/filter-options', 'GET');
  },
  
  // 提交代码进行AI分析
  submitForAnalysis: async (question, userCode, language) => {
    return await apiRequest('/code/submit', 'POST', {
      question,
      userCode,
      language
    });
  },
  
  // 保存到学习历史
  saveToLearningHistory: async (questionId, feedback, userCode, language, completedAt) => {
    return await apiRequest('/code/learning-history', 'POST', {
      questionId,
      feedback,
      userCode,
      language,
      completedAt
    });
  },
  
  // 获取用户学习历史
  getLearningHistory: async (userId) => {
    return await apiRequest(`/code/learning-history/${userId}`, 'GET');
  },
  
  // 从学习历史中移除
  removeFromLearningHistory: async (historyId) => {
    return await apiRequest(`/code/learning-history/${historyId}`, 'DELETE');
  },

  // 获取错题本数据
  getWrongQuestions: async () => {
    return await apiRequest('/code/wrong-questions', 'GET');
  }
};

export const getWrongQuestions = async () => {
  return await apiRequest('/code/wrong-questions', 'GET');
};
