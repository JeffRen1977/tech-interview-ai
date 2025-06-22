import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import CodingInterview from '../components/CodingInterview';

const MockInterview = () => {
    const [interviewType, setInterviewType] = useState('coding');
    const [language, setLanguage] = useState('chinese');

    const renderInterviewContent = () => {
        switch (interviewType) {
            case 'coding':
                return <CodingInterview />;
            case 'system-design':
                return (
                    <Card className="bg-gray-800 p-6">
                        <h2 className="text-xl font-bold mb-4">系统设计面试</h2>
                        <p className="text-gray-300">系统设计面试功能正在开发中...</p>
                    </Card>
                );
            case 'behavioral':
                return (
                    <Card className="bg-gray-800 p-6">
                        <h2 className="text-xl font-bold mb-4">行为面试</h2>
                        <p className="text-gray-300">行为面试功能正在开发中...</p>
                    </Card>
                );
            default:
                return <CodingInterview />;
        }
    };

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">AI 模拟面试</h1>
            
            {/* 面试类型选择 */}
            <Card className="bg-gray-800 p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">面试设置</h2>
                <div className="flex space-x-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">面试类型</label>
                        <Select 
                            value={interviewType} 
                            onChange={(e) => setInterviewType(e.target.value)}
                        >
                            <option value="coding">编程面试</option>
                            <option value="system-design">系统设计面试</option>
                            <option value="behavioral">行为面试</option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">语言</label>
                        <Select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option value="chinese">中文</option>
                            <option value="english">English</option>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* 面试内容 */}
            {renderInterviewContent()}
        </div>
    );
};

export default MockInterview;
