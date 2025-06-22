import React from 'react';
import { Book, Mic, FileText, UserCog, BrainCircuit } from 'lucide-react';

const Button = ({ children, className, ...props }) => <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${className}`} {...props}>{children}</button>;

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-6 rounded-lg text-left bg-gray-800 border border-gray-700">
        <div className="h-8 w-8 mb-3">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </div>
);

const HomePage = ({ onLogin }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="w-full px-8 py-4 flex justify-between items-center fixed top-0 left-0 bg-gray-900/80 backdrop-blur-sm z-10">
        <div className="text-2xl font-bold flex items-center"><BrainCircuit className="w-8 h-8 mr-2 text-indigo-400" /> AI 面试教练</div>
        <nav className="hidden md:flex items-center space-x-6 text-gray-300">
          <a href="#features" className="hover:text-indigo-400">产品功能</a>
        </nav>
        <Button onClick={onLogin} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2">登录/注册</Button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <section className="w-full max-w-4xl py-20">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">你的专属 AI 面试教练</h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8">算法、系统设计、行为面试，一站式搞定</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={onLogin} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 text-lg">开始准备</Button>
          </div>
        </section>
        
        <section id="features" className="w-full max-w-5xl py-20">
          <h2 className="text-3xl font-bold mb-8">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard icon={<Book className="text-green-400" />} title="智能题库" description="覆盖LeetCode热题、系统设计与SQL，支持多维度筛选。" />
              <FeatureCard icon={<Mic className="text-blue-400" />} title="AI模拟面试" description="与AI进行算法、系统设计或行为面试，获得专业反馈。" />
              <FeatureCard icon={<FileText className="text-purple-400" />} title="简历优化" description="分析简历与职位描述（JD）的匹配度，提供优化建议。" />
              <FeatureCard icon={<UserCog className="text-yellow-400" />} title="个性化教练" description="AI Agent根据你的目标和进度，为你量身定制每日学习计划。" />
          </div>
        </section>
      </main>
      <footer className="w-full p-4 text-center text-gray-500 text-sm bg-gray-900">© 2025 AI 面试教练. 保留所有权利。</footer>
    </div>
  );
};

export default HomePage;