import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';
import MonacoEditor from '../components/ui/MonacoEditor';
import { BookCopy, Flame, HelpCircle, Play, Send, Check, X, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../api.js';

// --- 主组件：算法练习页面 ---
const CodingPractice = () => {
    const [problems, setProblems] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [userCode, setUserCode] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState({ list: true, execution: false, submission: false });
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState('python');

    // 组件加载时从数据库获取题目
    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(prev => ({ ...prev, list: true }));
            try {
                const data = await apiRequest('/code/questions', 'GET');
                if (data.questions && data.questions.length > 0) {
                    setProblems(data.questions);
                    handleSelectProblem(data.questions[0]);
                } else {
                    setError('题库中没有编程题。');
                }
            } catch (err) {
                setError('无法加载题目列表，请稍后重试。');
            } finally {
                setIsLoading(prev => ({ ...prev, list: false }));
            }
        };
        fetchQuestions();
    }, []);

    const handleSelectProblem = (problem) => {
        // Only clear feedback if selecting a different problem
        if (selectedProblem?.id !== problem.id) {
            setFeedback(null);
            setError(null);
        }
        setSelectedProblem(problem);
        
        // Provide language-specific initial code
        const getInitialCode = (lang) => {
            switch (lang) {
                case 'python':
                    return problem.initialCode || `# 在此输入您的Python代码\n\ndef solution():\n    pass\n\n# 测试代码\nif __name__ == "__main__":\n    result = solution()\n    print(result)`;
                case 'cpp':
                    return `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\n// 在此输入您的C++代码\nclass Solution {\npublic:\n    // 在这里实现您的解决方案\n};\n\nint main() {\n    Solution solution;\n    // 在这里添加测试代码\n    return 0;\n}`;
                case 'java':
                    return `import java.util.*;\n\n// 在此输入您的Java代码\npublic class Solution {\n    // 在这里实现您的解决方案\n    \n    public static void main(String[] args) {\n        Solution solution = new Solution();\n        // 在这里添加测试代码\n    }\n}`;
                default:
                    return problem.initialCode || `# 在此输入您的代码`;
            }
        };
        
        setUserCode(getInitialCode(language));
    };
    
    // 执行代码（模拟编译和运行测试用例）
    const handleExecute = async () => {
        if (!selectedProblem) return;
        setIsLoading(prev => ({ ...prev, execution: true, submission: false }));
        setFeedback(null);
        try {
            const result = await apiRequest('/code/execute', 'POST', { 
                userCode: userCode,
                testCases: selectedProblem.testCases
            });
            setFeedback({ type: 'execution', ...result });
        } catch (error) {
            setFeedback({ type: 'execution', success: false, message: `执行出错: ${error.message}` });
        } finally {
            setIsLoading(prev => ({ ...prev, execution: false }));
        }
    };

    // 提交代码以获取AI分析
    const handleSubmitCode = async () => {
        if (!selectedProblem) return;
        
        console.log("=== SUBMISSION START ===");
        console.log("Selected problem:", selectedProblem);
        console.log("User code:", userCode);
        console.log("Language:", language);
        
        setIsLoading(prev => ({ ...prev, submission: true, execution: false }));
        setFeedback(null);
        try {
            const requestBody = {
                question: selectedProblem,
                userCode: userCode,
                language: language,
            };
            
            console.log("Sending request to backend...");
            const result = await apiRequest('/code/submit', 'POST', requestBody);
            console.log("Backend response:", result);
            
            if (!result) {
                throw new Error("Backend returned empty response");
            }
            
            const feedbackData = { type: 'submission', ...result };
            console.log("Setting feedback data:", feedbackData);
            setFeedback(feedbackData);
            console.log("Feedback state should now be updated");
            
        } catch (error) {
             console.error("Submission API call failed:", error);
             setFeedback({ type: 'submission', error: `AI分析失败: ${error.message}` });
        } finally {
            setIsLoading(prev => ({ ...prev, submission: false }));
            console.log("=== SUBMISSION END ===");
        }
    };

    // Handle language change
    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        
        // Update code template for the new language
        if (selectedProblem) {
            const getInitialCode = (lang) => {
                switch (lang) {
                    case 'python':
                        return selectedProblem.initialCode || `# 在此输入您的Python代码\n\ndef solution():\n    pass\n\n# 测试代码\nif __name__ == "__main__":\n    result = solution()\n    print(result)`;
                    case 'cpp':
                        return `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\n// 在此输入您的C++代码\nclass Solution {\npublic:\n    // 在这里实现您的解决方案\n};\n\nint main() {\n    Solution solution;\n    // 在这里添加测试代码\n    return 0;\n}`;
                    case 'java':
                        return `import java.util.*;\n\n// 在此输入您的Java代码\npublic class Solution {\n    // 在这里实现您的解决方案\n    \n    public static void main(String[] args) {\n        Solution solution = new Solution();\n        // 在这里添加测试代码\n    }\n}`;
                    default:
                        return selectedProblem.initialCode || `# 在此输入您的代码`;
                }
            };
            
            setUserCode(getInitialCode(newLanguage));
        }
    };

    return (
        <div className="flex h-full gap-8">
            <LeftSidebar problems={problems} isLoading={isLoading.list} error={error} selectedProblem={selectedProblem} onSelectProblem={handleSelectProblem} />
            <MainContentPanel 
                problem={selectedProblem} 
                userCode={userCode}
                setUserCode={setUserCode}
                feedback={feedback}
                isLoading={isLoading}
                onExecute={handleExecute}
                onSubmit={handleSubmitCode}
                language={language}
                setLanguage={handleLanguageChange}
            />
        </div>
    );
};


