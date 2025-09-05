import React from 'react';
import { LayoutDashboard, Code, Mic, FileText, Building, History, UserCog, BrainCircuit, Shield, Clock, LogOut, User, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';

const Sidebar = ({ activeView, setAppView, onLogout, user, isAdmin }) => {
  const { language } = useLanguage();
  const t = (key) => getText(key, language);

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard />, label: t('dashboard') },
    { id: 'coding-practice', icon: <Code />, label: t('interviewLearning') },
    { id: 'mock-interview', icon: <Mic />, label: t('mockInterview') },
    { id: 'llm-interview', icon: <BookOpen />, label: t('llmInterview') },
    { id: 'resume-optimizer', icon: <FileText />, label: t('resumeOptimizer') },
    { id: 'learn-feedback', icon: <History />, label: t('learnFeedback') },
    { id: 'coach-agent', icon: <UserCog />, label: t('coachAgent') },
    { id: 'user-history', icon: <Clock />, label: t('userHistory') },
  ];

  // 只有管理员才能看到Admin菜单
  if (isAdmin) {
    navItems.push({ id: 'admin', icon: <Shield />, label: t('admin') });
  }

  return (
    <nav className="w-64 h-full bg-gray-800 p-4 flex flex-col justify-between">
      <div>
        <div className="text-xl lg:text-2xl font-bold mb-6 lg:mb-10 text-center text-white flex items-center justify-center">
          <BrainCircuit className="w-6 h-6 lg:w-8 lg:h-8 mr-2" /> 
          <span className="hidden sm:inline">{t('appTitle')}</span>
          <span className="sm:hidden">AI</span>
        </div>
        <ul className="space-y-1 lg:space-y-2">
          {navItems.map(item => (
            <li key={item.id}>
              <a href="#" 
                 onClick={(e) => { e.preventDefault(); setAppView(item.id); }}
                 className={`flex items-center p-2 lg:p-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm lg:text-base ${activeView === item.id ? 'bg-indigo-600' : ''}`}>
                <div className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3 flex-shrink-0">{item.icon}</div> 
                <span className="truncate">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      {/* 用户信息区域 */}
      <div className="p-3 lg:p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center mb-2 lg:mb-3">
          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-2 lg:mr-3 flex-shrink-0">
            <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs lg:text-sm text-white truncate">{user?.name || t('userName')}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            {isAdmin && (
              <span className="inline-block bg-red-600 text-white text-xs px-1 lg:px-2 py-0.5 lg:py-1 rounded mt-1">
                {t('admin')}
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={onLogout} 
          className="flex items-center gap-1 lg:gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          <span className="hidden sm:inline">{t('logout')}</span>
          <span className="sm:hidden">退出</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;