import React from 'react';
import { Book, Mic, FileText, UserCog, BrainCircuit, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';

const Button = ({ children, className, ...props }) => <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${className}`} {...props}>{children}</button>;

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-5 lg:p-6 rounded-lg text-left bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg mobile-feature-card">
        <div className="h-8 w-8 mb-3 lg:mb-4">{icon}</div>
        <h3 className="text-lg lg:text-xl font-bold mb-2 lg:mb-3">{title}</h3>
        <p className="text-gray-400 text-sm lg:text-base leading-relaxed">{description}</p>
    </div>
);

const HomePage = ({ onLogin }) => {
  const { language, toggleLanguage, isChinese } = useLanguage();
  const t = (key) => getText(key, language);

  const handleLoginClick = () => {
    console.log('DEBUG: Login button clicked!');
    console.log('DEBUG: onLogin prop:', onLogin);
    if (onLogin) {
      console.log('DEBUG: Calling onLogin function');
      onLogin();
    } else {
      console.log('DEBUG: onLogin prop is not provided');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="w-full px-8 py-4 flex justify-between items-center fixed top-0 left-0 bg-gray-900/80 backdrop-blur-sm z-10">
        <div className="text-2xl font-bold flex items-center">
          <BrainCircuit className="w-8 h-8 mr-2 text-indigo-400" /> 
          {t('appTitle')}
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-gray-300">
          <a href="#features" className="hover:text-indigo-400">{t('features')}</a>
          <Button 
            onClick={toggleLanguage} 
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-1"
          >
            <Globe size={16} />
            {isChinese ? 'EN' : '中文'}
          </Button>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <section className="w-full max-w-4xl py-20">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">{t('heroTitle')}</h1>
          <p className="text-lg md:text-xl text-gray-400 mb-12">{t('heroSubtitle')}</p>
          
          {/* 登录注册卡片 */}
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg border border-gray-700 p-6 lg:p-8 shadow-2xl mobile-login-card">
            <div className="text-center mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
                {t('welcomeBack')}
              </h2>
              <p className="text-sm lg:text-base text-gray-400">
                {t('loginToContinue')}
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={handleLoginClick} 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 text-base lg:text-lg font-medium"
              >
                {t('loginRegister')}
              </Button>
              
              <div className="text-center">
                <p className="text-xs lg:text-sm text-gray-400">
                  {t('newUser')} 
                  <span className="text-indigo-400 ml-1">
                    {t('clickToRegister')}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full max-w-6xl py-16 lg:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t('coreFeatures')}</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {t('coreFeaturesSubtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <FeatureCard 
                icon={<Book className="text-green-400" />} 
                title={t('smartQuestionBank')} 
                description={t('smartQuestionBankDesc')} 
              />
              <FeatureCard 
                icon={<Mic className="text-blue-400" />} 
                title={t('aiMockInterview')} 
                description={t('aiMockInterviewDesc')} 
              />
              <FeatureCard 
                icon={<FileText className="text-purple-400" />} 
                title={t('resumeOptimizer')} 
                description={t('resumeOptimizerDesc')} 
              />
              <FeatureCard 
                icon={<UserCog className="text-yellow-400" />} 
                title={t('personalizedCoach')} 
                description={t('personalizedCoachDesc')} 
              />
          </div>
        </section>
      </main>
      <footer className="w-full p-4 text-center text-gray-500 text-sm bg-gray-900">{t('copyright')}</footer>
    </div>
  );
};

export default HomePage;