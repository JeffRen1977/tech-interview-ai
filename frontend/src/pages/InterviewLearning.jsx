import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';
import MonacoEditor from '../components/ui/MonacoEditor';
import QuestionFilterPanel from '../components/QuestionFilterPanel';
import { BookCopy, Flame, HelpCircle, Play, Send, Check, X, AlertTriangle, Save, Filter, Code, Cpu, Users, RefreshCw } from 'lucide-react';
import { apiRequest } from '../api.js';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';
import ReactMarkdown from 'react-markdown';

// --- 主组件：面试练习页面 ---
const InterviewLearning = () => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    
    const [activeTab, setActiveTab] = useState('programming'); // programming, system-design, behavioral, wrong-questions
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const tabs = [
        { id: 'programming', label: t('programmingPractice'), icon: Code },
        { id: 'system-design', label: t('systemDesignPractice'), icon: Cpu },
        { id: 'behavioral', label: t('behavioralPractice'), icon: Users }
    ];

    return (
        <div className="h-full bg-gray-900 text-white p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{t('interviewLearning')}</h1>
                <p className="text-gray-400">{t('interviewLearningDescription')}</p>
            </div>

            {/* 标签页导航 */}
            <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                        >
                            <Icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* 标签页内容 */}
            <div className="h-full">
                {activeTab === 'programming' && <ProgrammingPractice />}
                {activeTab === 'system-design' && <SystemDesignPractice />}
                {activeTab === 'behavioral' && <BehavioralPractice />}
            </div>
        </div>
    );
};

