import React, { useState, useEffect } from 'react';
import { Mic, Database, Sparkles, Play, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { apiRequest } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';

const MockInterview = () => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    
    // 状态管理
    const [questionType, setQuestionType] = useState('coding'); // coding, system-design
    const [questionSource, setQuestionSource] = useState('database'); // database, ai
    const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    // 加载题库题目
    const loadDatabaseQuestions = async () => {
        setIsLoading(true);
        setError('');
        try {
            const endpoint = questionType === 'coding' ? '/mock/coding-questions' : '/mock/system-design-questions';
            const params = difficulty !== 'all' ? `?difficulty=${difficulty}` : '';
            const data = await apiRequest(`${endpoint}${params}`, 'GET');
            
            if (data.questions && data.questions.length > 0) {
                setQuestions(data.questions);
                setSelectedQuestion(data.questions[0]);
            } else {
                setQuestions([]);
                setSelectedQuestion(null);
                setError(t('noQuestionsFound'));
            }
        } catch (err) {
            console.error('加载题目失败:', err);
            setError(t('failedToLoadQuestions'));
        } finally {
            setIsLoading(false);
        }
    };

    // AI生成题目
    const generateAIQuestion = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const data = await apiRequest('/mock/ai-generate', 'POST', {
                type: questionType,
                difficulty: difficulty
            });
            
            if (data.question) {
                setQuestions([data.question]);
                setSelectedQuestion(data.question);
            } else {
                setError(t('failedToGenerateQuestion'));
            }
        } catch (err) {
            console.error('AI生成题目失败:', err);
            setError(t('failedToGenerateQuestion'));
        } finally {
            setIsGenerating(false);
        }
    };

    // 当题目类型或来源改变时重新加载
    useEffect(() => {
        if (questionSource === 'database') {
            loadDatabaseQuestions();
        } else {
            setQuestions([]);
            setSelectedQuestion(null);
        }
    }, [questionType, questionSource, difficulty]);

    // 开始面试
    const startInterview = () => {
        if (!selectedQuestion) {
            setError(t('pleaseSelectQuestion'));
            return;
        }
        // 这里可以跳转到具体的面试组件或开始面试流程
        console.log('开始面试:', selectedQuestion);
    };

    // 渲染题目列表
    const renderQuestionList = () => {
        if (questionSource === 'ai') {
            return (
                <div className="text-center py-8">
                    <Button 
                        onClick={generateAIQuestion} 
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t('generating')}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                {t('generateQuestion')}
                            </>
                        )}
                    </Button>
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2" />
                    <p>{t('loading')}</p>
                </div>
            );
        }

        if (questions.length === 0) {
            return (
                <div className="text-center py-8 text-gray-400">
                    <p>{error || t('noQuestionsFound')}</p>
                </div>
            );
        }

        return (
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {questions.map((question) => (
                    <div
                        key={question.id || question.title}
                        onClick={() => setSelectedQuestion(question)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedQuestion?.id === question.id || selectedQuestion?.title === question.title
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{question.title}</span>
                            {question.difficulty && (
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    question.difficulty === 'easy' || question.difficulty === '入门'
                                        ? 'bg-green-600 text-white'
                                        : question.difficulty === 'medium' || question.difficulty === '中等'
                                        ? 'bg-yellow-500 text-gray-900'
                                        : question.difficulty === 'hard' || question.difficulty === '困难'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-500 text-white'
                                }`}>
                                    {question.difficulty}
                                </span>
                            )}
                        </div>
                        <p className="text-sm mt-1 line-clamp-2">
                            {question.description || question.prompt}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    // 渲染题目详情
    const renderQuestionDetail = () => {
        if (!selectedQuestion) {
            return (
                <div className="text-center py-8 text-gray-400">
                    <p>{t('selectQuestionToStart')}</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{selectedQuestion.title}</h3>
                    {selectedQuestion.difficulty && (
                        <span className={`px-3 py-1 rounded text-sm font-bold ${
                            selectedQuestion.difficulty === 'easy' || selectedQuestion.difficulty === '入门'
                                ? 'bg-green-600 text-white'
                                : selectedQuestion.difficulty === 'medium' || selectedQuestion.difficulty === '中等'
                                ? 'bg-yellow-500 text-gray-900'
                                : selectedQuestion.difficulty === 'hard' || selectedQuestion.difficulty === '困难'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-500 text-white'
                        }`}>
                            {selectedQuestion.difficulty}
                        </span>
                    )}
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">{t('description')}</h4>
                    <p className="text-gray-300">{selectedQuestion.description || selectedQuestion.prompt}</p>
                </div>

                {selectedQuestion.example && (
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">{t('example')}</h4>
                        <p className="text-gray-300">{selectedQuestion.example}</p>
                    </div>
                )}

                <Button 
                    onClick={startInterview}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                    <Play className="w-4 h-4 mr-2" />
                    {t('startInterview')}
                </Button>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-4xl font-bold mb-8">{t('aiMockInterviewTitle')}</h1>
            
            {/* 面试设置 */}
            <Card className="bg-gray-800 p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">{t('interviewSettings')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* 题目类型 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('questionType')}</label>
                        <Select 
                            value={questionType} 
                            onChange={(e) => setQuestionType(e.target.value)}
                        >
                            <option value="coding">{t('codingQuestion')}</option>
                            <option value="system-design">{t('systemDesignQuestion')}</option>
                        </Select>
                    </div>

                    {/* 题目来源 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('questionSource')}</label>
                        <Select 
                            value={questionSource} 
                            onChange={(e) => setQuestionSource(e.target.value)}
                        >
                            <option value="database">
                                <Database className="w-4 h-4 mr-2" />
                                {t('databaseQuestions')}
                            </option>
                            <option value="ai">
                                <Sparkles className="w-4 h-4 mr-2" />
                                {t('aiGenerated')}
                            </option>
                        </Select>
                    </div>

                    {/* 难度选择 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('difficulty')}</label>
                        <Select 
                            value={difficulty} 
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <option value="all">{t('allDifficulties')}</option>
                            <option value="easy">{t('easy')}</option>
                            <option value="medium">{t('medium')}</option>
                            <option value="hard">{t('hard')}</option>
                        </Select>
                    </div>

                    {/* 刷新按钮 */}
                    {questionSource === 'database' && (
                        <div className="flex items-end">
                            <Button 
                                onClick={loadDatabaseQuestions}
                                disabled={isLoading}
                                variant="outline"
                                className="w-full"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    t('refresh')
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {/* 错误提示 */}
            {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* 题目选择和详情 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左侧：题目列表 */}
                <Card className="bg-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {questionSource === 'database' ? t('questionBank') : t('aiGeneration')}
                    </h3>
                    {renderQuestionList()}
                </Card>

                {/* 右侧：题目详情 */}
                <Card className="bg-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-4">{t('questionDetail')}</h3>
                    {renderQuestionDetail()}
                </Card>
            </div>
        </div>
    );
};

export default MockInterview;
