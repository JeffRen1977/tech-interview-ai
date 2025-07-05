import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import InterviewLearning from './pages/InterviewLearning';
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
import { authAPI, clearAuth } from './api';

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false); // 控制登录注册弹窗
  const [authChecked, setAuthChecked] = useState(false); // 防止重复检查认证状态
  const { language } = useLanguage();
  const t = (key) => getText(key, language);

  // 检查用户登录状态
  useEffect(() => {
    if (authChecked) {
      console.log('DEBUG: Auth already checked, skipping...');
      return;
    }
    
    const checkAuthStatus = async () => {
      console.log('DEBUG: checkAuthStatus called');
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      console.log('DEBUG: Found in localStorage - token:', !!token, 'user:', !!savedUser);
      
      if (token && savedUser) {
        try {
          // 先尝试使用本地存储的用户信息
          const userData = JSON.parse(savedUser);
          console.log('DEBUG: Parsed user data:', userData);
          setUser(userData);
          setIsLoggedIn(true);
          console.log('DEBUG: Set login state to true with user data');
          
          // 然后异步验证token有效性
          try {
            console.log('DEBUG: Attempting to validate token with backend...');
            const response = await authAPI.getCurrentUser();
            console.log('DEBUG: Token validation successful:', response);
            setUser(response.user);
          } catch (error) {
            console.log('DEBUG: Token validation failed, but keeping local session:', error.message);
            // 如果验证失败，不清除本地认证，让用户继续使用
          }
        } catch (error) {
          console.log('DEBUG: Error parsing user data or setting state:', error);
          clearAuth();
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        console.log('DEBUG: No token or user data found, staying logged out');
      }
      setIsLoading(false);
      setAuthChecked(true);
    };
    checkAuthStatus();
  }, [authChecked]);

  const handleLoginSuccess = (userData) => {
    console.log('DEBUG: handleLoginSuccess called with userData:', userData);
    console.log('DEBUG: Current state before update - isLoggedIn:', isLoggedIn, 'user:', user);
    
    setUser(userData);
    setIsLoggedIn(true);
    setActiveView('dashboard');
    setShowLogin(false);
    
    console.log('DEBUG: Login state updated - isLoggedIn: true, user:', userData);
    console.log('DEBUG: localStorage after login - token:', !!localStorage.getItem('token'), 'user:', !!localStorage.getItem('user'));
  };

  const handleLogout = () => {
    console.log('DEBUG: handleLogout called');
    clearAuth();
    setUser(null);
    setIsLoggedIn(false);
    setActiveView('dashboard');
  };

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // 未登录时，显示首页和登录注册弹窗
  if (!isLoggedIn) {
    console.log('DEBUG: User not logged in, showing HomePage');
    console.log('DEBUG: showLogin state:', showLogin);
    return (
      <>
        <HomePage onLogin={() => {
          console.log('DEBUG: onLogin callback triggered, setting showLogin to true');
          setShowLogin(true);
        }} />
        {showLogin && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
            <LoginRegister onLoginSuccess={handleLoginSuccess} />
          </div>
        )}
      </>
    );
  }

  // 已登录用户的主界面
  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      <Sidebar 
        activeView={activeView} 
        setAppView={setActiveView} 
        onLogout={handleLogout}
        user={user}
        isAdmin={user?.role === 'admin'}
      />
      <MainContent>
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'coding-practice' && <InterviewLearning />}
        {activeView === 'mock-interview' && <MockInterview />}
        {activeView === 'resume-optimizer' && <ResumeOptimizer />}
        {activeView === 'admin' && user?.role === 'admin' && <Admin />}
        {activeView === 'user-history' && <UserHistory />}
        {activeView === 'coach-agent' && <CoachAgent />}

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

