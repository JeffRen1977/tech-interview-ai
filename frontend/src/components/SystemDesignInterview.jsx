import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { apiRequest } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';
import { 
    Play, Pause, Square, Clock, Lightbulb, CheckCircle, AlertCircle, 
    Mic, MicOff, Save, Undo, Redo, Download, Upload, Volume2, VolumeX
} from 'lucide-react';

const SystemDesignInterview = ({ mockInterviewData, onBackToSetup }) => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    
    const [interviewState, setInterviewState] = useState('setup'); // setup, active, completed
    const [sessionId, setSessionId] = useState(null);
    const [questionData, setQuestionData] = useState(null);
    const [whiteboardData, setWhiteboardData] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingColor, setDrawingColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(2);
    const [voiceInput, setVoiceInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [transcribedText, setTranscribedText] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [timeSpent, setTimeSpent] = useState(0);
    const [timeLimit, setTimeLimit] = useState(40 * 60); // 默认40分钟
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [finalReport, setFinalReport] = useState(null);
    const [showHints, setShowHints] = useState(false);
    const [topic, setTopic] = useState('machine-learning');
    const [difficulty, setDifficulty] = useState('medium');
    const [interviewLanguage, setInterviewLanguage] = useState('chinese');
    const [localMockInterviewData, setLocalMockInterviewData] = useState(null);
    
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    // 处理模拟面试数据
    useEffect(() => {
        if (mockInterviewData) {
            // 系统设计题目固定40分钟
            setTimeLimit(40 * 60);
            
            // 直接开始模拟面试
            startMockInterview(mockInterviewData);
        }
    }, [mockInterviewData]);

    // Timer effect
    useEffect(() => {
        if (isTimerRunning) {
            timerRef.current = setInterval(() => {
                setTimeSpent(prev => {
                    const newTime = prev + 1;
                    // 检查是否超时
                    if (newTime >= timeLimit) {
                        setIsTimerRunning(false);
                        endInterview();
                        return timeLimit;
                    }
                    return newTime;
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
    }, [isTimerRunning, timeLimit]);

    // Canvas setup
    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = canvas.offsetWidth * 2;
            canvas.height = canvas.offsetHeight * 2;
            canvas.style.width = `${canvas.offsetWidth}px`;
            canvas.style.height = `${canvas.offsetHeight}px`;

            const context = canvas.getContext('2d');
            context.scale(2, 2);
            context.lineCap = 'round';
            context.strokeStyle = drawingColor;
            context.lineWidth = brushSize;
            contextRef.current = context;
        }
    }, [drawingColor, brushSize]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startMockInterview = (data) => {
        setQuestionData(data.question);
        setInterviewState('active');
        setIsTimerRunning(true);
        startTimeRef.current = Date.now();
    };

    const startInterview = async () => {
        try {
            const response = await apiRequest('/questions/system-design-interview/start', 'POST', {
                topic,
                difficulty,
                language: interviewLanguage
            });
            
            setSessionId(response.sessionId);
            setQuestionData(response.questionData);
            setInterviewState('active');
            setIsTimerRunning(true);
            startTimeRef.current = Date.now();
        } catch (error) {
            console.error('Failed to start interview:', error);
            alert(`${t('failedToStartInterview')} ${error.message}`);
        }
    };

    // Whiteboard functions
    const startDrawing = useCallback((e) => {
        setIsDrawing(true);
        const { offsetX, offsetY } = e.nativeEvent;
        setCurrentPath([{ x: offsetX, y: offsetY }]);
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
    }, []);

    const draw = useCallback((e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = e.nativeEvent;
        setCurrentPath(prev => [...prev, { x: offsetX, y: offsetY }]);
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    }, [isDrawing]);

    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
        if (currentPath.length > 0) {
            setWhiteboardData(prev => [...prev, {
                path: currentPath,
                color: drawingColor,
                size: brushSize,
                timestamp: Date.now()
            }]);
        }
        setCurrentPath([]);
    }, [currentPath, drawingColor, brushSize]);

    const clearCanvas = () => {
        if (contextRef.current) {
            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        setWhiteboardData([]);
    };

    const undo = () => {
        if (whiteboardData.length > 0) {
            const newData = whiteboardData.slice(0, -1);
            setWhiteboardData(newData);
            redrawCanvas(newData);
        }
    };

    const redrawCanvas = (data) => {
        if (!contextRef.current) return;
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        data.forEach(pathData => {
            contextRef.current.strokeStyle = pathData.color;
            contextRef.current.lineWidth = pathData.size;
            contextRef.current.beginPath();
            pathData.path.forEach((point, index) => {
                if (index === 0) {
                    contextRef.current.moveTo(point.x, point.y);
                } else {
                    contextRef.current.lineTo(point.x, point.y);
                }
            });
            contextRef.current.stroke();
        });
        
        // Reset to current settings
        contextRef.current.strokeStyle = drawingColor;
        contextRef.current.lineWidth = brushSize;
    };

    // Voice recording functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
                transcribeAudio(audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            alert(`${t('failedToStartRecording')} ${error.message}`);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const transcribeAudio = async (audioBlob) => {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob);
            formData.append('language', language);

            const response = await apiRequest('/transcribe', 'POST', formData, true);
            setTranscribedText(response.transcript);
            setVoiceInput(prev => prev + ' ' + response.transcript);
        } catch (error) {
            console.error('Transcription failed:', error);
            alert('Transcription failed: ' + error.message);
        }
    };

    const submitSolution = async () => {
        try {
            const response = await apiRequest('/questions/system-design-interview/submit', 'POST', {
                sessionId,
                whiteboardData,
                voiceInput,
                timeSpent
            });
            
            setFeedback(response.feedback);
        } catch (error) {
            console.error('Failed to submit solution:', error);
            alert(`${t('failedToSubmitSolution')} ${error.message}`);
        }
    };

    const endInterview = async () => {
        try {
            const response = await apiRequest('/questions/system-design-interview/end', 'POST', {
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
                <h1 className="text-4xl font-bold mb-8 text-center">{t('systemDesignInterviewSimulation')}</h1>
                <Card className="bg-gray-800 p-6">
                    <h2 className="text-2xl font-bold mb-6">{t('interviewSetup')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('topic')}</label>
                            <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
                                <option value="machine-learning">{t('machineLearning')}</option>
                                <option value="computer-vision">{t('computerVision')}</option>
                                <option value="natural-language-processing">{t('naturalLanguageProcessing')}</option>
                                <option value="reinforcement-learning">{t('reinforcementLearning')}</option>
                                <option value="deep-learning">{t('deepLearning')}</option>
                                <option value="ai-infrastructure">{t('aiInfrastructure')}</option>
                                <option value="recommendation-systems">{t('recommendationSystems')}</option>
                                <option value="autonomous-systems">{t('autonomousSystems')}</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('difficulty')}</label>
                            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                                <option value="easy">{t('easy')}</option>
                                <option value="medium">{t('medium')}</option>
                                <option value="hard">{t('hard')}</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('language')}</label>
                            <Select value={interviewLanguage} onChange={(e) => setInterviewLanguage(e.target.value)}>
                                <option value="chinese">{t('chinese')}</option>
                                <option value="english">{t('english')}</option>
                            </Select>
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
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    
                    <div className="mt-6">
                        <h3 className="text-lg font-bold mb-3">{t('finalAssessmentComment')}</h3>
                        <p className="text-gray-300 mb-4">{finalReport?.finalAssessment}</p>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">{t('nextSteps')}</h4>
                            <p>{finalReport?.nextSteps}</p>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={() => window.location.reload()}
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                    >
                        {t('startNewInterview')}
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
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
                    <h1 className="text-3xl font-bold">{questionData?.title}</h1>
                    {questionData?.difficulty && (
                        (() => {
                            console.log('系统设计面试题目难度:', questionData.difficulty);
                            let diff = (questionData.difficulty || '').toLowerCase();
                            let colorClass =
                                diff === 'easy' || diff === '入门'
                                    ? 'bg-green-600 text-white'
                                    : diff === 'medium' || diff === '中等'
                                    ? 'bg-yellow-500 text-gray-900'
                                    : diff === 'hard' || diff === '困难'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-500 text-white';
                            return (
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${colorClass}`}>
                                    {questionData.difficulty}
                                </span>
                            );
                        })()
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-mono">{formatTime(timeSpent)}</span>
                    </div>
                    <Button onClick={() => setIsTimerRunning(!isTimerRunning)} variant="outline" size="sm">
                        {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                    <Button onClick={endInterview} variant="outline" size="sm">
                        <Square size={16} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Question */}
                <Card className="bg-gray-800">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">{t('currentQuestion')}</h2>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-gray-300">{questionData?.description}</p>
                            {questionData?.requirements && (
                                <div className="mt-4">
                                    <h3 className="font-semibold mb-2">{t('requirements')}</h3>
                                    <ul className="space-y-1">
                                        {questionData.requirements.map((req, index) => (
                                            <li key={index} className="text-sm text-gray-300">• {req}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Whiteboard */}
                <Card className="bg-gray-800">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{t('whiteboard')}</h2>
                            <div className="flex gap-2">
                                <Button onClick={undo} variant="outline" size="sm" disabled={whiteboardData.length === 0}>
                                    <Undo size={16} />
                                </Button>
                                <Button onClick={clearCanvas} variant="outline" size="sm">
                                    {t('clear')}
                                </Button>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="color"
                                    value={drawingColor}
                                    onChange={(e) => setDrawingColor(e.target.value)}
                                    className="w-8 h-8 rounded border"
                                />
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            className="w-full h-96 bg-gray-900 rounded-lg cursor-crosshair border"
                        />
                    </div>
                </Card>

                {/* Voice Input and Feedback */}
                <div className="space-y-6">
                    <Card className="bg-gray-800">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">{t('voiceInput')}</h2>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={startRecording}
                                        disabled={isRecording}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <Mic size={16} />
                                        {t('startRecording')}
                                    </Button>
                                    <Button 
                                        onClick={stopRecording}
                                        disabled={!isRecording}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <MicOff size={16} />
                                        {t('stopRecording')}
                                    </Button>
                                </div>
                                
                                {isRecording && (
                                    <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                        <p className="text-red-400 text-sm flex items-center gap-2">
                                            <Mic className="w-4 h-4 animate-pulse" />
                                            {t('recordingInProgress')}
                                        </p>
                                    </div>
                                )}
                                
                                <Textarea
                                    value={voiceInput}
                                    onChange={(e) => setVoiceInput(e.target.value)}
                                    placeholder={t('voiceInputPlaceholder')}
                                    className="min-h-[150px]"
                                />
                                
                                <Button 
                                    onClick={submitSolution}
                                    disabled={!voiceInput.trim()}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    {t('submitSolution')}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Feedback */}
                    {feedback && (
                        <Card className="bg-gray-800">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">{t('interviewFeedback')}</h2>
                                <div className="space-y-4">
                                    {feedback.ratings && (
                                        <div className="grid grid-cols-1 gap-4">
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
                                    )}
                                    
                                    {feedback.comments && (
                                        <div className="mt-4">
                                            <h3 className="font-semibold mb-2">{t('comments')}</h3>
                                            <p className="text-gray-300 text-sm">{feedback.comments}</p>
                                        </div>
                                    )}
                                    
                                    {feedback.suggestions && feedback.suggestions.length > 0 && (
                                        <div className="mt-4">
                                            <h3 className="font-semibold mb-2">{t('suggestions')}</h3>
                                            <ul className="space-y-1">
                                                {feedback.suggestions.map((suggestion, index) => (
                                                    <li key={index} className="text-sm text-gray-300">• {suggestion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemDesignInterview; 