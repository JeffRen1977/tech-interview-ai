import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';

const fetchWrongQuestions = async () => {
  const res = await fetch('http://localhost:3000/api/wrong-questions');
  const data = await res.json();
  return data.questions || [];
};

const fetchAIFeedback = async (id) => {
  const res = await fetch(`http://localhost:3000/api/wrong-questions/${id}/ai-feedback`, { method: 'POST' });
  const data = await res.json();
  return data;
};

function AbilityMap() {
  const { language } = useLanguage();
  const t = (key) => getText(key, language);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/wrong-questions/ability-map')
      .then(res => setData(res.data))
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
      const res = await fetch('/api/wrong-questions/learn-feedback/video-feedback', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
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
  const [loading, setLoading] = useState(true);
  const [aiFeedback, setAIFeedback] = useState({});
  const [loadingAI, setLoadingAI] = useState({});

  useEffect(() => {
    fetchWrongQuestions().then(qs => {
      setQuestions(qs);
      setLoading(false);
    });
  }, []);

  const handleAIFeedback = async (id) => {
    setLoadingAI(prev => ({ ...prev, [id]: true }));
    const feedback = await fetchAIFeedback(id);
    setAIFeedback(prev => ({ ...prev, [id]: feedback }));
    setLoadingAI(prev => ({ ...prev, [id]: false }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">{t('learnAndFeedback')}</h1>
        <div className="flex space-x-4 mb-8 justify-center">
          {TABS.map(ti => (
            <button
              key={ti.key}
              className={`px-4 py-2 rounded-t font-semibold focus:outline-none transition-colors duration-150 ${tab === ti.key ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' : 'bg-gray-700 text-gray-300'}`}
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
            ) : (
              <div className="space-y-6">
                {questions.length === 0 && <div className="text-center text-gray-400">{t('noWrongQuestions')}</div>}
                {questions.map(q => (
                  <Card key={q.id} className="bg-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg">{q.question}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><span className="font-semibold text-yellow-300">{t('yourAnswer')}:</span> {q.userAnswer}</div>
                      <div><span className="font-semibold text-green-400">{t('correctAnswer')}:</span> {q.correctAnswer}</div>
                      <div className="text-sm text-gray-400">{t('type')}: {q.type} | {t('knowledgePoint')}: {q.knowledgePoint}</div>
                      <Button 
                        className="mt-2 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleAIFeedback(q.id)}
                        disabled={loadingAI[q.id]}
                      >
                        {loadingAI[q.id] ? t('gettingAIFeedback') : t('getAIExplanationRedoPlan')}
                      </Button>
                      {aiFeedback[q.id] && (
                        <div className="mt-4 p-4 bg-gray-900 rounded-lg space-y-3">
                          <div>
                            <h4 className="font-semibold text-blue-400 mb-1">{t('aiExplanation')}</h4>
                            <p className="text-gray-200 whitespace-pre-wrap">{aiFeedback[q.id].explanation}</p>
                          </div>
                          {aiFeedback[q.id].redoPlan && aiFeedback[q.id].redoPlan.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-green-400 mb-1">{t('redoPlan')}</h4>
                              <ul className="list-decimal list-inside space-y-1 text-gray-200">
                                {aiFeedback[q.id].redoPlan.map((step, idx) => (
                                  <li key={idx}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
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