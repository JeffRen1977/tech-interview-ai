import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';

const CodingPractice = () => {
  const [isSubNavOpen, setIsSubNavOpen] = useState(true);
  
  return (
    <div className="flex h-full gap-8">
      {/* 左侧导航栏 */}
      <nav className="w-56 pr-6 border-r border-gray-700">
        <h2 className="text-xl font-bold mb-4">算法练习</h2>
        <ul className="space-y-1">
          <li><a href="#" className="block font-semibold p-2 rounded-md bg-indigo-600/30 text-white">题库总览</a></li>
          <li><a href="#" className="block p-2 rounded-md hover:bg-gray-700 text-gray-300">我的错题本</a></li>
          <li>
            <a href="#" onClick={() => setIsSubNavOpen(!isSubNavOpen)} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-700 text-gray-300">
              <span>高频公司题</span> {isSubNavOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </a>
            {isSubNavOpen && (
              <ul className="pl-6 mt-1 text-sm text-gray-400 space-y-1">
                <li><a href="#" className="block p-1 hover:text-white">Google</a></li>
                <li><a href="#" className="block p-1 hover:text-white">Meta</a></li>
              </ul>
            )}
          </li>
          <li><a href="#" className="block p-2 rounded-md hover:bg-gray-700 text-gray-300">系统设计题</a></li>
        </ul>
      </nav>

      {/* 主内容区域 */}
      <main className="flex-1">
        <h1 className="text-4xl font-bold mb-8">题库总览</h1>
        <div className="flex flex-wrap gap-4 mb-6">
            <Select><option>公司: Google</option></Select>
            <Select><option>难度: Medium</option></Select>
            <Select><option>类型: Array</option></Select>
        </div>
        {/* 做题区 (Split Pane) */}
        <div className="flex flex-col h-[70vh] gap-4">
          <Card className="flex-1 bg-gray-800 p-6 overflow-y-auto">
            <h3 className="text-xl font-bold mb-2">题目: Two Sum</h3>
            <p className="text-sm text-gray-300">给定一个整数数组 `nums` 和一个整数目标值 `target`，请你在该数组中找出 和为目标值 `target` 的那 两个 整数，并返回它们的数组下标。</p>
            <p className="text-sm text-gray-300 mt-2">你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。</p>
          </Card>
          <Card className="flex-1 bg-gray-800 flex flex-col">
            <div className="p-2 border-b border-gray-700 flex justify-between items-center">
                <span className="text-sm">代码编辑器</span>
                <Select className="text-xs h-8"><option>Python</option><option>Java</option><option>C++</option></Select>
            </div>
            <div className="flex-grow bg-black/50 font-mono text-sm p-2"># 在这里编写你的代码</div>
            <div className="p-2 border-t border-gray-700 flex justify-end items-center space-x-2">
              <Button className="bg-gray-600 text-xs">AI解释</Button>
              <Button className="bg-green-600 text-xs">提交</Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CodingPractice;