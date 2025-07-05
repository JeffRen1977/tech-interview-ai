import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { apiRequest } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';
import { Play, Pause, Square, Clock, Mic, MicOff, CheckCircle, AlertCircle, Star } from 'lucide-react';

const BehavioralInterview = ({ mockInterviewData, onBackToSetup }) => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    
    const [interviewState, setInterviewState] = useState('setup'); // setup, active, completed
    const [sessionId, setSessionId] = useState(null);
    const [interviewData, setInterviewData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [response, setResponse] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(5 * 60); // 默认5分钟
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [finalReport, setFinalReport] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [localMockInterviewData, setLocalMockInterviewData] = useState(null);
    
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
            recognitionRef.current.lang = language === 'zh' ? 'zh-CN' : 'en-US';
            
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
    }, [language]);

    // 处理模拟面试数据
    useEffect(() => {
        if (mockInterviewData) {
            // 行为面试题目固定5分钟
            setTimeRemaining(5 * 60);
            
            // 直接开始模拟面试
            startMockInterview(mockInterviewData);
        }
    }, [mockInterviewData]);

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

    const startMockInterview = (data) => {
        // 确保数据结构正确
        const question = data.question;
        const formattedQuestion = {
            id: question.id || question.title,
            question: question.question || question.description || question.prompt,
            category: question.category || 'Behavioral',
            starFramework: question.starFramework || {
                situation: '描述你面临的具体情况或挑战',
                task: '解释你的责任和需要完成的任务',
                action: '详细说明你采取的具体行动和步骤',
                result: '分享结果和你学到的经验教训'
            }
        };
        
        setInterviewData({
            questions: [formattedQuestion]
        });
        setInterviewState('active');
        setIsTimerRunning(true);
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
            alert(`${t('failedToStartInterview')} ${error.message}`);
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
            alert(t('pleaseProvideResponse'));
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
            alert(`${t('failedToSubmitResponse')} ${error.message}`);
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
            alert(`${t('failedToEndInterview')} ${error.message}`);
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
                <h1 className="text-4xl font-bold mb-8 text-center">{t('behavioralInterviewSimulation')}</h1>
                <Card className="bg-gray-800 p-6">
                    <h2 className="text-2xl font-bold mb-6">{t('interviewSetup')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('role')}</label>
                            <Select value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value="Software Engineer">{t('softwareEngineer')}</option>
                                <option value="Senior Software Engineer">{t('seniorSoftwareEngineer')}</option>
                                <option value="Engineering Manager">{t('engineeringManager')}</option>
                                <option value="Product Manager">{t('productManager')}</option>
                                <option value="Data Scientist">{t('dataScientist')}</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('level')}</label>
                            <Select value={level} onChange={(e) => setLevel(e.target.value)}>
                                <option value="Entry-level">{t('entryLevel')}</option>
                                <option value="Mid-level">{t('midLevel')}</option>
                                <option value="Senior-level">{t('seniorLevel')}</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('company')}</label>
                            <Select value={company} onChange={(e) => setCompany(e.target.value)}>
                                <option value="Tech Company">{t('techCompany')}</option>
                                <option value="Startup">Startup</option>
                                <option value="Enterprise">Enterprise</option>
                                <option value="Consulting">Consulting</option>
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
                        {t('startInterview')}
                    </Button>
                </Card>
            </div>
        );
    }

    if (interviewState === 'completed') {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center">{t('interviewCompleted')}</h1>
                <Card className="bg-gray-800 p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">{t('finalAssessment')}</h2>
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
                            <h3 className="text-lg font-bold mb-3">{t('strengths')}</h3>
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
                            <h3 className="text-lg font-bold mb-3">{t('areasForImprovement')}</h3>
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
                        <h3 className="text-lg font-bold mb-3">{t('finalAssessmentComment')}</h3>
                        <p className="text-gray-300 mb-4">{finalReport?.finalAssessment}</p>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">{t('nextSteps')}</h4>
                            <p>{finalReport?.nextSteps}</p>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {t('startNewInterview')}
                    </Button>
                </Card>
            </div>
        );
    }

    const currentQuestion = interviewData?.questions[currentQuestionIndex];

    // 安全检查：如果没有当前问题，显示加载状态
    if (!currentQuestion) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">{t('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    {onBackToSetup && (
                        <Button 
                            onClick={onBackToSetup}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            ← {t('backToSetup')}
                        </Button>
                    )}
                    <h1 className="text-3xl font-bold">{t('behavioralInterviewSimulation')}</h1>
                </div>
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
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 问题区域 */}
                <Card className="bg-gray-800 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold">{t('currentQuestion')}</h2>
                        <span className="bg-blue-600 px-2 py-1 rounded text-sm">
                            {typeof currentQuestion?.category === 'object' ? currentQuestion.category[language] : currentQuestion?.category}
                        </span>
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
                        <h2 className="text-xl font-bold mb-4">{t('yourResponse')}</h2>
                        <div className="space-y-4">
                            <div className="flex gap-2 mb-4">
                                <Button 
                                    onClick={isRecording ? stopRecording : startRecording}
                                    variant={isRecording ? "destructive" : "outline"}
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    {isRecording ? t('stopRecording') : t('startRecording')}
                                </Button>
                                {transcript && (
                                    <Button 
                                        onClick={() => setResponse(transcript)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        {t('useRecording')}
                                    </Button>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">{t('responseContent')}</label>
                                <Textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder={t('responsePlaceholder')}
                                    className="min-h-[300px]"
                                />
                            </div>
                            
                            <Button 
                                onClick={submitResponse}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                {t('submitResponse')}
                            </Button>
                        </div>
                    </Card>

                    {/* 反馈区域 */}
                    {feedback && (
                        <Card className="bg-gray-800 p-6">
                            <h2 className="text-xl font-bold mb-4">{t('interviewFeedback')}</h2>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className={`text-3xl font-bold ${getScoreColor(feedback.overallScore)}`}>
                                        {feedback.overallScore}/100
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(feedback.ratings).map(([category, rating]) => (
                                        <div key={category} className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                                            <span className="text-sm">{t(category)}</span>
                                            <div className="flex items-center gap-2">
                                                {getFeedbackIcon(rating)}
                                                <span className="text-sm font-medium">{t(rating)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div>
                                    <h4 className="font-bold mb-2">{t('comments')}</h4>
                                    <p className="text-gray-300">{feedback.comments}</p>
                                </div>
                                
                                {feedback.suggestions && feedback.suggestions.length > 0 && (
                                    <div>
                                        <h4 className="font-bold mb-2">{t('suggestions')}</h4>
                                        <ul className="space-y-1">
                                            {feedback.suggestions.map((suggestion, index) => (
                                                <li key={index} className="text-sm text-gray-300">• {suggestion}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {feedback.nextQuestion && (
                                    <div className="bg-blue-900/20 p-3 rounded">
                                        <h4 className="font-bold mb-2">{t('nextQuestionHint')}</h4>
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