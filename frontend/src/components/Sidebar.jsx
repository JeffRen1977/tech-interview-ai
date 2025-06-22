import React from 'react';
import { LayoutDashboard, Code, Mic, FileText, Building, History, UserCog, BrainCircuit, Shield } from 'lucide-react';

const Sidebar = ({ activeView, setAppView, onLogout }) => {
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard />, label: '仪表盘' },
    { id: 'coding-practice', icon: <Code />, label: '算法练习' },
    { id: 'mock-interview', icon: <Mic />, label: 'AI 模拟面试' },
    { id: 'resume-optimizer', icon: <FileText />, label: '简历与职位匹配' },
    { id: 'company-prep', icon: <Building />, label: '公司面试准备' },
    { id: 'feedback-center', icon: <History />, label: '复盘与反馈' },
    { id: 'coach-agent', icon: <UserCog />, label: 'AI 个性化教练' },
    { id: 'admin', icon: <Shield />, label: '管理工具' }, // 新增管理工具链接
  ];

  return (
    <nav className="w-64 bg-gray-800 p-4 flex flex-col justify-between">
      <div>
        <div className="text-2xl font-bold mb-10 text-center text-white flex items-center justify-center">
          <BrainCircuit className="w-8 h-8 mr-2" /> AI 教练
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
        <p className="font-semibold text-sm">Jianfeng Ren</p>
        <button onClick={onLogout} className="text-xs text-indigo-400 hover:underline">登出</button>
      </div>
    </nav>
  );
};

export default Sidebar;