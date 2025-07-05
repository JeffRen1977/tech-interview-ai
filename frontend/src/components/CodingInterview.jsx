import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { apiRequest, programmingAPI, mockInterviewAPI } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';
import { Play, Pause, Square, Clock, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';

const CodingInterview = ({ mockInterviewData, onBackToSetup }) => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    
    const [interviewState, setInterviewState] = useState('setup'); // setup, active, completed
    const [sessionId, setSessionId] = useState(null);
    const [questionData, setQuestionData] = useState(null);
    const [solution, setSolution] = useState('');
    const [approach, setApproach] = useState('');
    const [timeSpent, setTimeSpent] = useState(0);
    const [timeLimit, setTimeLimit] = useState(20 * 60); // 默认20分钟
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [showHints, setShowHints] = useState(false);
    const [difficulty, setDifficulty] = useState('medium');
    const [programmingLanguage, setProgrammingLanguage] = useState('any');
    const [topic, setTopic] = useState('algorithms');
    const [finalReport, setFinalReport] = useState(null);
    const [localMockInterviewData, setLocalMockInterviewData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    // 处理模拟面试数据
    useEffect(() => {
        if (mockInterviewData) {
            // 根据难度设置时间限制
            let limit;
            switch (mockInterviewData.difficulty) {
                case 'easy':
                    limit = 10 * 60; // 10分钟
                    break;
                case 'medium':
                    limit = 20 * 60; // 20分钟
                    break;
                case 'hard':
                    limit = 35 * 60; // 35分钟
                    break;
                default:
                    limit = 20 * 60; // 默认20分钟
            }
            setTimeLimit(limit);
            
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
            const response = await apiRequest('/questions/coding-interview/start', 'POST', {
                difficulty,
                language: programmingLanguage,
                topic
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

    const submitSolution = async () => {
        if (!solution.trim()) {
            alert(t('pleaseProvideSolution'));
            return;
        }

        setIsSubmitting(true);
        try {
            console.log('Submitting solution for analysis...', {
                questionData: questionData ? { id: questionData.id, title: questionData.title } : null,
                solutionLength: solution.length,
                language: programmingLanguage === 'any' ? 'javascript' : programmingLanguage
            });
            
            // 只做AI分析，不保存到数据库
            const analysisResponse = await programmingAPI.submitForAnalysis(
                questionData,
                solution,
                programmingLanguage === 'any' ? 'javascript' : programmingLanguage
            );
            
            console.log('AI Analysis response received:', analysisResponse);
            setAiAnalysis(analysisResponse);
            setShowSaveDialog(true);
        } catch (error) {
            console.error('Failed to submit solution:', error);
            alert(`${t('failedToSubmitSolution')} ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const saveToLearningHistory = async () => {
        try {
            // 检查题目数据
            const questionId = questionData?.id || questionData?.title || 'unknown';
            const isMockInterview = !!mockInterviewData;
            
            console.log('Saving to interview history...', {
                questionId,
                questionTitle: questionData?.title,
                hasId: !!questionData?.id,
                isMockInterview,
                aiAnalysis: aiAnalysis ? Object.keys(aiAnalysis) : null,
                solutionLength: solution.length,
                language: programmingLanguage === 'any' ? 'javascript' : programmingLanguage
            });
            
            // 对于模拟面试，如果题目没有id，使用title作为标识符
            const identifier = questionData?.id || questionData?.title;
            
            // 使用新的API保存到面试历史
            await mockInterviewAPI.saveInterviewResult(
                identifier,
                questionData,
                solution,
                aiAnalysis,
                'coding',
                timeSpent,
                new Date().toISOString()
            );
            
            setShowSaveDialog(false);
            alert(t('savedToInterviewHistory'));
        } catch (error) {
            console.error('Failed to save to interview history:', error);
            alert(`${t('failedToSaveToHistory')} ${error.message}`);
        }
    };

    const skipSaving = () => {
        setShowSaveDialog(false);
        // 不要清空aiAnalysis，这样分析结果会一直显示
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
                <h1 className="text-4xl font-bold mb-8 text-center">{t('codingInterviewSimulation')}</h1>
                <Card className="bg-gray-800 p-6">
                    <h2 className="text-2xl font-bold mb-6">{t('interviewSetup')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('difficulty')}</label>
                            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                                <option value="easy">{t('easy')}</option>
                                <option value="medium">{t('medium')}</option>
                                <option value="hard">{t('hard')}</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('programmingLanguage')}</label>
                            <Select value={programmingLanguage} onChange={(e) => setProgrammingLanguage(e.target.value)}>
                                <option value="any">{t('anyLanguage')}</option>
                                <option value="python">{t('python')}</option>
                                <option value="javascript">{t('javascript')}</option>
                                <option value="java">{t('java')}</option>
                                <option value="cpp">{t('cpp')}</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('topic')}</label>
                            <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
                                <option value="algorithms">{t('algorithms')}</option>
                                <option value="data-structures">{t('dataStructures')}</option>
                                <option value="dynamic-programming">{t('dynamicProgramming')}</option>
                                <option value="graph">{t('graphTheory')}</option>
                                <option value="string">{t('string')}</option>
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
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    {onBackToSetup && (
                        <Button onClick={onBackToSetup} variant="outline" size="sm">
                            ← {t('backToSetup')}
                        </Button>
                    )}
                    <h1 className="text-3xl font-bold">
                        {typeof questionData?.title === 'object' ? questionData.title[language] : questionData?.title}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-mono">{formatTime(timeSpent)} / {formatTime(timeLimit)}</span>
                    </div>
                    <Button onClick={toggleTimer} variant="outline" size="sm">
                        {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                    <Button onClick={endInterview} variant="outline" size="sm">
                        <Square size={16} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Question and Solution */}
                <div className="space-y-6">
                    <Card className="bg-gray-800">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">{t('currentQuestion')}</h2>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-gray-300">
                                    {typeof questionData?.description === 'object' ? questionData.description[language] : questionData?.description}
                                </p>
                                {questionData?.example && (
                                    <div className="mt-4">
                                        <h3 className="font-semibold mb-2">{t('example')}</h3>
                                        <pre className="bg-gray-900 p-4 rounded-md text-sm overflow-x-auto">
                                            {questionData.example}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gray-800">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">{t('solution')}</h2>
                            <Textarea
                                value={solution}
                                onChange={(e) => setSolution(e.target.value)}
                                placeholder={t('pleaseProvideSolution')}
                                className="h-48 font-mono"
                            />
                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">{t('approach')}</h3>
                                <Textarea
                                    value={approach}
                                    onChange={(e) => setApproach(e.target.value)}
                                    placeholder="Describe your approach..."
                                    className="h-24"
                                />
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button 
                                    onClick={submitSolution} 
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? t('analyzing') : t('submitForAnalysis')}
                                </Button>
                                {showHints && (
                                    <Button variant="outline" onClick={() => setShowHints(false)}>
                                        <Lightbulb size={16} className="mr-2" />
                                        {t('hideHints')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* AI Analysis and Save Dialog */}
                <div>
                    <Card className="bg-gray-800 h-full">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">{t('aiAnalysis')}</h2>
                            {isSubmitting ? (
                                <div className="text-center text-gray-400 py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <p>{t('analyzingCode')}</p>
                                </div>
                            ) : aiAnalysis ? (
                                <div className="space-y-4">
                                    {/* 测试结果 */}
                                    {aiAnalysis.testResults && (
                                        <div className="bg-gray-700 p-4 rounded-lg">
                                            <h3 className="font-semibold mb-2">{t('testResults')}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium ${aiAnalysis.testResults.passed ? 'text-green-500' : 'text-yellow-500'}`}>
                                                    {aiAnalysis.testResults.passed ? '✓' : '⚠'}
                                                </span>
                                                <span className="text-sm">{aiAnalysis.testResults.summary}</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* 复杂度分析 */}
                                    {aiAnalysis.complexity && (
                                        <div className="bg-gray-700 p-4 rounded-lg">
                                            <h3 className="font-semibold mb-2">{t('complexityAnalysis')}</h3>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-400">{t('timeComplexity')}: </span>
                                                    <span className="font-mono">{aiAnalysis.complexity.time}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">{t('spaceComplexity')}: </span>
                                                    <span className="font-mono">{aiAnalysis.complexity.space}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* AI分析 */}
                                    {aiAnalysis.aiAnalysis && (
                                        <div className="bg-gray-700 p-4 rounded-lg">
                                            <h3 className="font-semibold mb-2">{t('aiReview')}</h3>
                                            <div className="text-sm text-gray-300 whitespace-pre-line">
                                                {aiAnalysis.aiAnalysis}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* 保存对话框 */}
                                    {showSaveDialog && (
                                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                                            <h3 className="font-semibold mb-2 text-blue-400">{t('saveToLearningHistory')}</h3>
                                            <p className="text-sm text-gray-300 mb-4">{t('saveAnalysisDescription')}</p>
                                            <div className="flex gap-2">
                                                <Button 
                                                    onClick={saveToLearningHistory}
                                                    className="bg-green-600 hover:bg-green-700 text-sm"
                                                >
                                                    {t('saveAnalysis')}
                                                </Button>
                                                <Button 
                                                    onClick={skipSaving}
                                                    variant="outline"
                                                    className="text-sm"
                                                >
                                                    {t('skipSaving')}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-8">
                                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>{t('submitSolutionForAnalysis')}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CodingInterview; 