import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { apiRequest } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';
import { 
    Clock, Calendar, TrendingUp, Award, AlertCircle, 
    CheckCircle, Lightbulb, BarChart3, Filter, Search
} from 'lucide-react';

const UserHistory = () => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [filterTopic, setFilterTopic] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalInterviews: 0,
        averageScore: 0,
        bestCategory: '',
        improvementAreas: []
    });

    useEffect(() => {
        fetchUserHistory();
    }, []);

    useEffect(() => {
        calculateStats();
    }, [history]);

    const fetchUserHistory = async () => {
        try {
            const response = await apiRequest('/questions/user-history', 'GET');
            setHistory(response.history || []);
        } catch (error) {
            console.error('Failed to fetch user history:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        if (history.length === 0) return;

        const totalInterviews = history.length;
        const totalScore = history.reduce((sum, interview) => 
            sum + (interview.finalReport?.overallScore || 0), 0);
        const averageScore = Math.round(totalScore / totalInterviews);

        // Calculate best performing category
        const categoryScores = {};
        history.forEach(interview => {
            if (interview.finalReport?.categoryScores) {
                Object.entries(interview.finalReport.categoryScores).forEach(([category, score]) => {
                    if (!categoryScores[category]) {
                        categoryScores[category] = { total: 0, count: 0 };
                    }
                    categoryScores[category].total += score;
                    categoryScores[category].count += 1;
                });
            }
        });

        let bestCategory = '';
        let bestAverage = 0;
        Object.entries(categoryScores).forEach(([category, data]) => {
            const average = data.total / data.count;
            if (average > bestAverage) {
                bestAverage = average;
                bestCategory = category;
            }
        });

        // Find common improvement areas
        const improvementCounts = {};
        history.forEach(interview => {
            if (interview.finalReport?.areasForImprovement) {
                interview.finalReport.areasForImprovement.forEach(area => {
                    improvementCounts[area] = (improvementCounts[area] || 0) + 1;
                });
            }
        });

        const improvementAreas = Object.entries(improvementCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([area]) => area);

        setStats({
            totalInterviews,
            averageScore,
            bestCategory,
            improvementAreas
        });
    };

    const getInterviewTypeIcon = (type) => {
        switch (type) {
            case 'coding':
                return <BarChart3 className="w-5 h-5 text-blue-500" />;
            case 'system-design':
                return <Lightbulb className="w-5 h-5 text-green-500" />;
            case 'behavioral':
                return <Award className="w-5 h-5 text-purple-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getInterviewTypeName = (type) => {
        switch (type) {
            case 'coding':
                return t('codingInterview');
            case 'system-design':
                return t('systemDesignInterview');
            case 'behavioral':
                return t('behavioralInterview');
            default:
                return t('unknownType');
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy':
                return 'text-green-500';
            case 'medium':
                return 'text-yellow-500';
            case 'hard':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const filteredHistory = history.filter(interview => {
        const matchesType = filterType === 'all' || interview.interviewType === filterType;
        const matchesTopic = filterTopic === 'all' || interview.topic === filterTopic;
        const matchesSearch = !searchTerm || 
            interview.questionData?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            interview.questionData?.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesType && matchesTopic && matchesSearch;
    });

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-300">{t('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-4xl font-bold mb-8">{t('interviewHistory')}</h1>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gray-800 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">{t('totalInterviews')}</p>
                            <p className="text-2xl font-bold">{stats.totalInterviews}</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-blue-500" />
                    </div>
                </Card>

                <Card className="bg-gray-800 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">{t('averageScore')}</p>
                            <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                                {stats.averageScore}/100
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                </Card>

                <Card className="bg-gray-800 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">{t('bestCategory')}</p>
                            <p className="text-lg font-semibold">{stats.bestCategory || t('noData')}</p>
                        </div>
                        <Award className="w-8 h-8 text-yellow-500" />
                    </div>
                </Card>

                <Card className="bg-gray-800 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">{t('needsImprovement')}</p>
                            <p className="text-lg font-semibold">{stats.improvementAreas.length} {t('areas')}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-gray-800 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">{t('search')}</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('interviewType')}</label>
                        <Select 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">{t('allTypes')}</option>
                            <option value="coding">{t('codingInterview')}</option>
                            <option value="system-design">{t('systemDesignInterview')}</option>
                            <option value="behavioral">{t('behavioralInterview')}</option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('topic')}</label>
                        <Select 
                            value={filterTopic} 
                            onChange={(e) => setFilterTopic(e.target.value)}
                        >
                            <option value="all">{t('allTopics')}</option>
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
                </div>
            </Card>

            {/* History List */}
            <div className="space-y-4">
                {filteredHistory.length === 0 ? (
                    <Card className="bg-gray-800 p-6 text-center">
                        <p className="text-gray-300">{t('noHistory')}</p>
                    </Card>
                ) : (
                    filteredHistory.map((interview, index) => (
                        <Card key={interview.sessionId || index} className="bg-gray-800 p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getInterviewTypeIcon(interview.interviewType)}
                                        <span className="text-sm text-gray-400">
                                            {getInterviewTypeName(interview.interviewType)}
                                        </span>
                                        <span className={`text-sm ${getDifficultyColor(interview.difficulty)}`}>
                                            {interview.difficulty}
                                        </span>
                                        {interview.topic && (
                                            <span className="text-sm text-blue-400">
                                                {interview.topic}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-lg font-semibold mb-2">
                                        {interview.questionData?.title || t('unknownQuestion')}
                                    </h3>
                                    
                                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                        {interview.questionData?.description || t('noDescription')}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(interview.startTime)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {formatDuration(interview.timeSpent || 0)}
                                        </div>
                                        {interview.finalReport?.overallScore && (
                                            <div className={`flex items-center gap-1 ${getScoreColor(interview.finalReport.overallScore)}`}>
                                                <TrendingUp className="w-4 h-4" />
                                                {interview.finalReport.overallScore}/100
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => window.open(`/interview-detail/${interview.sessionId}`, '_blank')}
                                    >
                                        {t('viewDetails')}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => window.print()}
                                    >
                                        {t('printReport')}
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Quick Feedback Preview */}
                            {interview.finalReport?.strengths && (
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-green-400 mb-2">{t('strengths')}</h4>
                                            <ul className="space-y-1">
                                                {interview.finalReport.strengths.slice(0, 2).map((strength, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                        {strength}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-yellow-400 mb-2">{t('improvementSuggestions')}</h4>
                                            <ul className="space-y-1">
                                                {interview.finalReport.areasForImprovement?.slice(0, 2).map((area, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                                                        <Lightbulb className="w-3 h-3 text-yellow-500" />
                                                        {area}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserHistory; 