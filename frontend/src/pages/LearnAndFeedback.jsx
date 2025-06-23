import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

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

const LearnAndFeedback = () => {
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
        <h1 className="text-4xl font-bold mb-8 text-center">Learn & Feedback</h1>
        <h2 className="text-2xl font-semibold mb-6">Wrong Question Book / Review Assistant</h2>
        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-6">
            {questions.length === 0 && <div className="text-center text-gray-400">No wrong questions found!</div>}
            {questions.map(q => (
              <Card key={q.id} className="bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">{q.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><span className="font-semibold text-yellow-300">Your Answer:</span> {q.userAnswer}</div>
                  <div><span className="font-semibold text-green-400">Correct Answer:</span> {q.correctAnswer}</div>
                  <div className="text-sm text-gray-400">Type: {q.type} | Knowledge Point: {q.knowledgePoint}</div>
                  <Button 
                    className="mt-2 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleAIFeedback(q.id)}
                    disabled={loadingAI[q.id]}
                  >
                    {loadingAI[q.id] ? 'Getting AI Feedback...' : 'Get AI Explanation & Redo Plan'}
                  </Button>
                  {aiFeedback[q.id] && (
                    <div className="mt-4 p-4 bg-gray-900 rounded-lg space-y-3">
                      <div>
                        <h4 className="font-semibold text-blue-400 mb-1">AI Explanation</h4>
                        <p className="text-gray-200 whitespace-pre-wrap">{aiFeedback[q.id].explanation}</p>
                      </div>
                      {aiFeedback[q.id].redoPlan && aiFeedback[q.id].redoPlan.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-green-400 mb-1">Redo Plan</h4>
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
      </div>
    </div>
  );
};

export default LearnAndFeedback; 