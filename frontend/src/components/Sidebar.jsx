import React from 'react';
import { LayoutDashboard, Code, Mic, FileText, Building, History, UserCog, BrainCircuit, Shield, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';

const Sidebar = ({ activeView, setAppView, onLogout }) => {
  const { language } = useLanguage();
  const t = (key) => getText(key, language);

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard />, label: t('dashboard') },
    { id: 'coding-practice', icon: <Code />, label: t('codingPractice') },
    { id: 'mock-interview', icon: <Mic />, label: t('mockInterview') },
    { id: 'user-history', icon: <Clock />, label: t('userHistory') },
    { id: 'resume-optimizer', icon: <FileText />, label: t('resumeOptimizer') },
    { id: 'company-prep', icon: <Building />, label: t('companyPrep') },
    { id: 'learn-feedback', icon: <History />, label: t('learnFeedback') },
    { id: 'coach-agent', icon: <UserCog />, label: t('coachAgent') },
    { id: 'admin', icon: <Shield />, label: t('admin') },
  ];

  return (
    <nav className="w-64 bg-gray-800 p-4 flex flex-col justify-between">
      <div>
        <div className="text-2xl font-bold mb-10 text-center text-white flex items-center justify-center">
          <BrainCircuit className="w-8 h-8 mr-2" /> {t('appTitle')}
        </div>
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.id}>
              <a href="#" 
                 onClick={(e) => { e.preventDefault(); setAppView(item.id); }}
                 className={`flex items-center p-3 rounded-lg hover:bg-indigo-700 transition-colors ${activeView === item.id ? 'bg-indigo-600' : ''}`}>
                <div className="w-6 mr-3">{item.icon}</div> {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 bg-gray-700 rounded-lg">
        <p className="font-semibold text-sm">{t('userName')}</p>
        <button onClick={onLogout} className="text-xs text-indigo-400 hover:underline">{t('logout')}</button>
      </div>
    </nav>
  );
};

export default Sidebar;