// --- 编程练习组件 ---
const ProgrammingPractice = () => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    
    const [problems, setProblems] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [userCode, setUserCode] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState({ list: true, execution: false, submission: false });
    const [error, setError] = useState(null);
    const [programmingLanguage, setProgrammingLanguage] = useState('python');
    const [filters, setFilters] = useState({
        difficulty: '',
        algorithms: [],
        dataStructures: [],
        companies: []
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadQuestions();
    }, [filters]);

    const loadQuestions = async () => {
        setIsLoading(prev => ({ ...prev, list: true }));
        try {
            const queryParams = new URLSearchParams({
                ...(filters.difficulty && { difficulty: filters.difficulty }),
                ...(filters.algorithms.length > 0 && { algorithms: filters.algorithms.join(',') }),
                ...(filters.dataStructures.length > 0 && { dataStructures: filters.dataStructures.join(',') }),
                ...(filters.companies.length > 0 && { companies: filters.companies.join(',') })
            });
            
            const data = await apiRequest(`/code/questions/filtered?${queryParams}`, 'GET');
            
            if (data.questions && data.questions.length > 0) {
                setProblems(data.questions);
                if (!selectedProblem || !data.questions.find(p => p.id === selectedProblem.id)) {
                    handleSelectProblem(data.questions[0]);
                }
            } else {
                setProblems([]);
                setSelectedProblem(null);
                setError(t('noQuestionsFound'));
            }
        } catch (err) {
            console.error("Error loading questions:", err);
            setError(t('cannotLoadQuestions'));
        } finally {
            setIsLoading(prev => ({ ...prev, list: false }));
        }
    };

    const handleSelectProblem = (problem) => {
        if (selectedProblem?.id !== problem.id) {
            setFeedback(null);
            setError(null);
        }
        setSelectedProblem(problem);
        
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
        
        setUserCode(getInitialCode(programmingLanguage));
    };

    const handleExecute = async () => {
        if (!selectedProblem) return;
        setIsLoading(prev => ({ ...prev, execution: true }));
        setFeedback(null);
        try {
            const result = await apiRequest('/code/execute', 'POST', { 
                userCode: userCode,
                testCases: selectedProblem.testCases
            });
            setFeedback({ type: 'execution', ...result });
        } catch (error) {
            setFeedback({ type: 'execution', success: false, message: `${t('executionError')} ${error.message}` });
        } finally {
            setIsLoading(prev => ({ ...prev, execution: false }));
        }
    };

    const handleSubmitCode = async () => {
        if (!selectedProblem) return;
        setIsLoading(prev => ({ ...prev, submission: true }));
        setFeedback(null);
        try {
            // 只做AI分析，不自动保存到数据库
            const analysisResult = await apiRequest('/code/submit', 'POST', {
                question: selectedProblem,
                userCode: userCode,
                language: programmingLanguage
            });
            
            setFeedback({ 
                type: 'submission', 
                ...analysisResult,
                saved: false // 标记为未保存
            });
        } catch (error) {
            setFeedback({ type: 'submission', success: false, message: `${t('submissionError')} ${error.message}` });
        } finally {
            setIsLoading(prev => ({ ...prev, submission: false }));
        }
    };

    // 新增：手动保存到学习历史
    const handleSaveToHistory = async () => {
        if (!selectedProblem || !feedback) return;
        setIsLoading(prev => ({ ...prev, submission: true }));
        try {
            const saveResult = await apiRequest('/code/learning-history', 'POST', {
                questionId: selectedProblem.id,
                userCode: userCode,
                language: programmingLanguage,
                feedback: feedback,
                completedAt: new Date().toISOString()
            });
            
            setFeedback(prev => ({ 
                ...prev, 
                saved: true, 
                saveMessage: saveResult.message 
            }));
        } catch (error) {
            setFeedback(prev => ({ 
                ...prev, 
                saved: false, 
                saveMessage: `${t('saveToHistoryError')} ${error.message}` 
            }));
        } finally {
            setIsLoading(prev => ({ ...prev, submission: false }));
        }
    };

    const handleLanguageChange = (newLanguage) => {
        setProgrammingLanguage(newLanguage);
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
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border border-gray-700">
            {/* 左侧题目列表 */}
            <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full bg-gray-800 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">{t('programmingQuestions')}</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-gray-400 hover:text-white"
                        >
                            <Filter size={16} />
                        </Button>
                    </div>

                    {showFilters && (
                        <QuestionFilterPanel
                            filters={filters}
                            onFiltersChange={setFilters}
                            className="mb-4"
                        />
                    )}

                    {isLoading.list ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-center p-4">{error}</div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {problems.map((problem) => {
                                console.log('题目难度:', problem.difficulty);
                                let diff = (problem.difficulty || '').toLowerCase();
                                let colorClass =
                                    diff === 'easy'
                                        ? 'bg-green-600 text-white'
                                        : diff === 'medium'
                                        ? 'bg-yellow-500 text-gray-900'
                                        : diff === 'hard'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-500 text-white';
                                return (
                                    <div
                                        key={problem.id}
                                        onClick={() => handleSelectProblem(problem)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                            selectedProblem?.id === problem.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-700 hover:bg-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{typeof problem.title === 'object' ? problem.title[language] : problem?.title}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${colorClass}`}>
                                                {problem.difficulty || 'unknown'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* 右侧代码编辑器和反馈 */}
            <ResizablePanel defaultSize={70}>
                <div className="h-full bg-gray-800 p-4">
                    {selectedProblem ? (
                        <>
                            <div className="mb-4">
                                <h3 className="text-xl font-semibold mb-2">{typeof selectedProblem?.title === 'object' ? selectedProblem.title[language] : selectedProblem?.title}</h3>
                                <p className="text-gray-300 mb-4">{typeof selectedProblem?.description === 'object' ? selectedProblem.description[language] : selectedProblem?.description}</p>
                                
                                <div className="flex items-center space-x-4 mb-4">
                                    <Select
                                        value={programmingLanguage}
                                        onValueChange={handleLanguageChange}
                                        className="w-32"
                                    >
                                        <option value="python">Python</option>
                                        <option value="cpp">C++</option>
                                        <option value="java">Java</option>
                                    </Select>
                                    
                                    <Button
                                        onClick={handleExecute}
                                        disabled={isLoading.execution}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Play size={16} className="mr-2" />
                                        {t('execute')}
                                    </Button>
                                    
                                    <Button
                                        onClick={handleSubmitCode}
                                        disabled={isLoading.submission}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Send size={16} className="mr-2" />
                                        {t('submit')}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-96">
                                <div className="bg-gray-900 rounded-lg">
                                    <MonacoEditor
                                        value={userCode}
                                        onChange={setUserCode}
                                        language={programmingLanguage}
                                        height="100%"
                                    />
                                </div>
                                
                                <div className="bg-gray-900 rounded-lg p-4 overflow-y-auto">
                                    {feedback && (
                                        <div className={`p-4 rounded-lg ${
                                            feedback.success ? 'bg-green-900 border border-green-600' : 'bg-red-900 border border-red-600'
                                        }`}>
                                            <h4 className="font-semibold mb-2">
                                                {feedback.type === 'execution' ? t('executionResult') : t('submissionResult')}
                                            </h4>
                                            {feedback.type === 'submission' && feedback.aiAnalysis && (
                                                <div className="mb-3">
                                                    <h5 className="font-medium text-blue-400 mb-1">{t('aiAnalysis')}</h5>
                                                    <div className="text-sm text-gray-300 whitespace-pre-line bg-gray-800 p-3 rounded">
                                                        {feedback.aiAnalysis}
                                                    </div>
                                                </div>
                                            )}
                                            {feedback.message && (
                                                <pre className="text-sm whitespace-pre-wrap">{feedback.message}</pre>
                                            )}
                                            
                                            {/* 显示保存状态和保存按钮 */}
                                            {feedback.type === 'submission' && (
                                                <div className="mt-4">
                                                    {feedback.saved ? (
                                                        <div className="text-green-400 text-sm flex items-center">
                                                            <Check size={16} className="mr-2" />
                                                            {feedback.saveMessage || t('savedToLearningHistory')}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                onClick={handleSaveToHistory}
                                                                disabled={isLoading.submission}
                                                                className="bg-green-600 hover:bg-green-700 text-sm"
                                                            >
                                                                <Save size={16} className="mr-2" />
                                                                {t('saveToLearningHistory')}
                                                            </Button>
                                                            {feedback.saveMessage && (
                                                                <span className="text-red-400 text-sm">{feedback.saveMessage}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            {t('selectQuestionToStart')}
                        </div>
                    )}
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

// --- 系统设计练习组件 ---
const SystemDesignPractice = () => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        difficulty: '',
        category: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadQuestions();
    }, [filters]);

    const loadQuestions = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                ...(filters.difficulty && { difficulty: filters.difficulty }),
                ...(filters.category && { category: filters.category })
            });
            
            const data = await apiRequest(`/system-design/questions/filtered?${queryParams}`, 'GET');
            
            if (data.questions && data.questions.length > 0) {
                setQuestions(data.questions);
                if (!selectedQuestion || !data.questions.find(q => q.id === selectedQuestion.id)) {
                    setSelectedQuestion(data.questions[0]);
                }
            } else {
                setQuestions([]);
                setSelectedQuestion(null);
                setError(t('noQuestionsFound'));
            }
        } catch (err) {
            console.error("Error loading system design questions:", err);
            setError(t('cannotLoadQuestions'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSystemDesign = async () => {
        if (!selectedQuestion) return;
        
        try {
            const saveResult = await apiRequest('/system-design/learning-history', 'POST', {
                questionId: selectedQuestion.id,
                completedAt: new Date().toISOString()
            });
            
            alert(saveResult.message);
        } catch (error) {
            alert(`${t('saveFailed')} ${error.message}`);
        }
    };

    return (
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border border-gray-700">
            {/* 左侧题目列表 */}
            <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full bg-gray-800 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">{t('systemDesignQuestions')}</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-gray-400 hover:text-white"
                        >
                            <Filter size={16} />
                        </Button>
                    </div>

                    {showFilters && (
                        <div className="mb-4 space-y-2">
                            <Select
                                value={filters.difficulty}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
                                placeholder={t('selectDifficulty')}
                            >
                                <option value="">{t('allDifficulties')}</option>
                                <option value="easy">{t('easy')}</option>
                                <option value="medium">{t('medium')}</option>
                                <option value="hard">{t('hard')}</option>
                            </Select>
                            
                            <Select
                                value={filters.category}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                                placeholder={t('selectCategory')}
                            >
                                <option value="">{t('allCategories')}</option>
                                <option value="scalability">{t('scalability')}</option>
                                <option value="database">{t('database')}</option>
                                <option value="caching">{t('caching')}</option>
                                <option value="messaging">{t('messaging')}</option>
                            </Select>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-center p-4">{error}</div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {questions.map((question) => {
                                console.log('系统设计题目难度:', question.difficulty);
                                let diff = (question.difficulty || '').toLowerCase();
                                let colorClass =
                                    diff === 'easy' || diff === '入门'
                                        ? 'bg-green-600 text-white'
                                        : diff === 'medium' || diff === '中等'
                                        ? 'bg-yellow-500 text-gray-900'
                                        : diff === 'hard' || diff === '困难'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-500 text-white';
                                return (
                                    <div
                                        key={question.id}
                                        onClick={() => setSelectedQuestion(question)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                            selectedQuestion?.id === question.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-700 hover:bg-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{typeof question.title === 'object' ? question.title[language] : question?.title}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${colorClass}`}>
                                                {question.difficulty || 'unknown'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300 mt-1">{typeof question.category === 'object' ? question.category[language] : question?.category}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* 右侧答案显示 */}
            <ResizablePanel defaultSize={70}>
                <div className="h-full bg-gray-800 p-4">
                    {selectedQuestion ? (
                        <div className="h-full overflow-y-auto">
                            <h3 className="text-xl font-semibold mb-4">{typeof selectedQuestion?.title === 'object' ? selectedQuestion.title[language] : selectedQuestion?.title}</h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-medium mb-2">{t('description')}</h4>
                                    <p className="text-gray-300">{typeof selectedQuestion?.description === 'object' ? selectedQuestion.description[language] : selectedQuestion?.description}</p>
                                </div>

                                {selectedQuestion.design_steps && (
                                    <div>
                                        <h4 className="text-lg font-medium mb-2">{t('designSteps')}</h4>
                                        <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                            {selectedQuestion.design_steps.map((step, index) => (
                                                <li key={index}>{step}</li>
                                            ))}
                                        </ol>
                                    </div>
                                )}

                                {selectedQuestion.answer && (
                                    <div>
                                        <h4 className="text-lg font-medium mb-2">{t('detailedAnswer')}</h4>
                                        <div className="bg-gray-900 p-4 rounded-lg text-gray-300 text-sm">
                                            {console.log('系统设计答案内容', selectedQuestion.answer)}
                                            <ReactMarkdown>{selectedQuestion.answer}</ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSaveSystemDesign}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Save size={16} className="mr-2" />
                                        {t('saveToLearningHistory')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            {t('selectQuestionToView')}
                        </div>
                    )}
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

// --- 行为练习组件 ---
const BehavioralPractice = () => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState({ list: true, analysis: false });
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadQuestions();
    }, [filters]);

    const loadQuestions = async () => {
        setIsLoading(prev => ({ ...prev, list: true }));
        try {
            const queryParams = new URLSearchParams({
                ...(filters.category && { category: filters.category })
            });
            const url = `/behavioral/questions/filtered?${queryParams}`;
            console.log('行为题请求URL:', url);
            const data = await apiRequest(url, 'GET');
            console.log('行为题返回数据:', data);
            if (data.questions && data.questions.length > 0) {
                console.log('第一个行为题目详情:', data.questions[0]);
                console.log('题目字段:', Object.keys(data.questions[0]));
                setQuestions(data.questions);
                if (!selectedQuestion || !data.questions.find(q => q.id === selectedQuestion.id)) {
                    setSelectedQuestion(data.questions[0]);
                }
            } else {
                setQuestions([]);
                setSelectedQuestion(null);
                setError(t('noQuestionsFound'));
            }
        } catch (err) {
            console.error("Error loading behavioral questions:", err);
            setError(t('cannotLoadQuestions'));
        } finally {
            setIsLoading(prev => ({ ...prev, list: false }));
        }
    };

    const handleAnalyzeAnswer = async () => {
        if (!selectedQuestion || !userAnswer.trim()) return;
        setIsLoading(prev => ({ ...prev, analysis: true }));
        setFeedback(null);
        try {
            // 只做AI分析，不保存
            const analysisResult = await apiRequest('/behavioral/analyze', 'POST', {
                questionId: selectedQuestion.id,
                userAnswer: userAnswer,
                question: selectedQuestion.prompt || selectedQuestion.title
            });
            setFeedback({ ...analysisResult, saved: false });
        } catch (error) {
            setFeedback({ 
                success: false, 
                message: `${t('analysisError')} ${error.message}` 
            });
        } finally {
            setIsLoading(prev => ({ ...prev, analysis: false }));
        }
    };

    // 新增：保存到学习历史
    const handleSaveToHistory = async () => {
        if (!selectedQuestion || !userAnswer.trim() || !feedback) return;
        setIsLoading(prev => ({ ...prev, analysis: true }));
        try {
            const saveResult = await apiRequest('/behavioral/learning-history', 'POST', {
                questionId: selectedQuestion.id,
                userAnswer: userAnswer,
                feedback: feedback,
                completedAt: new Date().toISOString(),
                questionData: {
                  title: selectedQuestion.title,
                  prompt: selectedQuestion.prompt,
                  category: selectedQuestion.category,
                  difficulty: selectedQuestion.difficulty,
                  sampleAnswer: selectedQuestion.sampleAnswer
                }
            });
            setFeedback(prev => ({ ...prev, saved: true, saveMessage: saveResult.message }));
        } catch (error) {
            setFeedback(prev => ({ ...prev, saved: false, saveMessage: `${t('saveToHistoryError')} ${error.message}` }));
        } finally {
            setIsLoading(prev => ({ ...prev, analysis: false }));
        }
    };

    const handleSelectQuestion = (question) => {
        setSelectedQuestion(question);
        setUserAnswer('');
        setFeedback(null);
    };

    return (
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border border-gray-700">
            {/* 左侧题目列表 */}
            <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full bg-gray-800 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">{t('behavioralQuestions')}</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-gray-400 hover:text-white"
                        >
                            <Filter size={16} />
                        </Button>
                    </div>

                    {showFilters && (
                        <div className="mb-4">
                            <Select
                                value={filters.category}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                                placeholder={t('selectCategory')}
                            >
                                <option value="">{t('allCategories')}</option>
                                <option value="leadership">{t('leadership')}</option>
                                <option value="teamwork">{t('teamwork')}</option>
                                <option value="problem-solving">{t('problemSolving')}</option>
                                <option value="communication">{t('communication')}</option>
                            </Select>
                        </div>
                    )}

                    {isLoading.list ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-center p-4">{error}</div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {console.log('渲染行为题目列表，题目数量:', questions.length)}
                            {questions.map((question, index) => {
                                console.log(`渲染第${index + 1}个题目:`, question);
                                return (
                                    <div
                                        key={question.id}
                                        onClick={() => handleSelectQuestion(question)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                            selectedQuestion?.id === question.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-700 hover:bg-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{typeof question.title === 'object' ? question.title[language] : question?.title}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 mt-1 line-clamp-2">{typeof question.prompt === 'object' ? question.prompt[language] : question?.prompt}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* 右侧答案输入和反馈 */}
            <ResizablePanel defaultSize={70}>
                <div className="h-full bg-gray-800 p-4 overflow-y-auto">
                    {selectedQuestion ? (
                        <div className="min-h-full flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-xl font-semibold mb-2">{t('question')}</h3>
                                <p className="text-gray-300 mb-4">{typeof selectedQuestion?.prompt === 'object' ? selectedQuestion.prompt[language] : selectedQuestion?.prompt}</p>
                                
                                {selectedQuestion.sampleAnswer && (
                                    <div className="mb-4">
                                        <h4 className="text-lg font-medium mb-2">{t('sampleAnswer')}</h4>
                                        <div className="bg-gray-900 p-4 rounded-lg">
                                            <p className="text-gray-300">{selectedQuestion.sampleAnswer}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col">
                                <div className="mb-4">
                                    <h4 className="text-lg font-medium mb-2">{t('yourAnswer')}</h4>
                                    <textarea
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        placeholder={t('enterYourAnswer')}
                                        className="w-full h-32 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white resize-none"
                                    />
                                </div>

                                <div className="mb-4">
                                    <Button
                                        onClick={handleAnalyzeAnswer}
                                        disabled={isLoading.analysis || !userAnswer.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Send size={16} className="mr-2" />
                                        {t('analyzeAnswer')}
                                    </Button>
                                </div>

                                {feedback && (
                                    <div className="bg-gray-900 p-4 rounded-lg mb-4">
                                        <h4 className="text-lg font-medium mb-2">{t('aiFeedback')}</h4>
                                        <div style={{ whiteSpace: 'pre-wrap' }} className="text-gray-200 text-sm">
                                            {feedback.message}
                                        </div>
                                        {/* 详细调试信息 */}
                                        <div className="text-xs text-gray-500 mt-2">
                                            Debug: saved={String(feedback.saved)}, success={String(feedback.success)}, message={feedback.message ? '有消息' : '无消息'}
                                        </div>
                                        {/* 更简单的按钮显示条件 */}
                                        {feedback.message && (
                                            <Button
                                                onClick={handleSaveToHistory}
                                                className="mt-4 bg-green-600 hover:bg-green-700"
                                                disabled={isLoading.analysis || feedback.saved}
                                            >
                                                {feedback.saved ? t('savedToHistory') : t('saveToLearningHistory')}
                                            </Button>
                                        )}
                                        {feedback.saved && (
                                            <div className="mt-2 text-green-400 text-sm">{feedback.saveMessage || t('savedToHistory')}</div>
                                        )}
                                        {feedback.saved === false && feedback.saveMessage && (
                                            <div className="mt-2 text-red-400 text-sm">{feedback.saveMessage}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            {t('selectQuestionToStart')}
                        </div>
                    )}
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default InterviewLearning;
