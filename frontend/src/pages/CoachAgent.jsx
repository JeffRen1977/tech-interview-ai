import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';

const TECH_STACKS = [
  'React', 'Node.js', 'Python', 'Java', 'C++', 'Go', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Kubernetes'
];
const LANGUAGES = ['English', 'Chinese', 'Spanish', 'French', 'German', 'Other'];
const USER_ID = 'demo-user'; // Replace with real userId from auth

const CoachAgent = () => {
  const { language } = useLanguage();
  const t = (key) => getText(key, language);
  
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({
    targetCompanies: '',
    techStacks: [],
    language: '',
    availableTime: '',
    preferences: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [dailyPlan, setDailyPlan] = useState([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState('');

  // Goal-Oriented Conversation state
  const [goal, setGoal] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [messages, setMessages] = useState([]); // {role: 'user'|'ai', content: string}
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setProfile(prev => {
        const arr = prev.techStacks.includes(value)
          ? prev.techStacks.filter(t => t !== value)
          : [...prev.techStacks, value];
        return { ...prev, techStacks: arr };
      });
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/coach-agent/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, userId: USER_ID })
    });
    const data = await res.json();
    if (data.success) setMessage(t('profileSaved'));
    else setMessage(t('failedToSave'));
    setSaving(false);
  };

  const fetchDailyPlan = async () => {
    setPlanLoading(true);
    setPlanError('');
    try {
      const res = await fetch(`/api/coach-agent/daily-plan?userId=${USER_ID}`);
      const data = await res.json();
      if (data.success) setDailyPlan(data.plan);
      else setPlanError('Failed to load daily plan.');
    } catch (e) {
      setPlanError('Failed to load daily plan.');
    } finally {
      setPlanLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/coach-agent/profile?userId=${USER_ID}`)
      .then(res => res.json())
      .then(data => {
        if (data.profile) setProfile({ ...profile, ...data.profile });
      })
      .finally(() => setLoading(false));
    fetchDailyPlan();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, tab]);

  const TABS = [
    { key: 'profile', label: t('personalizedConfiguration') },
    { key: 'plan', label: t('dailyPlan') },
    { key: 'goal-chat', label: t('goalOrientedConversation') }
  ];

  // Goal-Oriented Conversation handlers
  const handleSetGoal = (e) => {
    e.preventDefault();
    if (goalInput.trim()) {
      setGoal(goalInput.trim());
      const goalMessage = language === 'zh' 
        ? `你的目标已设定为："${goalInput.trim()}"。请随时提问或请求建议！`
        : `Your goal has been set to: "${goalInput.trim()}". Feel free to ask questions or request advice!`;
      setMessages([{ role: 'ai', content: goalMessage }]);
      setGoalInput('');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const newMessage = { role: 'user', content: chatInput.trim() };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/coach-agent/goal-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, messages: updatedMessages, newMessage: chatInput.trim() })
      });
      const data = await res.json();
      if (data && data.reply) {
        setMessages(msgs => [...msgs, { role: 'ai', content: data.reply }]);
      } else {
        const errorMessage = language === 'zh' 
          ? 'AI 没有返回有效回复，请稍后再试。'
          : 'AI did not return a valid response, please try again later.';
        setMessages(msgs => [...msgs, { role: 'ai', content: errorMessage }]);
      }
    } catch (err) {
      const errorMessage = language === 'zh' 
        ? '请求失败，请检查网络或稍后再试。'
        : 'Request failed, please check your network or try again later.';
      setMessages(msgs => [...msgs, { role: 'ai', content: errorMessage }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold mb-4 text-center">{t('coachAgentTitle')}</h1>
        <div className="flex space-x-4 mb-6 justify-center">
          {TABS.map(tabItem => (
            <button
              key={tabItem.key}
              className={`px-4 py-2 rounded-t font-semibold focus:outline-none transition-colors duration-150 ${tab === tabItem.key ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setTab(tabItem.key)}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
        {tab === 'profile' && (
          <Card className="bg-gray-800 p-6">
            <h2 className="text-2xl font-bold mb-4">{t('personalizedConfiguration')}</h2>
            {loading ? <div>{t('loading')}</div> : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold">{t('targetCompanies')}</label>
                  <Input
                    name="targetCompanies"
                    value={profile.targetCompanies}
                    onChange={handleChange}
                    placeholder={t('targetCompaniesPlaceholder')}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">{t('technologyStacks')}</label>
                  <div className="flex flex-wrap gap-3">
                    {TECH_STACKS.map(stack => (
                      <label key={stack} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          name="techStacks"
                          value={stack}
                          checked={profile.techStacks.includes(stack)}
                          onChange={handleChange}
                          className="accent-blue-500"
                        />
                        {stack}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">{t('languagePreference')}</label>
                  <Select
                    name="language"
                    value={profile.language}
                    onChange={handleChange}
                    className="w-full"
                  >
                    <option value="">{t('selectLanguage')}</option>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">{t('availableTime')}</label>
                  <Input
                    name="availableTime"
                    type="number"
                    min="0"
                    max="24"
                    value={profile.availableTime}
                    onChange={handleChange}
                    placeholder={t('availableTimePlaceholder')}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">{t('otherPreferences')}</label>
                  <Textarea
                    name="preferences"
                    value={profile.preferences}
                    onChange={handleChange}
                    placeholder={t('otherPreferencesPlaceholder')}
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                  {saving ? t('saving') : t('saveProfile')}
                </Button>
                {message && <div className="mt-2 text-green-400">{message}</div>}
              </form>
            )}
          </Card>
        )}
        {tab === 'plan' && (
          <Card className="bg-gray-800 p-6">
            <h2 className="text-2xl font-bold mb-4">{t('todaysAIPlan')}</h2>
            {planLoading ? (
              <div>{t('loadingDailyPlan')}</div>
            ) : planError ? (
              <div className="text-red-500">{planError}</div>
            ) : dailyPlan.length === 0 ? (
              <div className="text-gray-400">{t('noPlanGenerated')}</div>
            ) : (
              <ul className="space-y-4">
                {dailyPlan.map((task, i) => (
                  <li key={i} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm px-2 py-1 rounded bg-blue-700 text-white uppercase">{task.type}</span>
                      <span className="font-semibold text-lg">{task.title}</span>
                      <span className="ml-auto text-xs text-gray-400">{task.estimatedTime} min</span>
                    </div>
                    <div className="text-gray-200 text-sm whitespace-pre-line">{task.description}</div>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="mt-6 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
              onClick={fetchDailyPlan}
              disabled={planLoading}
            >
              {planLoading ? t('regenerating') : t('regeneratePlan')}
            </button>
          </Card>
        )}
        {tab === 'goal-chat' && (
          <Card className="bg-gray-800 p-6 flex flex-col h-[600px]">
            <h2 className="text-2xl font-bold mb-4">{t('goalOrientedConversation')}</h2>
            {!goal ? (
              <form onSubmit={handleSetGoal} className="mb-6 flex gap-2">
                <Input
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  placeholder={t('goalInputPlaceholder')}
                  className="flex-1"
                />
                <Button type="submit" className="bg-blue-600">{t('setGoal')}</Button>
              </form>
            ) : (
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-1">{t('currentGoal')}</div>
                <div className="font-semibold text-blue-300 mb-2">{goal}</div>
                <Button size="sm" variant="outline" onClick={() => { setGoal(''); setMessages([]); }}>{t('resetGoal')}</Button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto bg-gray-900 rounded p-4 mb-4 border border-gray-700">
              {messages.length === 0 && <div className="text-gray-500 text-center">{t('pleaseSetGoal')}</div>}
              {messages.map((msg, idx) => (
                <div key={idx} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-lg text-sm whitespace-pre-line ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto">
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={goal ? t('inputQuestion') : t('pleaseSetGoalFirst')}
                disabled={!goal || chatLoading}
                className="flex-1"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { handleSendMessage(e); e.preventDefault(); } }}
              />
              <Button type="submit" className="bg-blue-600" disabled={!goal || chatLoading || !chatInput.trim()}>
                {chatLoading ? t('sending') : t('send')}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CoachAgent; 