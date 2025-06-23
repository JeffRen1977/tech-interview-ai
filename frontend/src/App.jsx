import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import CodingPractice from './pages/CodingPractice';
import MockInterview from './pages/MockInterview';
import ResumeOptimizer from './pages/ResumeOptimizer';
import Admin from './pages/Admin';
import Placeholder from './components/Placeholder';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import UserHistory from './components/UserHistory';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const handleLogin = () => {
    setIsLoggedIn(true);
    // You might want to fetch user data here
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveView('dashboard'); // Reset to default view on logout
  };

  if (!isLoggedIn) {
    return <HomePage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      <Sidebar activeView={activeView} setAppView={setActiveView} onLogout={handleLogout} />
      <MainContent>
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'coding-practice' && <CodingPractice />}
        {activeView === 'mock-interview' && <MockInterview />}
        {activeView === 'resume-optimizer' && <ResumeOptimizer />}
        {activeView === 'admin' && <Admin />}
        {activeView === 'user-history' && <UserHistory />}
        {activeView === 'company-prep' && <Placeholder title="公司面试定制化准备" />}
        {activeView === 'feedback-center' && <Placeholder title="学习与反馈闭环" />}
        {activeView === 'coach-agent' && <Placeholder title="AI 个性化教练 (Agent)" />}
        {activeView === 'behavioral-practice' && <Placeholder title="行为面试训练" />}
      </MainContent>
    </div>
  );
}

