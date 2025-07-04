import React from 'react';
import { LayoutDashboard, Code, Mic, FileText, Building, History, UserCog, BrainCircuit, Shield, Clock, LogOut, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';

const Sidebar = ({ activeView, setAppView, onLogout, user, isAdmin }) => {
  const { language } = useLanguage();
  const t = (key) => getText(key, language);

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard />, label: t('dashboard') },
    { id: 'coding-practice', icon: <Code />, label: t('interviewLearning') },
    { id: 'mock-interview', icon: <Mic />, label: t('mockInterview') },
    { id: 'user-history', icon: <Clock />, label: t('userHistory') },
    { id: 'resume-optimizer', icon: <FileText />, label: t('resumeOptimizer') },
    { id: 'learn-feedback', icon: <History />, label: t('learnFeedback') },
    { id: 'coach-agent', icon: <UserCog />, label: t('coachAgent') },
  ];

  // 只有管理员才能看到Admin菜单
  if (isAdmin) {
    navItems.push({ id: 'admin', icon: <Shield />, label: t('admin') });
  }

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
      
      {/* 用户信息区域 */}
      <div className="p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-white">{user?.name || t('userName')}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
            {isAdmin && (
              <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded mt-1">
                {t('admin')}
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={onLogout} 
          className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          {t('logout')}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;