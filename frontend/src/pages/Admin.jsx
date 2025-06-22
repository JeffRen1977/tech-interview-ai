import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('coding');

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">管理工具</h1>
            <div className="flex border-b border-gray-700 mb-6">
                <button 
                    className={`py-2 px-6 font-semibold rounded-t-lg ${activeTab === 'coding' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('coding')}
                >
                    编程题
                </button>
                <button 
                    className={`py-2 px-6 font-semibold rounded-t-lg ${activeTab === 'system' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('system')}
                >
                    系统设计题
                </button>
            </div>
            {activeTab === 'coding' && <CodingAdmin />}
            {activeTab === 'system' && <SystemDesignAdmin />}
        </div>
    );
};

const CodingAdmin = () => {
    return (
        <Card className="bg-gray-800 p-6">
            <CardHeader>
                <CardTitle>添加编程题</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">题目标题</label>
                        <Input placeholder="例如: Two Sum" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">题目描述</label>
                        <Textarea placeholder="例如: Given an array of integers..." />
                    </div>
                    <Button className="w-full bg-indigo-600">生成并添加题目</Button>
                </form>
            </CardContent>
        </Card>
    );
};

const SystemDesignAdmin = () => {
    return (
        <Card className="bg-gray-800 p-6">
            <CardHeader>
                <CardTitle>添加系统设计题</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">题目标题</label>
                        <Input placeholder="例如: Design TinyURL" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">题目描述</label>
                        <Textarea placeholder="例如: Design a URL shortening service..." />
                    </div>
                    <Button className="w-full bg-indigo-600">生成并添加题目</Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default Admin;
