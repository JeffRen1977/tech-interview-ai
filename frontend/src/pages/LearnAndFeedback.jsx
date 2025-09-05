import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';
import { BookOpen, X, Clock, BarChart3, Lightbulb, Award } from 'lucide-react';
import { apiRequest, getWrongQuestions } from '../api.js';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';

const fetchWrongQuestions = async () => {
  try {
    const data = await getWrongQuestions();
    return data.wrongQuestions || [];
  } catch (error) {
    console.error('Error fetching wrong questions:', error);
    return [];
  }
};

function AbilityMap() {
  const { language } = useLanguage();
  const t = (key) => getText(key, language);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiRequest('/wrong-questions/ability-map', 'GET')
      .then(res => setData(res))
      .catch(e => setError(t('loadAbilityMapFailed')))
      .finally(() => setLoading(false));
  }, [language]);

  if (loading) return <div>{t('loading')}</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data || !Array.isArray(data.abilities) || !Array.isArray(data.recommendations)) {
    return <div className="text-red-500">{t('abilityMapDataUnavailable')}</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{t('yourAbilityMap')}</h3>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="border px-2 py-1">{t('type')}</th>
            <th className="border px-2 py-1">{t('knowledgePoint')}</th>
            <th className="border px-2 py-1">{t('correct')}</th>
            <th className="border px-2 py-1">{t('wrong')}</th>
          </tr>
        </thead>
        <tbody>
          {data.abilities.map((a, i) => (
            <tr key={i} className={a.wrong > a.correct ? 'bg-red-900 text-white' : 'bg-green-900 text-white'}>
              <td className="border px-2 py-1">{a.type}</td>
              <td className="border px-2 py-1">{a.knowledgePoint}</td>
              <td className="border px-2 py-1">{a.correct}</td>
              <td className="border px-2 py-1">{a.wrong}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h4 className="font-semibold mt-4">{t('recommendedExercises')}</h4>
        {data.recommendations.length === 0 ? (
          <div className="text-gray-400">{t('noRecommendations')}</div>
        ) : (
          <ul className="list-disc pl-5">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="mb-1">
                <span className="font-medium">{rec.knowledgePoint}</span> ({rec.type}): {typeof rec.title === 'object' ? rec.title[language] : rec?.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function VideoInterviewFeedback() {
  const { language } = useLanguage();
  const t = (key) => getText(key, language);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setVideo(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video) return;
    setLoading(true);
    setResult(null);
    setError(null);
    const formData = new FormData();
    formData.append('video', video);
    try {
      const data = await apiRequest('/wrong-questions/learn-feedback/video-feedback', 'POST', formData);
      if (data.success) setResult(data);
      else setError(t('analyzeVideoFailed'));
    } catch (err) {
      setError(t('analyzeVideoFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-2">{t('videoInterviewFeedback')}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="file" accept="video/*" onChange={handleFileChange} className="block text-white" />
        <button type="submit" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white" disabled={loading || !video}>
          {loading ? t('analyzing') : t('analyzeVideo')}
        </button>
      </form>
      {error && <div className="text-red-500">{error}</div>}
      {result && (
        <div className="bg-gray-800 p-4 rounded-lg space-y-4 mt-4">
          <div>
            <h4 className="font-semibold text-blue-400 mb-1">{t('languageExpression')}</h4>
            <p className="text-gray-200 whitespace-pre-wrap">{result.languageFeedback}</p>
          </div>
          <div>
            <h4 className="font-semibold text-green-400 mb-1">{t('bodyLanguage')}</h4>
            <p className="text-gray-200 whitespace-pre-wrap">{result.bodyLanguageFeedback}</p>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-300 mb-1">{t('logicalStructure')}</h4>
            <p className="text-gray-200 whitespace-pre-wrap">{result.logicFeedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { key: 'wrong', label: 'wrongTab' },
  { key: 'ability', label: 'abilityTab' },
  { key: 'video', label: 'videoTab' }
];

const LearnAndFeedback = () => {
  const { language } = useLanguage();
  const t = (key) => getText(key, language);
  const [tab, setTab] = useState('wrong');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadWrongQuestions();
  }, []);

  const loadWrongQuestions = async () => {
    setLoading(true);
    try {
      const data = await fetchWrongQuestions();
      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        setQuestions([]);
        setError(t('noWrongQuestions'));
      }
    } catch (err) {
      console.error("Error loading wrong questions:", err);
      setError(t('cannotLoadQuestions'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
  };

  const getInterviewTypeLabel = (type) => {
    switch (type) {
      case 'coding': return t('coding');
      case 'system-design': return t('systemDesign');
      case 'behavioral': return t('behavioral');
      case 'mock': return t('mockInterview');
      default: return type;
    }
  };

  const getSourceLabel = (type) => {
    switch (type) {
      case 'learning': return t('learningHistory');
      case 'interview': return t('interviewHistory');
      default: return type;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredQuestions = questions.filter(question => {
    if (filterType === 'all') return true;
    return question.interviewType === filterType;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">{t('learnAndFeedback')}</h1>
        <div className="flex flex-wrap gap-2 lg:gap-4 mb-6 lg:mb-8 justify-center">
          {TABS.map(ti => (
            <button
              key={ti.key}
              className={`px-3 lg:px-4 py-2 rounded-t font-semibold focus:outline-none transition-colors duration-150 text-sm lg:text-base ${tab === ti.key ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setTab(ti.key)}
            >
              {t(ti.label)}
            </button>
          ))}
        </div>
        {tab === 'wrong' && (
          <>
            <h2 className="text-2xl font-semibold mb-6">{t('wrongTab')}</h2>
            {loading ? (
              <div className="text-center text-gray-400">{t('loading')}</div>
            ) : error ? (
              <div className="text-red-400 text-center p-4">{error}</div>
            ) : (
              <div className="space-y-4 lg:space-y-6">
                {/* 移动端：问题列表 */}
                <div className="lg:hidden">
                  <div className="bg-gray-800 p-3 lg:p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{t('wrongQuestions')}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadWrongQuestions}
                        className="text-gray-400 hover:text-white"
                      >
                        <BookOpen size={16} />
                      </Button>
                    </div>

                    {/* 筛选器 */}
                    <div className="mb-3">
                      <Select
                        value={filterType}
                        onValueChange={setFilterType}
                        className="w-full"
                      >
                        <option value="all">{t('allTypes')}</option>
                        <option value="coding">{t('coding')}</option>
                        <option value="system-design">{t('systemDesign')}</option>
                        <option value="behavioral">{t('behavioral')}</option>
                        <option value="mock">{t('mockInterview')}</option>
                      </Select>
                    </div>

                    {filteredQuestions.length === 0 ? (
                      <div className="text-gray-400 text-center p-4">{t('noWrongQuestions')}</div>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto mobile-wrong-questions">
                        {filteredQuestions.map((question) => (
                          <div
                            key={question.id}
                            onClick={() => handleSelectQuestion(question)}
                            className={`p-2 lg:p-3 rounded-lg cursor-pointer transition-colors mobile-wrong-question-item ${
                              selectedQuestion?.id === question.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-xs lg:text-sm line-clamp-1">
                                {typeof question.questionData?.title === 'object'
                                  ? question.questionData.title[language]
                                  : question.questionData?.title || t('unknownQuestion')}
                              </span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-600 flex-shrink-0 ml-2">
                                {getInterviewTypeLabel(question.interviewType)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-300">
                              <span className="truncate">{getSourceLabel(question.type)}</span>
                              <span className="text-xs flex-shrink-0 ml-2">{formatDate(question.completedAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 桌面端：左右分栏布局 */}
                <div className="hidden lg:block">
                  <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border border-gray-700">
                    {/* 左侧题目列表 */}
                    <ResizablePanel defaultSize={40} minSize={30}>
                  <div className="h-full bg-gray-800 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">{t('wrongQuestions')}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadWrongQuestions}
                        className="text-gray-400 hover:text-white"
                      >
                        <BookOpen size={16} />
                      </Button>
                    </div>

                    {/* 筛选器 */}
                    <div className="mb-4">
                      <Select
                        value={filterType}
                        onValueChange={setFilterType}
                        className="w-full"
                      >
                        <option value="all">{t('allTypes')}</option>
                        <option value="coding">{t('coding')}</option>
                        <option value="system-design">{t('systemDesign')}</option>
                        <option value="behavioral">{t('behavioral')}</option>
                        <option value="mock">{t('mockInterview')}</option>
                      </Select>
                    </div>

                    {filteredQuestions.length === 0 ? (
                      <div className="text-gray-400 text-center p-4">{t('noWrongQuestions')}</div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredQuestions.map((question) => (
                          <div
                            key={question.id}
                            onClick={() => handleSelectQuestion(question)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedQuestion?.id === question.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">
                                {typeof question.questionData?.title === 'object'
                                  ? question.questionData.title[language]
                                  : question.questionData?.title || t('unknownQuestion')}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-gray-600">
                                {getInterviewTypeLabel(question.interviewType)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-300">
                              <span>{getSourceLabel(question.type)}</span>
                              <span>{formatDate(question.completedAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* 右侧详情显示 */}
                <ResizablePanel defaultSize={60}>
                  <div className="h-full bg-gray-800 p-4 overflow-y-auto">
                    {selectedQuestion ? (
                      <div className="min-h-full">
                        <div className="mb-4">
                          <Button
                            onClick={() => setSelectedQuestion(null)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white mb-4"
                          >
                            <X size={16} className="mr-2" />
                            {t('backToList')}
                          </Button>
                          
                          <h3 className="text-xl font-semibold mb-2">
                            {typeof selectedQuestion.questionData?.title === 'object'
                              ? selectedQuestion.questionData.title[language]
                              : selectedQuestion.questionData?.title || t('unknownQuestion')}
                          </h3>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                            <span>{getInterviewTypeLabel(selectedQuestion.interviewType)}</span>
                            <span>{getSourceLabel(selectedQuestion.type)}</span>
                            <span>{formatDate(selectedQuestion.completedAt)}</span>
                          </div>

                          {selectedQuestion.questionData?.description && (
                            <div className="mb-4">
                              <h4 className="text-lg font-medium mb-2">{t('question')}</h4>
                              <div className="bg-gray-900 p-4 rounded-lg">
                                <p className="text-gray-300">
                                  {typeof selectedQuestion.questionData?.description === 'object'
                                    ? selectedQuestion.questionData.description[language]
                                    : selectedQuestion.questionData?.description}
                                </p>
                              </div>
                            </div>
                          )}

                          {selectedQuestion.questionData?.prompt && (
                            <div className="mb-4">
                              <h4 className="text-lg font-medium mb-2">{t('question')}</h4>
                              <div className="bg-gray-900 p-4 rounded-lg">
                                <p className="text-gray-300">
                                  {typeof selectedQuestion.questionData?.prompt === 'object'
                                    ? selectedQuestion.questionData.prompt[language]
                                    : selectedQuestion.questionData?.prompt}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="mb-4">
                            <h4 className="text-lg font-medium mb-2">{t('yourAnswer')}</h4>
                            <div className="bg-gray-900 p-4 rounded-lg">
                              {selectedQuestion.interviewType === 'coding' ? (
                                <pre className="text-gray-300 text-sm overflow-x-auto">
                                  <code>{selectedQuestion.userAnswer}</code>
                                </pre>
                              ) : (
                                <p className="text-gray-300 whitespace-pre-wrap">{selectedQuestion.userAnswer}</p>
                              )}
                            </div>
                          </div>

                          {selectedQuestion.feedback && (
                            <div className="mb-4">
                              <h4 className="text-lg font-medium mb-2">{t('aiFeedback')}</h4>
                              <div className="bg-gray-900 p-4 rounded-lg">
                                {selectedQuestion.feedback.aiAnalysis ? (
                                  <div className="text-gray-300 whitespace-pre-wrap">
                                    {selectedQuestion.feedback.aiAnalysis}
                                  </div>
                                ) : selectedQuestion.feedback.message ? (
                                  <div className="text-gray-300 whitespace-pre-wrap">
                                    {selectedQuestion.feedback.message}
                                  </div>
                                ) : (
                                  <div className="text-gray-500">{t('noFeedbackAvailable')}</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        {t('selectQuestionToView')}
                      </div>
                    )}
                  </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>

                {/* 移动端：选中问题详情 */}
                {selectedQuestion && (
                  <div className="lg:hidden">
                    <div className="bg-gray-800 p-3 lg:p-4 rounded-lg mobile-wrong-question-detail">
                      <div className="mb-4">
                        <Button
                          onClick={() => setSelectedQuestion(null)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white mb-3"
                        >
                          <X size={16} className="mr-2" />
                          {t('backToList')}
                        </Button>
                        
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                          {typeof selectedQuestion.questionData?.title === 'object'
                            ? selectedQuestion.questionData.title[language]
                            : selectedQuestion.questionData?.title || t('unknownQuestion')}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-3">
                          <span className="px-2 py-1 bg-gray-700 rounded">{getInterviewTypeLabel(selectedQuestion.interviewType)}</span>
                          <span className="px-2 py-1 bg-gray-700 rounded">{getSourceLabel(selectedQuestion.type)}</span>
                          <span className="px-2 py-1 bg-gray-700 rounded">{formatDate(selectedQuestion.completedAt)}</span>
                        </div>

                        {selectedQuestion.questionData?.description && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-2">{t('question')}</h4>
                            <div className="bg-gray-900 p-3 rounded-lg">
                              <p className="text-gray-300 text-sm">
                                {typeof selectedQuestion.questionData?.description === 'object'
                                  ? selectedQuestion.questionData.description[language]
                                  : selectedQuestion.questionData?.description}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedQuestion.questionData?.prompt && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-2">{t('question')}</h4>
                            <div className="bg-gray-900 p-3 rounded-lg">
                              <p className="text-gray-300 text-sm">
                                {typeof selectedQuestion.questionData?.prompt === 'object'
                                  ? selectedQuestion.questionData.prompt[language]
                                  : selectedQuestion.questionData?.prompt}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-2">{t('yourAnswer')}</h4>
                          <div className="bg-gray-900 p-3 rounded-lg">
                            {selectedQuestion.interviewType === 'coding' ? (
                              <pre className="text-gray-300 text-xs overflow-x-auto">
                                <code>{selectedQuestion.userAnswer}</code>
                              </pre>
                            ) : (
                              <p className="text-gray-300 whitespace-pre-wrap text-sm">{selectedQuestion.userAnswer}</p>
                            )}
                          </div>
                        </div>

                        {selectedQuestion.feedback && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-2">{t('aiFeedback')}</h4>
                            <div className="bg-gray-900 p-3 rounded-lg">
                              {selectedQuestion.feedback.aiAnalysis ? (
                                <div className="text-gray-300 whitespace-pre-wrap text-sm">
                                  {selectedQuestion.feedback.aiAnalysis}
                                </div>
                              ) : selectedQuestion.feedback.message ? (
                                <div className="text-gray-300 whitespace-pre-wrap text-sm">
                                  {selectedQuestion.feedback.message}
                                </div>
                              ) : (
                                <div className="text-gray-500 text-sm">{t('noFeedbackAvailable')}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {tab === 'ability' && <AbilityMap />}
        {tab === 'video' && <VideoInterviewFeedback />}
      </div>
    </div>
  );
};

export default LearnAndFeedback; 