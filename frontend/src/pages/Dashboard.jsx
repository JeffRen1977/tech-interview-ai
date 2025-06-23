import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Code } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';

const TECH_STACKS = [
  'React', 'Node.js', 'Python', 'Java', 'C++', 'Go', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Kubernetes'
];
const LANGUAGES = ['English', 'Chinese', 'Spanish', 'French', 'German', 'Other'];

const USER_ID = 'demo-user'; // Replace with real userId from auth

const Dashboard = () => {
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

  useEffect(() => {
    setLoading(true);
    fetch(`/api/coach-agent/profile?userId=${USER_ID}`)
      .then(res => res.json())
      .then(data => {
        if (data.profile) setProfile({ ...profile, ...data.profile });
      })
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
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
      </div>
    </div>
  );
};

export default Dashboard;