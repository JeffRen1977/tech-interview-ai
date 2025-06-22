import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { apiRequest } from '../api';
import { Play, Pause, Square, Clock, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';

const CodingInterview = () => {
    const [interviewState, setInterviewState] = useState('setup'); // setup, active, completed
    const [sessionId, setSessionId] = useState(null);
    const [questionData, setQuestionData] = useState(null);
    const [solution, setSolution] = useState('');
    const [approach, setApproach] = useState('');
    const [timeSpent, setTimeSpent] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [showHints, setShowHints] = useState(false);
    const [difficulty, setDifficulty] = useState('medium');
    const [language, setLanguage] = useState('any');
    const [topic, setTopic] = useState('algorithms');
    const [finalReport, setFinalReport] = useState(null);
    
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    // Timer effect
    useEffect(() => {
        if (isTimerRunning) {
            timerRef.current = setInterval(() => {
                setTimeSpent(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isTimerRunning]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startInterview = async () => {
        try {
            const response = await apiRequest('/questions/coding-interview/start', 'POST', {
                difficulty,
                language,
                topic
            });
            
            setSessionId(response.sessionId);
            setQuestionData(response.questionData);
            setInterviewState('active');
            setIsTimerRunning(true);
            startTimeRef.current = Date.now();
        } catch (error) {
            console.error('Failed to start interview:', error);
            alert('Failed to start interview: ' + error.message);
        }
    };

    const submitSolution = async () => {
        if (!solution.trim()) {
            alert('Please provide a solution before submitting.');
            return;
        }

        try {
            const response = await apiRequest('/questions/coding-interview/submit', 'POST', {
                sessionId,
                solution,
                approach,
                timeSpent
            });
            
            setFeedback(response.feedback);
        } catch (error) {
            console.error('Failed to submit solution:', error);
            alert('Failed to submit solution: ' + error.message);
        }
    };

    const endInterview = async () => {
        try {
            const response = await apiRequest('/questions/coding-interview/end', 'POST', {
                sessionId
            });
            
            setFinalReport(response.finalReport);
            setInterviewState('completed');
            setIsTimerRunning(false);
        } catch (error) {
            console.error('Failed to end interview:', error);
            alert('Failed to end interview: ' + error.message);
        }
    };

    const toggleTimer = () => {
        setIsTimerRunning(!isTimerRunning);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getFeedbackIcon = (rating) => {
        switch (rating) {
            case 'excellent': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'good': return <CheckCircle className="w-5 h-5 text-blue-500" />;
            case 'fair': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'poor': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    if (interviewState === 'setup') {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center">编程面试模拟</h1>
                <Card className="bg-gray-800 p-6">
                    <h2 className="text-2xl font-bold mb-6">面试设置</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">难度</label>
                            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                                <option value="easy">简单</option>
                                <option value="medium">中等</option>
                                <option value="hard">困难</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">编程语言</label>
                            <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="any">任意语言</option>
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">主题</label>
                            <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
                                <option value="algorithms">算法</option>
                                <option value="data-structures">数据结构</option>
                                <option value="dynamic-programming">动态规划</option>
                                <option value="graph">图论</option>
                                <option value="string">字符串</option>
                            </Select>
                        </div>
                    </div>
                    <Button 
                        onClick={startInterview}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        开始面试
                    </Button>
                </Card>
            </div>
        );
    }

    if (interviewState === 'completed') {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center">面试完成</h1>
                <Card className="bg-gray-800 p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">最终评估</h2>
                        <div className={`text-4xl font-bold ${getScoreColor(finalReport?.overallScore)}`}>
                            {finalReport?.overallScore}/100
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-bold mb-3">优势</h3>
                            <ul className="space-y-2">
                                {finalReport?.strengths?.map((strength, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-3">需要改进的地方</h3>
                            <ul className="space-y-2">
                                {finalReport?.areasForImprovement?.map((area, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                                        {area}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <h3 className="text-lg font-bold mb-3">建议</h3>
                        <p className="text-gray-300 mb-4">{finalReport?.finalAssessment}</p>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">下一步建议</h4>
                            <p>{finalReport?.nextSteps}</p>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={() => window.location.reload()}
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                    >
                        重新开始
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">编程面试</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
                        <Clock className="w-5 h-5" />
                        <span className="font-mono text-lg">{formatTime(timeSpent)}</span>
                    </div>
                    <Button onClick={toggleTimer} variant="outline" size="sm">
                        {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button onClick={endInterview} variant="destructive" size="sm">
                        <Square className="w-4 h-4" />
                        结束
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 问题区域 */}
                <Card className="bg-gray-800 p-6">
                    <h2 className="text-xl font-bold mb-4">问题</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-lg">{questionData?.title}</h3>
                            <p className="text-gray-300 mt-2">{questionData?.description}</p>
                        </div>
                        
                        {questionData?.example && (
                            <div>
                                <h4 className="font-bold">示例:</h4>
                                <pre className="bg-gray-700 p-3 rounded mt-2 text-sm overflow-x-auto">
                                    {questionData.example}
                                </pre>
                            </div>
                        )}
                        
                        {questionData?.constraints && (
                            <div>
                                <h4 className="font-bold">约束条件:</h4>
                                <p className="text-gray-300 mt-2">{questionData.constraints}</p>
                            </div>
                        )}
                        
                        <div>
                            <Button 
                                onClick={() => setShowHints(!showHints)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Lightbulb className="w-4 h-4" />
                                {showHints ? '隐藏提示' : '显示提示'}
                            </Button>
                            
                            {showHints && questionData?.hints && (
                                <div className="mt-3 bg-gray-700 p-3 rounded">
                                    <h4 className="font-bold mb-2">提示:</h4>
                                    <ul className="space-y-1">
                                        {questionData.hints.map((hint, index) => (
                                            <li key={index} className="text-sm">• {hint}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* 解答区域 */}
                <div className="space-y-6">
                    <Card className="bg-gray-800 p-6">
                        <h2 className="text-xl font-bold mb-4">你的解答</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">解题思路</label>
                                <Textarea
                                    value={approach}
                                    onChange={(e) => setApproach(e.target.value)}
                                    placeholder="描述你的解题思路..."
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div>
                                <label className="label block text-sm font-medium mb-2">代码实现</label>
                                <Textarea
                                    value={solution}
                                    onChange={(e) => setSolution(e.target.value)}
                                    placeholder="在这里编写你的代码..."
                                    className="min-h-[300px] font-mono text-sm"
                                />
                            </div>
                            <Button 
                                onClick={submitSolution}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                提交解答
                            </Button>
                        </div>
                    </Card>

                    {/* 反馈区域 */}
                    {feedback && (
                        <Card className="bg-gray-800 p-6">
                            <h2 className="text-xl font-bold mb-4">AI 反馈</h2>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className={`text-3xl font-bold ${getScoreColor(feedback.score)}`}>
                                        {feedback.score}/100
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        {getFeedbackIcon(feedback.correctness)}
                                        <span>正确性: {feedback.correctness}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getFeedbackIcon(feedback.efficiency)}
                                        <span>效率: {feedback.efficiency}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getFeedbackIcon(feedback.codeQuality)}
                                        <span>代码质量: {feedback.codeQuality}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getFeedbackIcon(feedback.problemSolving)}
                                        <span>问题解决: {feedback.problemSolving}</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-bold mb-2">详细反馈</h4>
                                    <p className="text-gray-300">{feedback.detailedFeedback}</p>
                                </div>
                                
                                {feedback.suggestions && feedback.suggestions.length > 0 && (
                                    <div>
                                        <h4 className="font-bold mb-2">建议</h4>
                                        <ul className="space-y-1">
                                            {feedback.suggestions.map((suggestion, index) => (
                                                <li key={index} className="text-sm">• {suggestion}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {feedback.nextHints && feedback.nextHints.length > 0 && (
                                    <div>
                                        <h4 className="font-bold mb-2">下一步提示</h4>
                                        <ul className="space-y-1">
                                            {feedback.nextHints.map((hint, index) => (
                                                <li key={index} className="text-sm">• {hint}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodingInterview; 