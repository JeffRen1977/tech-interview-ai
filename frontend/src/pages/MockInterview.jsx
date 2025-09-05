import React, { useState, useEffect } from 'react';
import { Mic, Database, Sparkles, Play, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { apiRequest } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';
import CodingInterview from '../components/CodingInterview';
import SystemDesignInterview from '../components/SystemDesignInterview';
import BehavioralInterview from '../components/BehavioralInterview';

const MockInterview = () => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    
    // 状态管理
    const [questionType, setQuestionType] = useState('coding'); // coding, system-design, behavioral
    const [questionSource, setQuestionSource] = useState('database'); // database, ai
    const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [interviewState, setInterviewState] = useState('setup'); // setup, coding, system-design, behavioral
    const [interviewData, setInterviewData] = useState(null);
    const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(false);
    const [isQuestionListCollapsed, setIsQuestionListCollapsed] = useState(false);

    // 加载题库题目
    const loadDatabaseQuestions = async () => {
        setIsLoading(true);
        setError('');
        try {
            let endpoint;
            switch (questionType) {
                case 'coding':
                    endpoint = '/mock/coding-questions';
                    break;
                case 'system-design':
                    endpoint = '/mock/system-design-questions';
                    break;
                case 'behavioral':
                    endpoint = '/mock/behavioral-questions';
                    break;
                default:
                    endpoint = '/mock/coding-questions';
            }
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
    const generateAIQuestion = async (saveToDatabase = false) => {
        setIsGenerating(true);
        setError('');
        console.log('开始AI生成题目:', { questionType, difficulty, saveToDatabase });
        try {
            const requestData = {
                type: questionType,
                difficulty: difficulty,
                saveToDatabase: saveToDatabase
            };
            console.log('发送AI生成请求:', requestData);
            
            const data = await apiRequest('/mock/ai-generate', 'POST', requestData);
            console.log('AI生成响应:', data);
            
            if (data.question) {
                console.log('成功生成题目:', data.question.title);
                if (data.question.savedToDatabase) {
                    console.log('题目已保存到数据库:', data.question.collectionName);
                }
                setQuestions([data.question]);
                setSelectedQuestion(data.question);
            } else {
                console.error('AI生成响应中没有question字段:', data);
                setError(t('failedToGenerateQuestion'));
            }
        } catch (err) {
            console.error('AI生成题目失败:', err);
            console.error('错误详情:', err.message);
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
        
        // 准备面试数据
        const data = {
            question: selectedQuestion,
            type: questionType,
            source: questionSource,
            difficulty: difficulty
        };
        
        setInterviewData(data);
        
        // 根据题目类型切换到相应的面试组件
        switch (questionType) {
            case 'coding':
                setInterviewState('coding');
                break;
            case 'system-design':
                setInterviewState('system-design');
                break;
            case 'behavioral':
                setInterviewState('behavioral');
                break;
            default:
                console.error('Unknown question type:', questionType);
        }
    };

    // 放弃当前题目
    const abandonQuestion = () => {
        setSelectedQuestion(null);
        setQuestions([]);
        setError('');
    };

    // 重新生成题目
    const regenerateQuestion = () => {
        generateAIQuestion(false); // 重新生成时不保存到数据库
    };

    // 返回设置页面
    const backToSetup = () => {
        setInterviewState('setup');
        setInterviewData(null);
        setSelectedQuestion(null);
    };

    // 渲染题目列表
    const renderQuestionList = () => {
        if (questionSource === 'ai') {
            return (
                <div className="text-center py-8 space-y-4">
                    <div className="space-y-3 mobile-ai-generate-buttons">
                        <Button 
                            onClick={() => generateAIQuestion(false)} 
                            disabled={isGenerating}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mobile-mock-button"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    <span className="text-sm lg:text-base">{t('generating')}</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    <span className="text-sm lg:text-base">{t('generateQuestion')}</span>
                                </>
                            )}
                        </Button>
                        
                        <Button 
                            onClick={() => generateAIQuestion(true)} 
                            disabled={isGenerating}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 mobile-mock-button"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    <span className="text-sm lg:text-base">{t('generating')}</span>
                                </>
                            ) : (
                                <>
                                    <Database className="w-4 h-4 mr-2" />
                                    <span className="text-sm lg:text-base">{t('generateAndSave')}</span>
                                </>
                            )}
                        </Button>
                    </div>
                    
                    <p className="text-sm text-gray-400">
                        {t('generateAndSaveHint')}
                    </p>
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
            <div className="space-y-1 max-h-64 lg:max-h-96 overflow-y-auto mobile-question-list mobile-compact-question-list">
                {questions.map((question) => (
                    <div
                        key={question.id || question.title}
                        onClick={() => setSelectedQuestion(question)}
                        className={`p-2 lg:p-3 rounded-lg cursor-pointer transition-colors mobile-question-item mobile-mock-question-card mobile-compact-question-card ${
                            selectedQuestion?.id === question.id || selectedQuestion?.title === question.title
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-xs lg:text-sm mobile-mock-question-title mobile-compact-question-title flex-1 truncate">
                                {language === 'en' && question.englishTitle ? question.englishTitle : 
                                 typeof question.title === 'object' ? question.title[language] : question?.title}
                            </span>
                            {question.difficulty && (
                                <span className={`px-1.5 py-0.5 rounded text-xs font-bold mobile-difficulty-badge mobile-compact-difficulty-badge flex-shrink-0 ${
                                    question.difficulty.toLowerCase() === 'easy' || question.difficulty === '入门'
                                        ? 'bg-green-600 text-white'
                                        : question.difficulty.toLowerCase() === 'medium' || question.difficulty === '中等'
                                        ? 'bg-yellow-500 text-gray-900'
                                        : question.difficulty.toLowerCase() === 'hard' || question.difficulty === '困难'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-500 text-white'
                                }`}>
                                    {language === 'en' ? 
                                        (question.difficulty === '简单' ? 'E' : 
                                         question.difficulty === '中等' ? 'M' : 
                                         question.difficulty === '困难' ? 'H' : question.difficulty.charAt(0).toUpperCase()) 
                                        : question.difficulty.charAt(0)}
                                </span>
                            )}
                        </div>
                        <p className="text-xs mt-1 line-clamp-1 lg:line-clamp-2 mobile-mock-question-desc mobile-compact-question-desc text-gray-300">
                            {language === 'en' && question.englishDescription ? question.englishDescription :
                             typeof (question.description || question.prompt || question.question) === 'object' 
                                ? (question.description || question.prompt || question.question)[language]
                                : (question.description || question.prompt || question.question)}
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

        // 检查是否是AI生成的系统设计或行为面试题目
        const isAIGeneratedNonCoding = questionSource === 'ai' && 
            (questionType === 'system-design' || questionType === 'behavioral');

        if (isAIGeneratedNonCoding) {
            return (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-lg lg:text-xl font-semibold">
                            {language === 'en' && selectedQuestion?.englishTitle ? selectedQuestion.englishTitle :
                             typeof selectedQuestion?.title === 'object' ? selectedQuestion.title[language] : selectedQuestion?.title}
                        </h3>
                        {selectedQuestion.difficulty && (
                            <span className={`px-3 py-1 rounded text-sm font-bold self-start sm:self-auto ${
                                selectedQuestion.difficulty.toLowerCase() === 'easy' || selectedQuestion.difficulty === '入门'
                                    ? 'bg-green-600 text-white'
                                    : selectedQuestion.difficulty.toLowerCase() === 'medium' || selectedQuestion.difficulty === '中等'
                                    ? 'bg-yellow-500 text-gray-900'
                                    : selectedQuestion.difficulty.toLowerCase() === 'hard' || selectedQuestion.difficulty === '困难'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-500 text-white'
                            }`}>
                                {language === 'en' ? 
                                    (selectedQuestion.difficulty === '简单' ? 'Easy' : 
                                     selectedQuestion.difficulty === '中等' ? 'Medium' : 
                                     selectedQuestion.difficulty === '困难' ? 'Hard' : selectedQuestion.difficulty) 
                                    : selectedQuestion.difficulty}
                            </span>
                        )}
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">{t('description')}</h4>
                        <p className="text-gray-300">
                            {language === 'en' && selectedQuestion?.englishDescription ? selectedQuestion.englishDescription :
                             typeof (selectedQuestion?.description || selectedQuestion?.prompt) === 'object'
                                ? (selectedQuestion.description || selectedQuestion.prompt)[language]
                                : (selectedQuestion?.description || selectedQuestion?.prompt)}
                        </p>
                    </div>

                    {selectedQuestion.example && (
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">{t('example')}</h4>
                            <p className="text-gray-300">{selectedQuestion.example}</p>
                        </div>
                    )}

                    {/* 对于AI生成的题目，隐藏答案让用户通过面试获取反馈 */}
                    {questionSource === 'database' && selectedQuestion.sampleAnswer && (
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">{t('sampleAnswer')}</h4>
                            <p className="text-gray-300">{selectedQuestion.sampleAnswer}</p>
                        </div>
                    )}

                    {questionSource === 'database' && selectedQuestion.detailedAnswer && (
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">{t('detailedAnswer')}</h4>
                            <p className="text-gray-300">{selectedQuestion.detailedAnswer}</p>
                        </div>
                    )}

                    {/* AI生成题目的操作按钮 */}
                    <div className="space-y-3">
                        <Button 
                            onClick={startInterview}
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            <span className="text-sm lg:text-base">{t('startInterview')}</span>
                        </Button>
                        
                        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                            <Button 
                                onClick={regenerateQuestion}
                                disabled={isGenerating}
                                variant="outline"
                                className="w-full"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4 mr-2" />
                                )}
                                <span className="text-sm lg:text-base">{t('regenerateQuestion')}</span>
                            </Button>
                            
                            <Button 
                                onClick={abandonQuestion}
                                variant="outline"
                                className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                                <X className="w-4 h-4 mr-2" />
                                <span className="text-sm lg:text-base">{t('abandonQuestion')}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        // 其他题目的原有布局
        return (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-lg lg:text-xl font-semibold">
                        {language === 'en' && selectedQuestion?.englishTitle ? selectedQuestion.englishTitle :
                         typeof selectedQuestion?.title === 'object' ? selectedQuestion.title[language] : selectedQuestion?.title}
                    </h3>
                    {selectedQuestion.difficulty && (
                        <span className={`px-3 py-1 rounded text-sm font-bold self-start sm:self-auto ${
                            selectedQuestion.difficulty.toLowerCase() === 'easy' || selectedQuestion.difficulty === '入门'
                                ? 'bg-green-600 text-white'
                                : selectedQuestion.difficulty.toLowerCase() === 'medium' || selectedQuestion.difficulty === '中等'
                                ? 'bg-yellow-500 text-gray-900'
                                : selectedQuestion.difficulty.toLowerCase() === 'hard' || selectedQuestion.difficulty === '困难'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-500 text-white'
                        }`}>
                            {language === 'en' ? 
                                (selectedQuestion.difficulty === '简单' ? 'Easy' : 
                                 selectedQuestion.difficulty === '中等' ? 'Medium' : 
                                 selectedQuestion.difficulty === '困难' ? 'Hard' : selectedQuestion.difficulty) 
                                : selectedQuestion.difficulty}
                        </span>
                    )}
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">{t('description')}</h4>
                    <p className="text-gray-300">
                        {language === 'en' && selectedQuestion?.englishDescription ? selectedQuestion.englishDescription :
                         typeof (selectedQuestion?.description || selectedQuestion?.prompt) === 'object'
                            ? (selectedQuestion.description || selectedQuestion?.prompt)[language]
                            : (selectedQuestion?.description || selectedQuestion?.prompt)}
                    </p>
                </div>

                {selectedQuestion.example && (
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">{t('example')}</h4>
                        <p className="text-gray-300">{selectedQuestion.example}</p>
                    </div>
                )}

                {selectedQuestion.sampleAnswer && (
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">{t('sampleAnswer')}</h4>
                        <p className="text-gray-300">{selectedQuestion.sampleAnswer}</p>
                    </div>
                )}

                {selectedQuestion.detailedAnswer && (
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">{t('detailedAnswer')}</h4>
                        <p className="text-gray-300">{selectedQuestion.detailedAnswer}</p>
                    </div>
                )}

                <Button 
                    onClick={startInterview}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                    <Play className="w-4 h-4 mr-2" />
                    <span className="text-sm lg:text-base">{t('startInterview')}</span>
                </Button>
            </div>
        );
    };

    // 根据面试状态渲染不同的内容
    if (interviewState === 'coding') {
        return <CodingInterview mockInterviewData={interviewData} onBackToSetup={backToSetup} />;
    }
    
    if (interviewState === 'system-design') {
        return <SystemDesignInterview mockInterviewData={interviewData} onBackToSetup={backToSetup} />;
    }
    
    if (interviewState === 'behavioral') {
        return <BehavioralInterview mockInterviewData={interviewData} onBackToSetup={backToSetup} />;
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4 lg:p-6 mobile-mock-interview min-w-0">
            <h1 className="text-2xl lg:text-4xl font-bold mb-6 lg:mb-8 break-words">{t('aiMockInterviewTitle')}</h1>
            
            {/* 面试设置 */}
            <Card className="bg-gray-800 p-4 lg:p-6 mb-4 lg:mb-6 mobile-mock-settings mobile-compact-settings">
                <div 
                    className="flex items-center justify-between cursor-pointer lg:cursor-default"
                    onClick={() => setIsSettingsCollapsed(!isSettingsCollapsed)}
                >
                    <h2 className="text-lg lg:text-xl font-bold">{t('interviewSettings')}</h2>
                    <button className="lg:hidden p-1 mobile-collapse-button">
                        {isSettingsCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </button>
                </div>
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 transition-all duration-300 w-full min-w-0 ${
                    isSettingsCollapsed ? 'lg:block hidden' : 'block'
                }`}>
                    {/* 题目类型 */}
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('questionType')}</label>
                        <Select 
                            value={questionType} 
                            onChange={(e) => setQuestionType(e.target.value)}
                        >
                            <option value="coding">{t('codingQuestion')}</option>
                            <option value="system-design">{t('systemDesignQuestion')}</option>
                            <option value="behavioral">{t('behavioralQuestion')}</option>
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
            {questionSource === 'ai' && (questionType === 'system-design' || questionType === 'behavioral') ? (
                // AI生成的系统设计或行为面试题目特殊布局
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6 w-full min-w-0">
                    {/* 左侧：题目和答案 */}
                    <Card className="bg-gray-800 p-4 lg:p-6 mobile-mock-card">
                        <h3 className="text-base lg:text-lg font-semibold mb-4">{t('questionDetail')}</h3>
                        {selectedQuestion ? (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <h3 className="text-lg lg:text-xl font-semibold">
                                        {typeof selectedQuestion?.title === 'object' ? selectedQuestion.title[language] : selectedQuestion?.title}
                                    </h3>
                                    {selectedQuestion.difficulty && (
                                        <span className={`px-3 py-1 rounded text-sm font-bold self-start sm:self-auto ${
                                            selectedQuestion.difficulty.toLowerCase() === 'easy' || selectedQuestion.difficulty === '入门'
                                                ? 'bg-green-600 text-white'
                                                : selectedQuestion.difficulty.toLowerCase() === 'medium' || selectedQuestion.difficulty === '中等'
                                                ? 'bg-yellow-500 text-gray-900'
                                                : selectedQuestion.difficulty.toLowerCase() === 'hard' || selectedQuestion.difficulty === '困难'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-500 text-white'
                                        }`}>
                                            {selectedQuestion.difficulty}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">{t('description')}</h4>
                                    <p className="text-gray-300">
                                        {language === 'en' && selectedQuestion?.englishDescription ? selectedQuestion.englishDescription :
                                         typeof (selectedQuestion?.description || selectedQuestion?.prompt) === 'object'
                                            ? (selectedQuestion.description || selectedQuestion?.prompt)[language]
                                            : (selectedQuestion?.description || selectedQuestion?.prompt)}
                                    </p>
                                </div>

                                {selectedQuestion.example && (
                                    <div className="bg-gray-800 p-4 rounded-lg">
                                        <h4 className="font-medium mb-2">{t('example')}</h4>
                                        <p className="text-gray-300">{selectedQuestion.example}</p>
                                    </div>
                                )}

                                {/* 提示用户通过面试获取答案和反馈 */}
                                <div className="bg-blue-900 border border-blue-700 text-blue-200 px-4 py-3 rounded">
                                    <p className="text-sm">
                                        💡 {t('aiQuestionHint')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 space-y-4">
                                <div className="space-y-3">
                                    <Button 
                                        onClick={() => generateAIQuestion(false)} 
                                        disabled={isGenerating}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
                                    
                                    <Button 
                                        onClick={() => generateAIQuestion(true)} 
                                        disabled={isGenerating}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {t('generating')}
                                            </>
                                        ) : (
                                            <>
                                                <Database className="w-4 h-4 mr-2" />
                                                {t('generateAndSave')}
                                            </>
                                        )}
                                    </Button>
                                </div>
                                
                                <p className="text-sm text-gray-400">
                                    {t('generateAndSaveHint')}
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* 右侧：操作按钮 */}
                    <Card className="bg-gray-800 p-4 lg:p-6 mobile-mock-card">
                        <h3 className="text-base lg:text-lg font-semibold mb-4">{t('interviewActions')}</h3>
                        {selectedQuestion ? (
                            <div className="space-y-4">
                                <div className="text-center py-4">
                                    <p className="text-gray-300 mb-4">{t('readyToStartInterview')}</p>
                                </div>
                                
                                <Button 
                                    onClick={startInterview}
                                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    {t('startInterview')}
                                </Button>
                                
                                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                                    <Button 
                                        onClick={regenerateQuestion}
                                        disabled={isGenerating}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4 mr-2" />
                                        )}
                                        <span className="text-sm lg:text-base">{t('regenerateQuestion')}</span>
                                    </Button>
                                    
                                    <Button 
                                        onClick={abandonQuestion}
                                        variant="outline"
                                        className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        <span className="text-sm lg:text-base">{t('abandonQuestion')}</span>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p>{t('generateQuestionFirst')}</p>
                            </div>
                        )}
                    </Card>
                </div>
            ) : (
                // 其他题目的原有布局
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6 w-full min-w-0">
                    {/* 左侧：题目列表 */}
                    <Card className="bg-gray-800 p-4 lg:p-6 mobile-mock-card">
                        <div 
                            className="flex items-center justify-between cursor-pointer lg:cursor-default mb-4"
                            onClick={() => setIsQuestionListCollapsed(!isQuestionListCollapsed)}
                        >
                            <h3 className="text-base lg:text-lg font-semibold">
                                {questionSource === 'database' ? t('questionBank') : t('aiGeneration')}
                            </h3>
                            <button className="lg:hidden p-1 mobile-collapse-button">
                                {isQuestionListCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className={`transition-all duration-300 ${
                            isQuestionListCollapsed ? 'lg:block hidden' : 'block'
                        }`}>
                            {renderQuestionList()}
                        </div>
                    </Card>

                    {/* 右侧：题目详情 */}
                    <Card className="bg-gray-800 p-4 lg:p-6 mobile-mock-card">
                        <h3 className="text-base lg:text-lg font-semibold mb-4">{t('questionDetail')}</h3>
                        {renderQuestionDetail()}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MockInterview;
