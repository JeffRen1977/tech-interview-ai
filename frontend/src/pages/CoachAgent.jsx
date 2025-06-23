import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';

const TECH_STACKS = [
  'React', 'Node.js', 'Python', 'Java', 'C++', 'Go', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Kubernetes'
];
const LANGUAGES = ['English', 'Chinese', 'Spanish', 'French', 'German', 'Other'];
const USER_ID = 'demo-user'; // Replace with real userId from auth

const CoachAgent = () => {
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
    if (data.success) setMessage('Profile saved!');
    else setMessage('Failed to save profile.');
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

  const TABS = [
    { key: 'profile', label: 'Personalized Configuration' },
    { key: 'plan', label: "Today's Daily Plan" }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold mb-4 text-center">AI 个性化教练</h1>
        <div className="flex space-x-4 mb-6 justify-center">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`px-4 py-2 rounded-t font-semibold focus:outline-none transition-colors duration-150 ${tab === t.key ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'profile' && (
          <Card className="bg-gray-800 p-6">
            <h2 className="text-2xl font-bold mb-4">Personalized Coach-Agent Configuration</h2>
            {loading ? <div>Loading...</div> : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold">Target Companies</label>
                  <Input
                    name="targetCompanies"
                    value={profile.targetCompanies}
                    onChange={handleChange}
                    placeholder="e.g. Google, Meta, ByteDance"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Technology Stacks</label>
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
                  <label className="block mb-1 font-semibold">Language Preference</label>
                  <Select
                    name="language"
                    value={profile.language}
                    onChange={handleChange}
                    className="w-full"
                  >
                    <option value="">Select language</option>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Available Time (per day, hours)</label>
                  <Input
                    name="availableTime"
                    type="number"
                    min="0"
                    max="24"
                    value={profile.availableTime}
                    onChange={handleChange}
                    placeholder="e.g. 2"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Other Preferences</label>
                  <Textarea
                    name="preferences"
                    value={profile.preferences}
                    onChange={handleChange}
                    placeholder="e.g. Prefer remote, want more system design practice, etc."
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
                {message && <div className="mt-2 text-green-400">{message}</div>}
              </form>
            )}
          </Card>
        )}
        {tab === 'plan' && (
          <Card className="bg-gray-800 p-6">
            <h2 className="text-2xl font-bold mb-4">Today's AI Daily Plan</h2>
            {planLoading ? (
              <div>Loading daily plan...</div>
            ) : planError ? (
              <div className="text-red-500">{planError}</div>
            ) : dailyPlan.length === 0 ? (
              <div className="text-gray-400">No plan generated for today.</div>
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
              {planLoading ? 'Regenerating...' : 'Regenerate Plan'}
            </button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CoachAgent; 