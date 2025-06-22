import React from 'react';
import StatCard from '../components/StatCard';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Code } from 'lucide-react';

const Dashboard = () => {
    return (
        <div>
            <h1 className="text-4xl font-bold mb-4">仪表盘</h1>
            <p className="text-gray-400 mb-8">欢迎回来！这是您的学习进度概览。</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="已完成题目" value="25" />
                <StatCard title="知识点覆盖率" value="68%" />
                <StatCard title="模拟面试平均分" value="85/100" />
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-4">下一步重点练习 (AI推荐)</h2>
                <div className="space-y-3">
                    <Card className="bg-gray-800 flex items-center justify-between p-4">
                        <span className="flex items-center"><Code className="mr-3 text-green-400" />动态规划 (DP)</span>
                        <Button className="bg-indigo-600">开始练习</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;