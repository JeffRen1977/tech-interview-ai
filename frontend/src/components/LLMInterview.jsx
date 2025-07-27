import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { apiRequest } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';
import { 
    BookOpen, Clock, Target, CheckCircle, AlertCircle, 
    Search, Filter, RefreshCw, Save, Lightbulb, Eye, EyeOff,
    Play, Pause, Square, Timer, Star, TrendingUp, Brain, Globe
} from 'lucide-react';

const LLMInterview = () => {
    const { language, toggleLanguage, isChinese } = useLanguage();
    const t = (key) => getText(key, language);
    
    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [categories, setCategories] = useState([]);
    const [difficulties, setDifficulties] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showTimer, setShowTimer] = useState(false);

    // 获取题目分类
    useEffect(() => {
        fetchCategories();
    }, []);

    // 获取所有题目
    useEffect(() => {
        fetchQuestions();
    }, []);

    // 筛选题目
    useEffect(() => {
        filterQuestions();
    }, [questions, selectedCategory, selectedDifficulty, searchTerm]);

    // 计时器效果
    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const fetchCategories = async () => {
        try {
            const response = await apiRequest('/llm/categories', 'GET');
            setCategories(response.categories || []);
            setDifficulties(response.difficulties || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const response = await apiRequest('/llm/questions', 'GET');
            console.log('Fetched questions:', response.questions);
            setQuestions(response.questions || []);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterQuestions = () => {
        let filtered = [...questions];

        // 按分类筛选
        if (selectedCategory) {
            filtered = filtered.filter(q => q.category === selectedCategory);
        }

        // 按难度筛选
        if (selectedDifficulty) {
            filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
        }

        // 按搜索词筛选
        if (searchTerm) {
            filtered = filtered.filter(q => 
                q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (q.englishTitle && q.englishTitle.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredQuestions(filtered);
    };

    const handleQuestionSelect = (question) => {
        setSelectedQuestion(question);
        setShowAnswer(false);
        setUserAnswer('');
        setAnalysis(null);
        setTimer(0);
        setIsTimerRunning(false);
        setShowTimer(true);
    };

    const startTimer = () => {
        setIsTimerRunning(true);
    };

    const pauseTimer = () => {
        setIsTimerRunning(false);
    };

    const resetTimer = () => {
        setTimer(0);
        setIsTimerRunning(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnalyze = async () => {
        if (!selectedQuestion || !userAnswer.trim()) {
            alert(t('pleaseEnterAnswer'));
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await apiRequest('/llm/analyze', 'POST', {
                questionData: selectedQuestion,
                userAnswer: userAnswer,
                timeSpent: timer
            });
            setAnalysis(response.feedback);
        } catch (error) {
            console.error('Error analyzing answer:', error);
            alert(t('analysisError'));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveToHistory = async () => {
        if (!selectedQuestion) return;

        try {
            await apiRequest('/llm/learning-history', 'POST', {
                questionId: selectedQuestion.id,
                completedAt: new Date()
            });
            alert(t('savedToHistory'));
        } catch (error) {
            console.error('Error saving to history:', error);
            alert(t('saveError'));
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case '简单':
            case 'Easy': return 'text-green-500';
            case '中等':
            case 'Medium': return 'text-yellow-500';
            case '困难':
            case 'Hard': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            'LLM Fine-tuning': 'bg-blue-100 text-blue-800',
            'RAG': 'bg-green-100 text-green-800',
            'LLM Architecture': 'bg-purple-100 text-purple-800',
            'LLM Advanced Topics': 'bg-orange-100 text-orange-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const getDifficultyIcon = (difficulty) => {
        switch (difficulty) {
            case '简单':
            case 'Easy': return <Star className="w-4 h-4 text-green-500" />;
            case '中等':
            case 'Medium': return <TrendingUp className="w-4 h-4 text-yellow-500" />;
            case '困难':
            case 'Hard': return <Brain className="w-4 h-4 text-red-500" />;
            default: return <Star className="w-4 h-4 text-gray-500" />;
        }
    };

    const getDifficultyDisplay = (difficulty) => {
        if (language === 'en') {
            switch (difficulty) {
                case '简单': return 'Easy';
                case '中等': return 'Medium';
                case '困难': return 'Hard';
                default: return difficulty;
            }
        }
        return difficulty;
    };

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            <BookOpen className="inline mr-2" />
                            {t('llmInterview')}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t('llmInterviewDescription')}
                        </p>
                    </div>
                    <Button 
                        onClick={toggleLanguage} 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Globe size={16} />
                        {isChinese ? 'EN' : '中文'}
                    </Button>
                </div>
            </div>

            {/* 筛选和搜索 */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center space-x-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder={t('searchQuestions')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="min-w-[200px]"
                    >
                        <option value="">{t('allCategories')}</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </Select>
                    
                    <Select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="min-w-[150px]"
                    >
                        <option value="">{t('allDifficulties')}</option>
                        {difficulties.map(difficulty => (
                            <option key={difficulty} value={difficulty}>{getDifficultyDisplay(difficulty)}</option>
                        ))}
                    </Select>
                    
                    <Button onClick={fetchQuestions} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t('refresh')}
                    </Button>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    {t('foundQuestions')}: {filteredQuestions.length}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 题目列表 */}
                <div className="lg:col-span-1">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <BookOpen className="w-5 h-5 mr-2" />
                            {t('questionList')}
                        </h3>
                        {isLoading ? (
                            <div className="text-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                <p>{t('loading')}</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {filteredQuestions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                        <p>没有找到匹配的题目</p>
                                    </div>
                                ) : (
                                    filteredQuestions.map(question => (
                                        <div
                                            key={question.id}
                                            onClick={() => handleQuestionSelect(question)}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                                                selectedQuestion?.id === question.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm mb-2 line-clamp-2 leading-tight">
                                                        {language === 'en' && question.englishTitle ? question.englishTitle : question.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                                        {language === 'en' && question.englishDescription ? question.englishDescription : question.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(question.category)}`}>
                                                        {question.category}
                                                    </span>
                                                    <div className="flex items-center space-x-1">
                                                        {getDifficultyIcon(question.difficulty)}
                                                        <span className={`text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                                                            {getDifficultyDisplay(question.difficulty)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                {/* 题目详情和解答 */}
                <div className="lg:col-span-2">
                    {selectedQuestion ? (
                        <div className="space-y-6">
                            {/* 题目信息 */}
                            <Card className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            {getDifficultyIcon(selectedQuestion.difficulty)}
                                            <h2 className="text-xl font-bold">
                                                {language === 'en' && selectedQuestion.englishTitle ? selectedQuestion.englishTitle : selectedQuestion.title}
                                            </h2>
                                        </div>
                                        {language === 'zh' && selectedQuestion.englishTitle && (
                                            <p className="text-gray-600 dark:text-gray-400 mb-3 italic">
                                                {selectedQuestion.englishTitle}
                                            </p>
                                        )}
                                                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                            <p className="text-gray-900 dark:text-white leading-relaxed font-medium">
                                {language === 'en' && selectedQuestion.englishDescription ? selectedQuestion.englishDescription : selectedQuestion.description}
                            </p>
                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(selectedQuestion.category)}`}>
                                                {selectedQuestion.category}
                                            </span>
                                            <span className={`text-sm font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                                                {getDifficultyDisplay(selectedQuestion.difficulty)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button onClick={handleSaveToHistory} variant="outline" size="sm">
                                            <Save className="w-4 h-4 mr-2" />
                                            {t('saveToHistory')}
                                        </Button>
                                        <Button 
                                            onClick={() => setShowAnswer(!showAnswer)} 
                                            variant="outline" 
                                            size="sm"
                                        >
                                            {showAnswer ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                            {showAnswer ? t('hideAnswer') : t('showAnswer')}
                                        </Button>
                                    </div>
                                </div>

                                {/* 设计步骤 */}
                                {selectedQuestion.designSteps && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                                            <Target className="w-5 h-5 mr-2" />
                                            {t('designSteps')}
                                        </h3>
                                        <ol className="list-decimal list-inside space-y-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                            {(language === 'en' && selectedQuestion.englishDesignSteps ? selectedQuestion.englishDesignSteps : selectedQuestion.designSteps).map((step, index) => (
                                                <li key={index} className="text-gray-900 dark:text-white pl-4 font-medium">
                                                    {step}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}

                                {/* 关键点 */}
                                {selectedQuestion.keyPoints && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            {t('keyPoints')}
                                        </h3>
                                        <ul className="space-y-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                            {(language === 'en' && selectedQuestion.englishKeyPoints ? selectedQuestion.englishKeyPoints : selectedQuestion.keyPoints).map((point, index) => (
                                                <li key={index} className="flex items-start">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-900 dark:text-white font-medium">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </Card>

                            {/* 计时器和答题区域 */}
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">{t('yourAnswer')}</h3>
                                    {showTimer && (
                                        <div className="flex items-center space-x-2">
                                            <Timer className="w-4 h-4 text-gray-500" />
                                            <span className="font-mono text-lg">{formatTime(timer)}</span>
                                            <div className="flex space-x-1">
                                                {!isTimerRunning ? (
                                                    <Button onClick={startTimer} size="sm" variant="outline">
                                                        <Play className="w-3 h-3" />
                                                    </Button>
                                                ) : (
                                                    <Button onClick={pauseTimer} size="sm" variant="outline">
                                                        <Pause className="w-3 h-3" />
                                                    </Button>
                                                )}
                                                <Button onClick={resetTimer} size="sm" variant="outline">
                                                    <Square className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <Textarea
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder={t('enterYourAnswer')}
                                    className="min-h-[300px] mb-4 resize-none"
                                />
                                
                                <div className="flex space-x-3">
                                    <Button 
                                        onClick={handleAnalyze} 
                                        disabled={!userAnswer.trim() || isAnalyzing}
                                        className="flex-1"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                {t('analyzing')}
                                            </>
                                        ) : (
                                            <>
                                                <Lightbulb className="w-4 h-4 mr-2" />
                                                {t('analyzeAnswer')}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>

                            {/* AI分析结果 */}
                            {analysis && (
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                                        <Brain className="w-5 h-5 mr-2" />
                                        {t('aiAnalysis')}
                                    </h3>
                                    <div className="space-y-6">
                                        {/* 评分卡片 */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
                                                <div className="text-3xl font-bold">{analysis.overallScore}</div>
                                                <div className="text-sm opacity-90">{t('overallScore')}</div>
                                            </div>
                                            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
                                                <div className="text-2xl font-bold">
                                                    {analysis.categoryScores?.technicalAccuracy || 0}
                                                </div>
                                                <div className="text-sm opacity-90">技术准确性</div>
                                            </div>
                                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
                                                <div className="text-2xl font-bold">
                                                    {analysis.categoryScores?.technicalDepth || 0}
                                                </div>
                                                <div className="text-sm opacity-90">技术深度</div>
                                            </div>
                                        </div>

                                        {/* 详细评分 */}
                                        {analysis.categoryScores && (
                                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                                <h4 className="font-semibold mb-3">详细评分</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {Object.entries(analysis.categoryScores).map(([key, score]) => (
                                                        <div key={key} className="flex justify-between items-center">
                                                            <span className="capitalize text-sm">{key}:</span>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                                    <div 
                                                                        className="bg-blue-500 h-2 rounded-full" 
                                                                        style={{width: `${score}%`}}
                                                                    ></div>
                                                                </div>
                                                                <span className="font-medium text-sm">{score}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 优点 */}
                                        {analysis.strengths && analysis.strengths.length > 0 && (
                                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                                <h4 className="font-semibold mb-3 text-green-700 dark:text-green-300 flex items-center">
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    {t('strengths')}
                                                </h4>
                                                <ul className="space-y-2">
                                                    {analysis.strengths.map((strength, index) => (
                                                        <li key={index} className="flex items-start text-green-700 dark:text-green-300">
                                                            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                                            <span>{strength}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* 需要改进的地方 */}
                                        {analysis.areasForImprovement && analysis.areasForImprovement.length > 0 && (
                                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                                                <h4 className="font-semibold mb-3 text-orange-700 dark:text-orange-300 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-2" />
                                                    {t('areasForImprovement')}
                                                </h4>
                                                <ul className="space-y-2">
                                                    {analysis.areasForImprovement.map((area, index) => (
                                                        <li key={index} className="flex items-start text-orange-700 dark:text-orange-300">
                                                            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                                            <span>{area}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* 建议 */}
                                        {analysis.recommendations && analysis.recommendations.length > 0 && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                                <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-300 flex items-center">
                                                    <Target className="w-4 h-4 mr-2" />
                                                    {t('recommendations')}
                                                </h4>
                                                <ul className="space-y-2">
                                                    {analysis.recommendations.map((rec, index) => (
                                                        <li key={index} className="flex items-start text-blue-700 dark:text-blue-300">
                                                            <Target className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                                            <span>{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                                                                {/* 技术反馈 */}
                                        {analysis.technicalFeedback && (
                                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                                <h4 className="font-semibold mb-3">{t('technicalFeedback')}</h4>
                                                <p className="text-gray-900 dark:text-white leading-relaxed font-medium">
                                                    {analysis.technicalFeedback}
                                                </p>
                                            </div>
                                        )}

                                        {/* 下一步 */}
                                        {analysis.nextSteps && (
                                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                                                <h4 className="font-semibold mb-3 text-indigo-700 dark:text-indigo-300 flex items-center">
                                                    <TrendingUp className="w-4 h-4 mr-2" />
                                                    {t('nextSteps')}
                                                </h4>
                                                <p className="text-indigo-700 dark:text-indigo-300 leading-relaxed">
                                                    {analysis.nextSteps}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}

                            {/* 标准答案 */}
                            {showAnswer && (
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                                        <BookOpen className="w-5 h-5 mr-2" />
                                        {t('standardAnswer')}
                                    </h3>
                                    <div className="prose max-w-none">
                                        <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white leading-relaxed bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto font-medium">
                                            {selectedQuestion.detailedAnswer}
                                        </pre>
                                    </div>
                                </Card>
                            )}
                        </div>
                    ) : (
                        <Card className="p-8 text-center">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">{t('selectQuestion')}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{t('selectQuestionDescription')}</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LLMInterview; 