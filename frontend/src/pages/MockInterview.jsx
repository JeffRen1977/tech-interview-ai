import React from 'react';
import { Mic } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';

const MockInterview = () => {
    return (
      <div>
        <h1 className="text-4xl font-bold mb-8">AI 模拟面试</h1>
        <Card className="bg-gray-800 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold mb-2">面试设置</h2>
              <div className="flex space-x-4">
                <Select><option>面试类型: 算法</option><option>系统设计</option><option>行为题</option></Select>
                <Select><option>语言: 中文</option><option>English</option></Select>
              </div>
            </div>
            <div className="text-right">
               <div className="text-lg font-mono bg-gray-700 px-4 py-2 rounded-lg">44:15</div>
               <div className="space-x-2">
                    <Button className="bg-gray-600 mt-2 text-xs">暂停</Button>
                    <Button className="bg-red-600 mt-2 text-xs">结束</Button>
               </div>
            </div>
          </div>
          {/* 对话交互区 */}
          <div className="h-[50vh] bg-black/30 rounded-lg p-4 space-y-4 overflow-y-auto">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center"><Mic size={16}/></div>
                <div className="bg-gray-700 p-3 rounded-lg text-sm"><p>好的，我们开始吧。请看这道题：给定一个整数数组，找到两个数的和等于目标值的索引。</p></div>
            </div>
             <div className="flex items-start gap-3 justify-end">
                <div className="bg-blue-600 p-3 rounded-lg text-sm"><p>我可以使用哈希表来解决这个问题，时间复杂度是O(n)。</p></div>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center">You</div>
            </div>
          </div>
        </Card>
      </div>
    );
};

export default MockInterview;
