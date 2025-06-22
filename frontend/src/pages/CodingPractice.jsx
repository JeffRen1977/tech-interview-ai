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
        setSelectedProblem(problem);
        setUserCode(problem.initialCode || `# 在此输入您的代码`);
        setFeedback(null);
        setError(null);
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
        console.log("DEBUG: '提交' button clicked.");
        setIsLoading(prev => ({ ...prev, submission: true, execution: false }));
        setFeedback(null);
        try {
            const result = await apiRequest('/code/submit', 'POST', {
                question: selectedProblem,
                userCode: userCode,
                language: language,
            });
            console.log("DEBUG: Received submission analysis from backend:", result);
            setFeedback({ type: 'submission', ...result });
        } catch (error) {
             console.error("DEBUG: Submission API call failed:", error);
             setFeedback({ type: 'submission', error: `AI分析失败: ${error.message}` });
        } finally {
            setIsLoading(prev => ({ ...prev, submission: false }));
        }
    };
    // **新增** DEBUG: 监听 feedback 状态的变化
    useEffect(() => {
        console.log("DEBUG: Feedback state updated:", feedback);
    }, [feedback]);

    return (
        <div className="flex h-full gap-8">
            <LeftSidebar problems={problems} isLoading={isLoading.list} error={error} selectedProblem={selectedProblem} onSelectProblem={handleSelectProblem} />
            <MainContentPanel 
                key={selectedProblem ? selectedProblem.id : 'empty'} 
                problem={selectedProblem} 
                userCode={userCode}
                setUserCode={setUserCode}
                feedback={feedback}
                isLoading={isLoading}
                onExecute={handleExecute}
                onSubmit={handleSubmitCode}
                language={language}
                setLanguage={setLanguage}
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
            <ResizablePanelGroup direction="vertical" className="h-[85vh] border border-gray-700 rounded-lg">
                <ResizablePanel defaultSize={45}>
                    <div className="p-6 h-full overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">{problem.title}</h2>
                        <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                            <p>{problem.description}</p>
                            <h3 className="font-semibold mt-4 mb-2">例子:</h3>
                            <pre className="bg-gray-900 p-4 rounded-md mt-2">{problem.example?.replace(/\\n/g, '\n')}</pre>
                        </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={55}>
                    <div className="flex flex-col h-full">
                       <div className="bg-gray-700 p-2 flex justify-between items-center flex-shrink-0">
                            <Select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-32">
                                <option value="python">Python</option>
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
                       <div className="flex-grow bg-[#1e1e1e]">
                           <MonacoEditor language={language} value={userCode} onChange={setUserCode} />
                       </div>
                       <FeedbackPanel feedback={feedback} isLoading={isLoading.submission || isLoading.execution} />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </main>
    );
};

// --- 子组件：AI反馈面板 ---
const FeedbackPanel = ({ feedback, isLoading }) => {
    if (isLoading) {
        return (
             <div className="bg-gray-900 border-t-2 border-indigo-500 p-4 h-56 overflow-y-auto flex items-center justify-center">
                 <p className="text-gray-400"><i className="fas fa-spinner fa-spin mr-2"></i>正在处理，请稍候...</p>
             </div>
        );
    }
    
    if (!feedback) return null;
    
    
    return (
        <div className="bg-gray-900 border-t-2 border-indigo-500 p-4 h-56 overflow-y-auto">
            <h3 className="font-bold text-lg mb-3">反馈面板</h3>
            {feedback.type === 'execution' && (
                <div className={`flex items-center ${feedback.success ? 'text-green-400' : 'text-red-400'}`}>
                    {feedback.success ? <Check size={18} className="mr-2"/> : <AlertTriangle size={18} className="mr-2"/>}
                    {feedback.message}
                </div>
            )}
            {feedback.type === 'submission' && (
                feedback.error ? (
                     <p className="text-red-400">{feedback.error}</p>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                             <StatItem label="正确率" value={feedback.testResults?.summary} isSuccess={feedback.testResults?.passed} />
                             <StatItem label="时间复杂度" value={feedback.complexity?.time} />
                             <StatItem label="空间复杂度" value={feedback.complexity?.space} />
                        </div>
                        <div>
                             <h4 className="font-semibold text-gray-300">AI 代码评审</h4>
                             <pre className="text-sm text-gray-400 mt-1 whitespace-pre-wrap font-sans bg-gray-800 p-3 rounded-md">{feedback.aiAnalysis}</pre>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

const StatItem = ({ label, value = 'N/A', isSuccess }) => (
    <div className="bg-gray-800 p-3 rounded-lg">
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`font-bold text-lg ${isSuccess === true ? 'text-green-400' : isSuccess === false ? 'text-yellow-400' : ''}`}>{value}</p>
    </div>
);


export default CodingPractice;
