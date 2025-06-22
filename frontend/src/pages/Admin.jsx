import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { apiRequest } from '../api.js';

// 主 Admin 组件，负责标签页切换
const Admin = () => {
    const [activeTab, setActiveTab] = useState('coding');

    return (
        <div>
            <div className="text-center mb-8"><i className="fas fa-tools text-4xl text-indigo-400 mb-3"></i><h1 className="text-4xl font-bold">问题生成器管理后台</h1><p className="text-gray-400">使用Gemini为AI教练生成新的面试问题。</p></div>
            <div className="max-w-4xl mx-auto">
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
                            <button 
                                className={`py-2 px-6 font-semibold rounded-t-lg ${activeTab === 'behavioral' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                                onClick={() => setActiveTab('behavioral')}
                            >
                                行为面试题
                            </button>
                        </div>
                        {activeTab === 'coding' && <CodingAdmin />}
                        {activeTab === 'system' && <SystemDesignAdmin />}
                        {activeTab === 'behavioral' && <BehavioralAdmin />}
                        </div>
        </div>
    );
};

// 编程题管理组件
const CodingAdmin = () => {
    const [generatedData, setGeneratedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault(); 
        const title = e.target.elements['coding-title'].value;
        const description = e.target.elements['coding-description'].value;
        if (!title || !description) {
            alert('请输入题目标题和描述。');
            return;
        }
        
        setIsLoading(true);
        setGeneratedData(null);
        setError(null);

        try {
            const data = await apiRequest('/questions/generate-coding', 'POST', { title, description });
            setGeneratedData(data.questionData);
        } catch (err) {
            setError(`生成问题时出错: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSuccess = () => {
        setGeneratedData(null);
        const form = document.getElementById('generation-form-coding');
        if (form) {
            form.reset();
        }
    };

    return (
        <div>
            <form id="generation-form-coding" onSubmit={handleGenerate} className="space-y-4 p-6 bg-gray-800 rounded-xl">
                <div>
                    <label htmlFor="coding-title" className="block mb-2 font-semibold">题目标题</label>
                    <Input name="coding-title" id="coding-title" placeholder="例如: Two Sum, LRU Cache" />
                </div>
                <div>
                    <label htmlFor="coding-description" className="block mb-2 font-semibold">题目描述</label>
                    <Textarea name="coding-description" id="coding-description" className="h-24" placeholder="例如: Given an array of integers nums..." />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600">
                    {isLoading ? <><i className="fas fa-spinner fa-spin mr-2"></i>正在生成...</> : '✨ 生成题目分析与解答'}
                </Button>
            </form>
            <div className="mt-8">
                {isLoading && (
                     <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 min-h-[200px] flex items-center justify-center">
                        <p className="text-gray-500"><i className="fas fa-spinner fa-spin mr-2"></i>AI 正在分析题目，请稍候...</p>
                    </div>
                )}
                {error && <div className="p-6 bg-red-900/20 rounded-xl border border-red-500"><p className="text-red-400">{error}</p></div>}
                {generatedData && !isLoading && (
                    <EditableCodingForm initialData={generatedData} onSaveSuccess={handleSaveSuccess} />
                )}
            </div>
        </div>
    );
};

// 系统设计题管理组件
const SystemDesignAdmin = () => {
    const [generatedData, setGeneratedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        const title = e.target.elements['system-title'].value;
        const description = e.target.elements['system-description'].value;
        if (!title || !description) {
            alert('请输入问题标题和核心描述。');
            return;
        }
        setIsLoading(true);
        setGeneratedData(null);
        setError(null);
        try {
            const data = await apiRequest('/questions/generate-system', 'POST', { title, description });
            setGeneratedData(data.questionData);
        } catch (err) {
            setError(`生成问题时出错: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveSuccess = () => {
        setGeneratedData(null);
        const form = document.getElementById('generation-form-system');
        if (form) {
            form.reset();
        }
    };

    return (
        <div>
            <form id="generation-form-system" onSubmit={handleGenerate} className="space-y-4 p-6 bg-gray-800 rounded-xl">
                <div>
                    <label htmlFor="system-title" className="block mb-2 font-semibold">问题标题</label>
                    <Input name="system-title" id="system-title" placeholder="例如: 设计一个类似Instagram的图片分享服务" />
                </div>
                <div>
                    <label htmlFor="system-description" className="block mb-2 font-semibold">核心描述</label>
                    <Textarea name="system-description" id="system-description" className="h-24" placeholder="例如: 用户可以上传照片，关注其他用户，并看到他们关注的人的照片feed。" />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600">
                     {isLoading ? <><i className="fas fa-spinner fa-spin mr-2"></i>正在生成...</> : '✨ 生成详细设计方案'}
                </Button>
            </form>
             <div className="mt-8">
                {isLoading && (
                     <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 min-h-[200px] flex items-center justify-center">
                        <p className="text-gray-500"><i className="fas fa-spinner fa-spin mr-2"></i>AI 正在生成设计方案，请稍候...</p>
                    </div>
                )}
                {error && <div className="p-6 bg-red-900/20 rounded-xl border border-red-500"><p className="text-red-400">{error}</p></div>}
                {generatedData && !isLoading && (
                    <EditableSystemForm initialData={generatedData} onSaveSuccess={handleSaveSuccess} />
                )}
            </div>
        </div>
    );
};

// 可编辑的编程题表单
const EditableCodingForm = ({ initialData, onSaveSuccess }) => {
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.target);
        const finalQuestionData = {
            questionId: formData.get('edit-id'),
            title: formData.get('edit-title'),
            description: formData.get('edit-description'),
            example: formData.get('edit-example').replace(/\n/g, '\\n'),
            solution: formData.get('edit-solution').replace(/\n/g, '\\n'),
            explanation: formData.get('edit-explanation'),
            testCases: formData.get('edit-test-cases').replace(/\n/g, '\\n'),
            complexity: initialData.complexity,
            dataStructures: formData.get('edit-ds').split(',').map(s => s.trim()),
            algorithms: formData.get('edit-algo').split(',').map(s => s.trim()),
            difficulty: formData.get('edit-difficulty'),
        };
        
        try {
            const data = await apiRequest('/questions/save-coding', 'POST', { questionData: finalQuestionData });
            alert(data.message);
            onSaveSuccess();
        } catch(error) {
            alert(`保存失败: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <form onSubmit={handleSave} className="space-y-6 p-6 bg-gray-800 rounded-xl border border-indigo-500">
            <h2 className="text-2xl font-bold text-center">审核并编辑编程题</h2>
            <input type="hidden" name="edit-id" defaultValue={initialData.questionId} />
            <Card className="bg-gray-900/50"><CardHeader><CardTitle>基本信息</CardTitle></CardHeader><CardContent className="space-y-4">
                <div><label htmlFor="edit-title" className="block mb-2 font-medium text-gray-400">标题</label><Input name="edit-title" id="edit-title" defaultValue={initialData.title} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label htmlFor="edit-difficulty" className="block mb-2 font-medium text-gray-400">难度</label><Select name="edit-difficulty" id="edit-difficulty" defaultValue={initialData.difficulty}><option>Easy</option><option>Medium</option><option>Hard</option></Select></div></div>
            </CardContent></Card>
            <Card className="bg-gray-900/50"><CardHeader><CardTitle>题目内容</CardTitle></CardHeader><CardContent className="space-y-4">
                <div><label htmlFor="edit-description" className="block mb-2 font-medium text-gray-400">描述</label><Textarea name="edit-description" id="edit-description" className="h-24" defaultValue={initialData.description} /></div>
                <div><label htmlFor="edit-example" className="block mb-2 font-medium text-gray-400">例子</label><Textarea name="edit-example" id="edit-example" className="h-20" defaultValue={initialData.example.replace(/\\n/g, '\n')} /></div>
            </CardContent></Card>
            <Card className="bg-gray-900/50"><CardHeader><CardTitle>AI 生成的解答与分析</CardTitle></CardHeader><CardContent className="space-y-4">
                <div><label htmlFor="edit-solution" className="block mb-2 font-medium text-gray-400">解决方案 (Python)</label><Textarea name="edit-solution" id="edit-solution" className="h-48" defaultValue={initialData.solution.replace(/\\n/g, '\n')} /></div>
                <div><label htmlFor="edit-test-cases" className="block mb-2 font-medium text-gray-400">测试用例 (Python)</label><Textarea name="edit-test-cases" id="edit-test-cases" className="h-40" defaultValue={initialData.testCases.replace(/\\n/g, '\n')} /></div>
                <div><label htmlFor="edit-explanation" className="block mb-2 font-medium text-gray-400">解释</label><Textarea name="edit-explanation" id="edit-explanation" className="h-32" defaultValue={initialData.explanation} /></div>
            </CardContent></Card>
            <Card className="bg-gray-900/50"><CardHeader><CardTitle>分类标签</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="edit-ds" className="block mb-2 font-medium text-gray-400">数据结构 (逗号分隔)</label><Input name="edit-ds" id="edit-ds" defaultValue={(initialData.dataStructures || []).join(', ')} /></div>
                <div><label htmlFor="edit-algo" className="block mb-2 font-medium text-gray-400">算法 (逗号分隔)</label><Input name="edit-algo" id="edit-algo" defaultValue={(initialData.algorithms || []).join(', ')} /></div>
            </CardContent></Card>
            <div className="flex justify-end pt-4 space-x-4">
                 <Button type="button" onClick={onSaveSuccess} className="bg-red-600 hover:bg-red-500">🗑️ 拒绝并清空</Button>
                 <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-500">{isSaving ? <><i className="fas fa-spinner fa-spin mr-2"></i>保存中...</> : '💾 保存到数据库'}</Button>
            </div>
        </form>
    );
};

// 可编辑的系统设计题表单
const EditableSystemForm = ({ initialData, onSaveSuccess }) => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.target);
        const finalQuestionData = {
            title: formData.get('edit-title'),
            description: initialData.description,
            category: formData.get('edit-category'),
            detailedAnswer: formData.get('edit-answer').replace(/\n/g, '\\n'),
            tags: formData.get('edit-tags').split(',').map(s => s.trim()),
        };
        
        try {
            const data = await apiRequest('/questions/save-system-design', 'POST', { questionData: finalQuestionData });
            alert(data.message);
            onSaveSuccess();
        } catch(error) {
            alert(`保存失败: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <form onSubmit={handleSave} className="space-y-6 p-6 bg-gray-800 rounded-xl border border-indigo-500">
            <h2 className="text-2xl font-bold text-center">审核并编辑系统设计题</h2>
            <Card className="bg-gray-900/50"><CardHeader><CardTitle>基本信息</CardTitle></CardHeader><CardContent className="space-y-4">
                <div><label htmlFor="edit-title" className="block mb-2 font-medium text-gray-400">标题</label><Input name="edit-title" id="edit-title" defaultValue={initialData.title} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label htmlFor="edit-category" className="block mb-2 font-medium text-gray-400">分类</label><Input name="edit-category" id="edit-category" defaultValue={initialData.category} /></div>
                    <div><label htmlFor="edit-tags" className="block mb-2 font-medium text-gray-400">标签 (逗号分隔)</label><Input name="edit-tags" id="edit-tags" defaultValue={(initialData.tags || []).join(', ')} /></div>
                </div>
            </CardContent></Card>
            <Card className="bg-gray-900/50"><CardHeader><CardTitle>AI 生成的详细解答</CardTitle></CardHeader><CardContent>
                <div><label htmlFor="edit-answer" className="block mb-2 font-medium text-gray-400">详细解答 (Markdown)</label><Textarea name="edit-answer" id="edit-answer" className="h-96" defaultValue={initialData.detailedAnswer.replace(/\\n/g, '\n')} /></div>
            </CardContent></Card>
            <div className="flex justify-end pt-4 space-x-4">
                 <Button type="button" onClick={onSaveSuccess} className="bg-red-600 hover:bg-red-500">🗑️ 拒绝并清空</Button>
                 <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-500">{isSaving ? <><i className="fas fa-spinner fa-spin mr-2"></i>保存中...</> : '💾 保存到数据库'}</Button>
            </div>
        </form>
    );
};

// 行为面试题管理组件 (新增)
const BehavioralAdmin = () => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        const skill = e.target.elements['behavioral-skill'].value;
        if (!skill) {
            alert('请输入要考察的技能。');
            return;
        }
        setIsSaving(true);
        
        try {
            // 在这个场景下，我们直接构造问题并保存
            const questionData = {
                title: `Tell me about a time you demonstrated ${skill}`,
                prompt: `Describe a situation where you had to use your ${skill} skills. What was the context, what did you do, and what was the result?`,
                category: 'Behavioral',
                tags: [skill.toLowerCase()]
            };
            const data = await apiRequest('/questions/save-behavioral', 'POST', { questionData });
            alert(data.message);
            e.target.reset();
        } catch(error) {
            alert(`保存失败: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Card className="bg-gray-800 p-6">
            <CardHeader>
                <CardTitle>添加行为面试题</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="behavioral-skill" className="block text-sm font-medium text-gray-400 mb-1">要考察的技能</label>
                        <Input name="behavioral-skill" id="behavioral-skill" placeholder="例如: Leadership, Conflict Resolution" />
                    </div>
                    <Button type="submit" disabled={isSaving} className="w-full bg-indigo-600">
                        {isSaving ? '保存中...' : '💾 添加到数据库'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default Admin;
