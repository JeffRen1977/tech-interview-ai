import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';
import { 
  Code, 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock, 
  Star,
  ArrowRight,
  Play,
  BookOpen,
  Award,
  Activity,
  BarChart3,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon
} from 'lucide-react';

export default function Dashboard() {
  const { language } = useLanguage();
  const t = (key) => getText(key, language);
  
  // 模拟数据状态
  const [stats, setStats] = useState({
    totalPracticeSessions: 156,
    averageScore: 78,
    completedInterviews: 23,
    practiceStreak: 7,
    weeklyProgress: 15,
    todayGoal: 3
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'coding',
      title: 'Two Sum',
      difficulty: 'easy',
      score: 85,
      date: '2024-01-15',
      time: '14:30'
    },
    {
      id: 2,
      type: 'interview',
      title: 'System Design Interview',
      difficulty: 'medium',
      score: 72,
      date: '2024-01-14',
      time: '10:15'
    },
    {
      id: 3,
      type: 'behavioral',
      title: 'Leadership Questions',
      difficulty: 'medium',
      score: 88,
      date: '2024-01-13',
      time: '16:45'
    }
  ]);

  const [recommendations, setRecommendations] = useState([
    {
      id: 1,
      type: 'coding',
      title: 'LRU Cache',
      difficulty: 'medium',
      estimatedTime: 25,
      category: 'dataStructures',
      reason: 'basedOnYourProgress'
    },
    {
      id: 2,
      type: 'systemDesign',
      title: 'Design Twitter',
      difficulty: 'hard',
      estimatedTime: 45,
      category: 'systemDesign',
      reason: 'weakArea'
    },
    {
      id: 3,
      type: 'behavioral',
      title: 'Conflict Resolution',
      difficulty: 'medium',
      estimatedTime: 20,
      category: 'behavioral',
      reason: 'improvement'
    }
  ]);

  const [topCategories, setTopCategories] = useState([
    { name: 'algorithms', score: 85, status: 'excellent' },
    { name: 'dataStructures', score: 78, status: 'good' },
    { name: 'systemDesign', score: 65, status: 'fair' },
    { name: 'behavioral', score: 82, status: 'good' }
  ]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'coding': return <Code className="w-4 h-4" />;
      case 'interview': return <Users className="w-4 h-4" />;
      case 'behavioral': return <FileText className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'coding': return <Code className="w-5 h-5" />;
      case 'systemDesign': return <BarChart3 className="w-5 h-5" />;
      case 'behavioral': return <Users className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 欢迎标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('dashboardTitle')}</h1>
            <p className="text-gray-400">{t('welcomeMessage')}</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}</span>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('totalPracticeSessions')}</p>
                <p className="text-2xl font-bold">{stats.totalPracticeSessions}</p>
              </div>
              <Code className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="bg-gray-800 p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('averageScore')}</p>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="bg-gray-800 p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('completedInterviews')}</p>
                <p className="text-2xl font-bold">{stats.completedInterviews}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="bg-gray-800 p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('practiceStreak')}</p>
                <p className="text-2xl font-bold">{stats.practiceStreak} {t('days')}</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 快速操作 */}
          <Card className="bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('quickActions')}</h2>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = '/coding-practice'}
              >
                <Code className="w-4 h-4 mr-2" />
                {t('startCodingPractice')}
              </Button>
              <Button 
                className="w-full justify-start bg-purple-600 hover:bg-purple-700"
                onClick={() => window.location.href = '/mock-interview'}
              >
                <Users className="w-4 h-4 mr-2" />
                {t('startMockInterview')}
              </Button>
              <Button 
                className="w-full justify-start bg-green-600 hover:bg-green-700"
                onClick={() => window.location.href = '/resume-optimizer'}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t('optimizeResume')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/user-history'}
              >
                <Activity className="w-4 h-4 mr-2" />
                {t('viewHistory')}
              </Button>
            </div>
          </Card>

          {/* 最近活动 */}
          <Card className="bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('recentActivity')}</h2>
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                {t('viewAllActivity')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span className={getDifficultyColor(activity.difficulty)}>
                            {t(activity.difficulty)}
                          </span>
                          <span>•</span>
                          <span>{formatDate(activity.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-400">{activity.score}%</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('noRecentActivity')}</p>
                </div>
              )}
            </div>
          </Card>

          {/* 今日目标 */}
          <Card className="bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('todayGoal')}</h2>
              <Target className="w-5 h-5 text-orange-500" />
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {stats.todayGoal}/5
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.todayGoal / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{t('codingPractice')}</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>{t('mockInterview')}</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>{t('resumeOptimizer')}</span>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 个性化推荐 */}
          <Card className="bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('personalizedRecommendations')}</h2>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-gray-400 text-sm mb-4">{t('basedOnYourProgress')}</p>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-400">
                      {getRecommendationIcon(rec.type)}
                    </div>
                    <div>
                      <p className="font-medium">{rec.title}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span className={getDifficultyColor(rec.difficulty)}>
                          {t(rec.difficulty)}
                        </span>
                        <span>•</span>
                        <span>{rec.estimatedTime} {t('minutes')}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Play className="w-4 h-4 mr-1" />
                    {t('startNow')}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* 最强类别 */}
          <Card className="bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('topCategories')}</h2>
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-3">
              {topCategories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{t(category.name)}</p>
                      <p className={`text-sm ${getStatusColor(category.status)}`}>
                        {t(category.status)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{category.score}%</p>
                    <div className="w-16 bg-gray-600 rounded-full h-1 mt-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${category.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 本周进度 */}
        <Card className="bg-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('weeklyProgress')}</h2>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const progress = Math.floor(Math.random() * 100);
              return (
                <div key={day} className="text-center">
                  <p className="text-xs text-gray-400 mb-2">{day}</p>
                  <div className="w-full bg-gray-700 rounded-full h-16 flex items-end">
                    <div 
                      className="w-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ height: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1">{progress}%</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}