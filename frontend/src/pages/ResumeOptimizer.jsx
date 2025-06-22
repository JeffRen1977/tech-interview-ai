import React from 'react';
import { CloudUpload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';

const ResumeOptimizer = () => {
    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">简历分析与职位匹配</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-gray-800 p-6">
                    <CardHeader><CardTitle>上传简历</CardTitle></CardHeader>
                    <CardContent>
                        <div className="h-40 border-2 border-dashed border-gray-600 flex flex-col items-center justify-center rounded-lg">
                            <CloudUpload className="mb-2" />
                            <p>拖拽文件或点击上传</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 p-6">
                    <CardHeader><CardTitle>粘贴职位描述 (JD)</CardTitle></CardHeader>
                    <CardContent>
                        <Textarea placeholder="将职位描述粘贴到此处..." className="h-40 bg-gray-900" />
                        <Button className="bg-indigo-600 mt-4 w-full">分析匹配度</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ResumeOptimizer;