import React from 'react';
import { Book, Mic, FileText, UserCog, BrainCircuit, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';

const Button = ({ children, className, ...props }) => <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${className}`} {...props}>{children}</button>;

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-6 rounded-lg text-left bg-gray-800 border border-gray-700">
        <div className="h-8 w-8 mb-3">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
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
        <Button onClick={handleLoginClick} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2">
          {t('loginRegister')}
        </Button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <section className="w-full max-w-4xl py-20">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">{t('heroTitle')}</h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8">{t('heroSubtitle')}</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={handleLoginClick} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 text-lg">
              {t('startPreparing')}
            </Button>
          </div>
        </section>
        
        <section id="features" className="w-full max-w-5xl py-20">
          <h2 className="text-3xl font-bold mb-8">{t('coreFeatures')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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