// --- 子组件：左侧导航与筛选 ---
const LeftSidebar = ({ problems, isLoading, error, selectedProblem, onSelectProblem }) => (
    <nav className="w-1/3 max-w-sm flex-shrink-0 flex flex-col gap-6">
        <Card className="flex-1 bg-gray-800 border-gray-700 flex flex-col">
             <CardHeader>
                <CardTitle className="text-lg">编程题库</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-2">
                {isLoading && <p className="text-gray-400 p-3">加载中...</p>}
                {error && <p className="text-red-400 p-3">{error}</p>}
                {!isLoading && !error && problems.map(p => (
                    <div 
                        key={p.id} 
                        onClick={() => onSelectProblem(p)}
                        className={`p-3 rounded-md cursor-pointer text-sm transition-colors ${selectedProblem?.id === p.id ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        {p.title}
                    </div>
                 ))}
            </CardContent>
        </Card>
        <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700"><BookCopy size={16} className="mr-2"/> 我的错题本</Button>
            <Button variant="outline" className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700"><Flame size={16} className="mr-2"/> 高频公司题</Button>
        </div>
    </nav>
);


// --- 子组件：右侧主内容区 ---
const MainContentPanel = ({ problem, userCode, setUserCode, feedback, isLoading, onExecute, onSubmit, language, setLanguage }) => {
    if (!problem) {
        return (
            <main className="flex-1">
                <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg">
                    <p className="text-gray-400">请从左侧选择一个问题开始练习。</p>
                </div>
            </main>
        );
    }
    
    return (
        <main className="flex-1">
            <div className="h-full flex flex-col border border-gray-700 rounded-lg">
                {/* Problem description */}
                <div className="p-6 bg-gray-800 border-b border-gray-700">
                    <h2 className="text-2xl font-bold mb-4">{problem.title}</h2>
                    <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                        <p>{problem.description}</p>
                        <h3 className="font-semibold mt-4 mb-2">例子:</h3>
                        <pre className="bg-gray-900 p-4 rounded-md mt-2">{problem.example?.replace(/\\n/g, '\n')}</pre>
                    </div>
                </div>
                
                {/* Code editor and feedback area */}
                <div className="flex-1 flex flex-col">
                    {/* Toolbar */}
                    <div className="bg-gray-700 p-2 flex justify-between items-center flex-shrink-0">
                        <Select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-32">
                            <option value="python">Python</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                        </Select>
                        <div>
                            <Button onClick={onExecute} disabled={isLoading.execution || isLoading.submission} className="bg-gray-600 hover:bg-gray-500 mr-2">
                               {isLoading.execution ? <i className="fas fa-spinner fa-spin"/> : <Play size={16} />}<span className="ml-2">执行</span>
                            </Button>
                            <Button onClick={onSubmit} disabled={isLoading.execution || isLoading.submission} className="bg-green-600 hover:bg-green-500">
                                {isLoading.submission ? <i className="fas fa-spinner fa-spin"/> : <Send size={16} />}<span className="ml-2">提交</span>
                            </Button>
                        </div>
                    </div>
                    
                    {/* Code editor and feedback side by side */}
                    <div className="flex-1 flex" style={{height: '600px'}}>
                        {/* Code editor on the left */}
                        <div className="flex-1 bg-[#1e1e1e]">
                            <MonacoEditor language={language} value={userCode} onChange={setUserCode} />
                        </div>
                        
                        {/* Feedback panel on the right */}
                        <div className="w-1/3 min-w-[300px]">
                            <FeedbackPanel feedback={feedback} isLoading={isLoading.submission || isLoading.execution} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

// --- 子组件：AI反馈面板 ---
const FeedbackPanel = ({ feedback, isLoading }) => {
    if (isLoading) {
        return (
             <div className="bg-gray-900 border-t-2 border-indigo-500 p-6 h-full overflow-y-auto flex items-center justify-center">
                 <div className="text-center">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-3"></div>
                     <p className="text-gray-400 text-sm">正在分析您的代码，请稍候...</p>
                 </div>
             </div>
        );
    }
    
    if (!feedback) {
        return (
            <div className="bg-gray-900 border-t-2 border-indigo-500 p-6 h-full overflow-y-auto flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <div className="text-4xl mb-3">💡</div>
                    <p className="text-sm">点击"提交"按钮获取AI代码分析</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-900 border-t-2 border-indigo-500 h-full overflow-y-auto">
            {/* Header */}
            <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
                <h3 className="font-bold text-lg text-white flex items-center">
                    <span className="mr-2">📊</span>
                    代码分析结果
                </h3>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
                {feedback.type === 'execution' && (
                    <div className={`flex items-center p-4 rounded-lg ${feedback.success ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
                        {feedback.success ? 
                            <Check size={20} className="mr-3 text-green-400"/> : 
                            <AlertTriangle size={20} className="mr-3 text-red-400"/>
                        }
                        <span className={`font-medium ${feedback.success ? 'text-green-400' : 'text-red-400'}`}>
                            {feedback.message}
                        </span>
                    </div>
                )}
                
                {feedback.type === 'submission' && (
                    feedback.error ? (
                        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <AlertTriangle size={18} className="mr-2 text-red-400"/>
                                <span className="font-semibold text-red-400">分析失败</span>
                            </div>
                            <p className="text-red-300 text-sm">{feedback.error}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Test Results */}
                            <div className="bg-gray-800 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-200 mb-3 flex items-center">
                                    <span className="mr-2">✅</span>
                                    测试结果
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
                                        <span className="text-gray-300 text-sm">通过率</span>
                                        <span className={`font-bold ${feedback.testResults?.passed ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {feedback.testResults?.summary || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Complexity Analysis */}
                            <div className="bg-gray-800 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-200 mb-3 flex items-center">
                                    <span className="mr-2">⚡</span>
                                    复杂度分析
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-700 rounded-md">
                                        <div className="text-gray-400 text-xs mb-1">时间复杂度</div>
                                        <div className="font-mono text-sm text-blue-400">
                                            {feedback.complexity?.time || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-700 rounded-md">
                                        <div className="text-gray-400 text-xs mb-1">空间复杂度</div>
                                        <div className="font-mono text-sm text-purple-400">
                                            {feedback.complexity?.space || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* AI Code Review */}
                            <div className="bg-gray-800 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-200 mb-3 flex items-center">
                                    <span className="mr-2">🤖</span>
                                    AI 代码评审
                                </h4>
                                <div className="bg-gray-700 rounded-md p-4">
                                    <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {feedback.aiAnalysis}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default CodingPractice;
