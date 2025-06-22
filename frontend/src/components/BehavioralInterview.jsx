import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { apiRequest } from '../api';
import { Play, Pause, Square, Clock, Mic, MicOff, CheckCircle, AlertCircle, Star } from 'lucide-react';

const BehavioralInterview = () => {
    const [interviewState, setInterviewState] = useState('setup'); // setup, active, completed
    const [sessionId, setSessionId] = useState(null);
    const [interviewData, setInterviewData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [response, setResponse] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [finalReport, setFinalReport] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    
    // Interview setup state
    const [role, setRole] = useState('Software Engineer');
    const [level, setLevel] = useState('Mid-level');
    const [company, setCompany] = useState('Tech Company');
    
    const timerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';
            
            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev + finalTranscript + ' ');
                }
            };
        }
    }, []);

    // Timer effect
    useEffect(() => {
        if (isTimerRunning) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        endInterview();
                        return 0;
                    }
                    return prev - 1;
                });
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
            const response = await apiRequest('/questions/behavioral-interview/start', 'POST', {
                role,
                level,
                company
            });
            
            setSessionId(response.sessionId);
            setInterviewData(response.interviewData);
            setInterviewState('active');
            setIsTimerRunning(true);
        } catch (error) {
            console.error('Failed to start interview:', error);
            alert('Failed to start interview: ' + error.message);
        }
    };

    const startRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
            setResponse(transcript);
        }
    };

    const submitResponse = async () => {
        if (!response.trim()) {
            alert('Please provide a response before submitting.');
            return;
        }

        try {
            const currentQuestion = interviewData.questions[currentQuestionIndex];
            const responseData = await apiRequest('/questions/behavioral-interview/submit', 'POST', {
                sessionId,
                questionId: currentQuestion.id,
                response,
                responseType: 'text'
            });
            
            setFeedback(responseData.feedback);
            setResponse('');
            setTranscript('');
            
            if (responseData.nextQuestion) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                // No more questions, end interview
                endInterview();
            }
        } catch (error) {
            console.error('Failed to submit response:', error);
            alert('Failed to submit response: ' + error.message);
        }
    };

    const endInterview = async () => {
        try {
            const response = await apiRequest('/questions/behavioral-interview/end', 'POST', {
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
                <h1 className="text-4xl font-bold mb-8 text-center">行为面试模拟</h1>
                <Card className="bg-gray-800 p-6">
                    <h2 className="text-2xl font-bold mb-6">面试设置</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">职位</label>
                            <Select value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value="Software Engineer">软件工程师</option>
                                <option value="Senior Software Engineer">高级软件工程师</option>
                                <option value="Engineering Manager">工程经理</option>
                                <option value="Product Manager">产品经理</option>
                                <option value="Data Scientist">数据科学家</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">级别</label>
                            <Select value={level} onChange={(e) => setLevel(e.target.value)}>
                                <option value="Entry-level">初级</option>
                                <option value="Mid-level">中级</option>
                                <option value="Senior">高级</option>
                                <option value="Lead">主管</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">公司类型</label>
                            <Select value={company} onChange={(e) => setCompany(e.target.value)}>
                                <option value="Tech Company">科技公司</option>
                                <option value="Startup">初创公司</option>
                                <option value="Enterprise">大企业</option>
                                <option value="Consulting">咨询公司</option>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="bg-blue-900/20 p-4 rounded-lg mb-6">
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                            <Star className="w-5 h-5" />
                            STAR 框架说明
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <strong>S - Situation:</strong> 描述具体的情况或背景
                            </div>
                            <div>
                                <strong>T - Task:</strong> 解释你的责任和需要完成的任务
                            </div>
                            <div>
                                <strong>A - Action:</strong> 详细说明你采取的具体行动
                            </div>
                            <div>
                                <strong>R - Result:</strong> 分享结果和你学到的经验
                            </div>
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
                        <div className="mt-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                finalReport?.hiringRecommendation === 'strong_yes' ? 'bg-green-900 text-green-200' :
                                finalReport?.hiringRecommendation === 'yes' ? 'bg-blue-900 text-blue-200' :
                                finalReport?.hiringRecommendation === 'maybe' ? 'bg-yellow-900 text-yellow-200' :
                                'bg-red-900 text-red-200'
                            }`}>
                                {finalReport?.hiringRecommendation === 'strong_yes' ? '强烈推荐' :
                                 finalReport?.hiringRecommendation === 'yes' ? '推荐' :
                                 finalReport?.hiringRecommendation === 'maybe' ? '考虑' : '不推荐'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                    
                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-3">STAR 框架分析</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-700 p-3 rounded">
                                <div className="font-bold text-sm">Situation</div>
                                <div className="text-sm text-gray-300">{finalReport?.starFrameworkAnalysis?.situation}</div>
                            </div>
                            <div className="bg-gray-700 p-3 rounded">
                                <div className="font-bold text-sm">Task</div>
                                <div className="text-sm text-gray-300">{finalReport?.starFrameworkAnalysis?.task}</div>
                            </div>
                            <div className="bg-gray-700 p-3 rounded">
                                <div className="font-bold text-sm">Action</div>
                                <div className="text-sm text-gray-300">{finalReport?.starFrameworkAnalysis?.action}</div>
                            </div>
                            <div className="bg-gray-700 p-3 rounded">
                                <div className="font-bold text-sm">Result</div>
                                <div className="text-sm text-gray-300">{finalReport?.starFrameworkAnalysis?.result}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-3">建议</h3>
                        <p className="text-gray-300 mb-4">{finalReport?.finalAssessment}</p>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">下一步建议</h4>
                            <p>{finalReport?.nextSteps}</p>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        重新开始
                    </Button>
                </Card>
            </div>
        );
    }

    const currentQuestion = interviewData?.questions[currentQuestionIndex];

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">行为面试</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
                        <Clock className="w-5 h-5" />
                        <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
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
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold">问题 {currentQuestionIndex + 1} / {interviewData?.questions.length}</h2>
                        <span className="bg-blue-600 px-2 py-1 rounded text-sm">{currentQuestion?.category}</span>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-lg mb-3">{currentQuestion?.question}</h3>
                        </div>
                        
                        <div className="bg-blue-900/20 p-4 rounded-lg">
                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                STAR 框架指导
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <strong>S - Situation:</strong> {currentQuestion?.starFramework.situation}
                                </div>
                                <div>
                                    <strong>T - Task:</strong> {currentQuestion?.starFramework.task}
                                </div>
                                <div>
                                    <strong>A - Action:</strong> {currentQuestion?.starFramework.action}
                                </div>
                                <div>
                                    <strong>R - Result:</strong> {currentQuestion?.starFramework.result}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 回答区域 */}
                <div className="space-y-6">
                    <Card className="bg-gray-800 p-6">
                        <h2 className="text-xl font-bold mb-4">你的回答</h2>
                        <div className="space-y-4">
                            <div className="flex gap-2 mb-4">
                                <Button 
                                    onClick={isRecording ? stopRecording : startRecording}
                                    variant={isRecording ? "destructive" : "outline"}
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    {isRecording ? '停止录音' : '开始录音'}
                                </Button>
                                {transcript && (
                                    <Button 
                                        onClick={() => setResponse(transcript)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        使用录音
                                    </Button>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">回答内容</label>
                                <Textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder="请按照 STAR 框架结构回答这个问题..."
                                    className="min-h-[300px]"
                                />
                            </div>
                            
                            <Button 
                                onClick={submitResponse}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                提交回答
                            </Button>
                        </div>
                    </Card>

                    {/* 反馈区域 */}
                    {feedback && (
                        <Card className="bg-gray-800 p-6">
                            <h2 className="text-xl font-bold mb-4">AI 反馈</h2>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className={`text-3xl font-bold ${getScoreColor(feedback.overallScore)}`}>
                                        {feedback.overallScore}/100
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        {getFeedbackIcon(feedback.communication)}
                                        <span>沟通: {feedback.communication}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getFeedbackIcon(feedback.specificity)}
                                        <span>具体性: {feedback.specificity}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getFeedbackIcon(feedback.problemSolving)}
                                        <span>问题解决: {feedback.problemSolving}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getFeedbackIcon(feedback.leadership)}
                                        <span>领导力: {feedback.leadership}</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-bold mb-2">STAR 分析</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <strong>Situation:</strong> {feedback.starAnalysis.situation.score}/100
                                            <p className="text-sm text-gray-300">{feedback.starAnalysis.situation.feedback}</p>
                                        </div>
                                        <div>
                                            <strong>Task:</strong> {feedback.starAnalysis.task.score}/100
                                            <p className="text-sm text-gray-300">{feedback.starAnalysis.task.feedback}</p>
                                        </div>
                                        <div>
                                            <strong>Action:</strong> {feedback.starAnalysis.action.score}/100
                                            <p className="text-sm text-gray-300">{feedback.starAnalysis.action.feedback}</p>
                                        </div>
                                        <div>
                                            <strong>Result:</strong> {feedback.starAnalysis.result.score}/100
                                            <p className="text-sm text-gray-300">{feedback.starAnalysis.result.feedback}</p>
                                        </div>
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
                                
                                {feedback.nextQuestion && (
                                    <div className="bg-blue-900/20 p-3 rounded">
                                        <h4 className="font-bold mb-2">下一题提示</h4>
                                        <p className="text-sm">{feedback.nextQuestion}</p>
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

export default BehavioralInterview; 