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
import LearnAndFeedback from './pages/LearnAndFeedback';
import CoachAgent from './pages/CoachAgent';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { getText } from './utils/translations';

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const { language } = useLanguage();
  const t = (key) => getText(key, language);

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
        {activeView === 'coach-agent' && <CoachAgent />}
        {activeView === 'behavioral-practice' && <Placeholder title={t('behavioralPractice')} />}
        {activeView === 'learn-feedback' && <LearnAndFeedback />}
      </MainContent>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

