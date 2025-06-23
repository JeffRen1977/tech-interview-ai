import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { apiRequest } from '../api';
import { 
    Play, Pause, Square, Clock, Lightbulb, CheckCircle, AlertCircle, 
    Mic, MicOff, Save, Undo, Redo, Download, Upload, Volume2, VolumeX
} from 'lucide-react';

const SystemDesignInterview = () => {
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
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [finalReport, setFinalReport] = useState(null);
    const [showHints, setShowHints] = useState(false);
    const [topic, setTopic] = useState('machine-learning');
    const [difficulty, setDifficulty] = useState('medium');
    const [language, setLanguage] = useState('chinese');
    
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
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

    const startInterview = async () => {
        try {
            const response = await apiRequest('/questions/system-design-interview/start', 'POST', {
                topic,
                difficulty,
                language
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
            alert('Failed to start recording: ' + error.message);
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
            
            const response = await apiRequest('/questions/transcribe-audio', 'POST', formData, true);
            setTranscribedText(response.transcription);
            setVoiceInput(prev => prev + ' ' + response.transcription);
        } catch (error) {
            console.error('Error transcribing audio:', error);
            alert('Failed to transcribe audio: ' + error.message);
        }
    };

    const submitSolution = async () => {
        if (!voiceInput.trim() && whiteboardData.length === 0) {
            alert('Please provide voice input or draw on the whiteboard before submitting.');
            return;
        }

        try {
            const response = await apiRequest('/questions/system-design-interview/submit', 'POST', {
                sessionId,
                voiceInput,
                whiteboardData,
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
            const response = await apiRequest('/questions/system-design-interview/end', 'POST', {
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
            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center">系统设计面试模拟</h1>
                <Card className="bg-gray-800 p-6">
                    <h2 className="text-2xl font-bold mb-6">面试设置</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">主题领域</label>
                            <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
                                <option value="machine-learning">机器学习系统</option>
                                <option value="computer-vision">计算机视觉</option>
                                <option value="natural-language-processing">自然语言处理</option>
                                <option value="reinforcement-learning">强化学习</option>
                                <option value="deep-learning">深度学习</option>
                                <option value="ai-infrastructure">AI基础设施</option>
                                <option value="recommendation-systems">推荐系统</option>
                                <option value="autonomous-systems">自动驾驶系统</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">难度</label>
                            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                                <option value="easy">初级</option>
                                <option value="medium">中级</option>
                                <option value="hard">高级</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">语言</label>
                            <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="chinese">中文</option>
                                <option value="english">English</option>
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
            <div className="max-w-6xl mx-auto p-6">
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
                        <ul className="space-y-2">
                            {finalReport?.recommendations?.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <Lightbulb className="w-4 h-4 text-blue-500 mt-1" />
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="mt-6">
                        <h3 className="text-lg font-bold mb-3">下一步</h3>
                        <p className="text-gray-300">{finalReport?.nextSteps}</p>
                    </div>
                    
                    <div className="mt-6 flex gap-4">
                        <Button 
                            onClick={() => setInterviewState('setup')}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            重新开始
                        </Button>
                        <Button 
                            onClick={() => window.print()}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            打印报告
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">系统设计面试</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span className="text-xl font-mono">{formatTime(timeSpent)}</span>
                    </div>
                    <Button 
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        variant="outline"
                        size="sm"
                    >
                        {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Question Panel */}
                <Card className="bg-gray-800 p-6">
                    <h2 className="text-xl font-bold mb-4">问题</h2>
                    {questionData && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">{questionData.title}</h3>
                            <p className="text-gray-300">{questionData.description}</p>
                            
                            {questionData.requirements && (
                                <div>
                                    <h4 className="font-semibold mb-2">要求:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                                        {questionData.requirements.map((req, index) => (
                                            <li key={index}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {showHints && questionData.hints && (
                                <div>
                                    <h4 className="font-semibold mb-2">提示:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                                        {questionData.hints.map((hint, index) => (
                                            <li key={index}>{hint}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <Button 
                                onClick={() => setShowHints(!showHints)}
                                variant="outline"
                                size="sm"
                            >
                                <Lightbulb className="w-4 h-4 mr-2" />
                                {showHints ? '隐藏提示' : '显示提示'}
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Whiteboard Panel */}
                <Card className="bg-gray-800 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">白板</h2>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={drawingColor}
                                onChange={(e) => setDrawingColor(e.target.value)}
                                className="w-8 h-8 rounded border"
                            />
                            <select
                                value={brushSize}
                                onChange={(e) => setBrushSize(Number(e.target.value))}
                                className="bg-gray-700 border border-gray-600 rounded px-2"
                            >
                                <option value={1}>细</option>
                                <option value={2}>中</option>
                                <option value={4}>粗</option>
                            </select>
                            <Button onClick={clearCanvas} variant="outline" size="sm">
                                <Square className="w-4 h-4" />
                            </Button>
                            <Button onClick={undo} variant="outline" size="sm">
                                <Undo className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    
                    <div className="border border-gray-600 rounded-lg overflow-hidden">
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            className="w-full h-96 bg-gray-900 cursor-crosshair"
                        />
                    </div>
                </Card>
            </div>

            {/* Voice Input Panel */}
            <Card className="bg-gray-800 p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">语音输入</h2>
                    <div className="flex gap-2">
                        <Button
                            onClick={isRecording ? stopRecording : startRecording}
                            variant={isRecording ? "destructive" : "default"}
                            size="sm"
                        >
                            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            {isRecording ? '停止录音' : '开始录音'}
                        </Button>
                    </div>
                </div>
                
                <Textarea
                    value={voiceInput}
                    onChange={(e) => setVoiceInput(e.target.value)}
                    placeholder="在这里输入您的系统设计思路，或使用语音输入..."
                    className="min-h-32 bg-gray-700 border-gray-600"
                />
                
                {transcribedText && (
                    <div className="mt-2 p-3 bg-gray-700 rounded">
                        <p className="text-sm text-gray-300">
                            <strong>转录结果:</strong> {transcribedText}
                        </p>
                    </div>
                )}
            </Card>

            {/* Feedback Panel */}
            {feedback && (
                <Card className="bg-gray-800 p-6 mt-6">
                    <h2 className="text-xl font-bold mb-4">实时反馈</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">评估结果</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span>系统设计能力:</span>
                                    <div className="flex items-center gap-2">
                                        {getFeedbackIcon(feedback.systemDesign)}
                                        <span className={getScoreColor(feedback.score)}>
                                            {feedback.score}/100
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>技术深度:</span>
                                    {getFeedbackIcon(feedback.technicalDepth)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>沟通表达:</span>
                                    {getFeedbackIcon(feedback.communication)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>创新思维:</span>
                                    {getFeedbackIcon(feedback.innovation)}
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">详细反馈</h3>
                            <p className="text-gray-300 text-sm">{feedback.detailedFeedback}</p>
                        </div>
                    </div>
                    
                    {feedback.suggestions && (
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">建议</h3>
                            <ul className="space-y-1">
                                {feedback.suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5" />
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-6">
                <Button 
                    onClick={submitSolution}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!voiceInput.trim() && whiteboardData.length === 0}
                >
                    提交解答
                </Button>
                <Button 
                    onClick={endInterview}
                    className="bg-red-600 hover:bg-red-700"
                >
                    结束面试
                </Button>
            </div>
        </div>
    );
};

export default SystemDesignInterview; 