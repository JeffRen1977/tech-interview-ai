import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { apiRequest } from '../api.js';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';

// 主 Admin 组件，负责标签页切换
const Admin = () => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    const [activeTab, setActiveTab] = useState('coding');

    return (
        <div>
            <div className="text-center mb-8">
                <i className="fas fa-tools text-4xl text-indigo-400 mb-3"></i>
                <h1 className="text-4xl font-bold">{t('questionGeneratorAdmin')}</h1>
                <p className="text-gray-400">{t('adminSubtitle')}</p>
            </div>
            <div className="max-w-4xl mx-auto">
                <div className="flex border-b border-gray-700 mb-6">
                    <button 
                        className={`py-2 px-6 font-semibold rounded-t-lg ${activeTab === 'coding' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                        onClick={() => setActiveTab('coding')}
                    >
                        {t('codingQuestions')}
                    </button>
                    <button 
                        className={`py-2 px-6 font-semibold rounded-t-lg ${activeTab === 'system' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                        onClick={() => setActiveTab('system')}
                    >
                        {t('systemDesignQuestions')}
                    </button>
                    <button 
                        className={`py-2 px-6 font-semibold rounded-t-lg ${activeTab === 'behavioral' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                        onClick={() => setActiveTab('behavioral')}
                    >
                        {t('behavioralQuestions')}
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
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    const [generatedData, setGeneratedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault(); 
        const title = e.target.elements['coding-title'].value;
        const description = e.target.elements['coding-description'].value;
        if (!title || !description) {
            alert(t('pleaseEnterTitle'));
            return;
        }
        
        setIsLoading(true);
        setGeneratedData(null);
        setError(null);

        try {
            const data = await apiRequest('/questions/generate-coding', 'POST', { title, description });
            setGeneratedData(data.questionData);
        } catch (err) {
            setError(`${t('generationError')} ${err.message}`);
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
                    <label htmlFor="coding-title" className="block mb-2 font-semibold">{t('questionTitle')}</label>
                    <Input name="coding-title" id="coding-title" placeholder={t('questionTitlePlaceholder')} />
                </div>
                <div>
                    <label htmlFor="coding-description" className="block mb-2 font-semibold">{t('questionDescription')}</label>
                    <Textarea name="coding-description" id="coding-description" className="h-24" placeholder={t('questionDescriptionPlaceholder')} />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600">
                    {isLoading ? <><i className="fas fa-spinner fa-spin mr-2"></i>{t('generating')}</> : t('generateQuestionAnalysis')}
                </Button>
            </form>
            <div className="mt-8">
                {isLoading && (
                     <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 min-h-[200px] flex items-center justify-center">
                        <p className="text-gray-500"><i className="fas fa-spinner fa-spin mr-2"></i>{t('aiAnalyzing')}</p>
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
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    const [generatedData, setGeneratedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        const title = e.target.elements['system-title'].value;
        const description = e.target.elements['system-description'].value;
        if (!title || !description) {
            alert(t('pleaseEnterSystemTitle'));
            return;
        }
        setIsLoading(true);
        setGeneratedData(null);
        setError(null);
        try {
            const data = await apiRequest('/questions/generate-system', 'POST', { title, description });
            setGeneratedData(data.questionData);
        } catch (err) {
            setError(`${t('generationError')} ${err.message}`);
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
                    <label htmlFor="system-title" className="block mb-2 font-semibold">{t('systemTitle')}</label>
                    <Input name="system-title" id="system-title" placeholder={t('systemTitlePlaceholder')} />
                </div>
                <div>
                    <label htmlFor="system-description" className="block mb-2 font-semibold">{t('coreDescription')}</label>
                    <Textarea name="system-description" id="system-description" className="h-24" placeholder={t('coreDescriptionPlaceholder')} />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600">
                     {isLoading ? <><i className="fas fa-spinner fa-spin mr-2"></i>{t('generating')}</> : t('generateDetailedDesign')}
                </Button>
            </form>
             <div className="mt-8">
                {isLoading && (
                     <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 min-h-[200px] flex items-center justify-center">
                        <p className="text-gray-500"><i className="fas fa-spinner fa-spin mr-2"></i>{t('aiGeneratingDesign')}</p>
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
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    const [isSaving, setIsSaving] = useState(false);
    
    // 安全字符串处理函数
    const safeString = (value) => {
        if (typeof value === 'string') {
            return value.replace(/\\n/g, '\n');
        }
        return value ? String(value) : '';
    };
    
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
            alert(`${t('saveFailed')} ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <form onSubmit={handleSave} className="space-y-6 p-6 bg-gray-800 rounded-xl border border-indigo-500">
            <h2 className="text-2xl font-bold text-center">{t('reviewEditCoding')}</h2>
            <input type="hidden" name="edit-id" defaultValue={initialData.questionId} />
            <Card className="bg-gray-900/50">
                <CardHeader>
                    <CardTitle>{t('basicInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label htmlFor="edit-title" className="block mb-2 font-medium text-gray-400">{t('title')}</label>
                        <Input name="edit-title" id="edit-title" defaultValue={initialData.title} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-difficulty" className="block mb-2 font-medium text-gray-400">{t('difficulty')}</label>
                            <Select name="edit-difficulty" id="edit-difficulty" defaultValue={initialData.difficulty}>
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-gray-900/50">
                <CardHeader>
                    <CardTitle>{t('questionContent')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label htmlFor="edit-description" className="block mb-2 font-medium text-gray-400">{t('description')}</label>
                        <Textarea name="edit-description" id="edit-description" className="h-24" defaultValue={initialData.description} />
                    </div>
                    <div>
                        <label htmlFor="edit-example" className="block mb-2 font-medium text-gray-400">{t('example')}</label>
                        <Textarea name="edit-example" id="edit-example" className="h-20" defaultValue={safeString(initialData.example)} />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-gray-900/50">
                <CardHeader>
                    <CardTitle>{t('aiGeneratedSolution')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label htmlFor="edit-solution" className="block mb-2 font-medium text-gray-400">{t('solution')}</label>
                        <Textarea name="edit-solution" id="edit-solution" className="h-48" defaultValue={safeString(initialData.solution)} />
                    </div>
                    <div>
                        <label htmlFor="edit-test-cases" className="block mb-2 font-medium text-gray-400">{t('testCases')}</label>
                        <Textarea name="edit-test-cases" id="edit-test-cases" className="h-40" defaultValue={safeString(initialData.testCases)} />
                    </div>
                    <div>
                        <label htmlFor="edit-explanation" className="block mb-2 font-medium text-gray-400">{t('explanation')}</label>
                        <Textarea name="edit-explanation" id="edit-explanation" className="h-32" defaultValue={initialData.explanation} />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-gray-900/50">
                <CardHeader>
                    <CardTitle>{t('categoryTags')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="edit-ds" className="block mb-2 font-medium text-gray-400">{t('dataStructures')}</label>
                        <Input name="edit-ds" id="edit-ds" defaultValue={(initialData.dataStructures || []).join(', ')} />
                    </div>
                    <div>
                        <label htmlFor="edit-algo" className="block mb-2 font-medium text-gray-400">{t('algorithms')}</label>
                        <Input name="edit-algo" id="edit-algo" defaultValue={(initialData.algorithms || []).join(', ')} />
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end pt-4 space-x-4">
                 <Button type="button" onClick={onSaveSuccess} className="bg-red-600 hover:bg-red-500">{t('rejectAndClear')}</Button>
                 <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-500">
                     {isSaving ? <><i className="fas fa-spinner fa-spin mr-2"></i>{t('saving')}</> : t('saveToDatabase')}
                 </Button>
            </div>
        </form>
    );
};

// 可编辑的系统设计题表单
const EditableSystemForm = ({ initialData, onSaveSuccess }) => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    const [isSaving, setIsSaving] = useState(false);

    // 安全字符串处理函数
    const safeString = (value) => {
        if (typeof value === 'string') {
            return value.replace(/\\n/g, '\n');
        }
        return value ? String(value) : '';
    };

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
            alert(`${t('saveFailed')} ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <form onSubmit={handleSave} className="space-y-6 p-6 bg-gray-800 rounded-xl border border-indigo-500">
            <h2 className="text-2xl font-bold text-center">{t('reviewEditSystem')}</h2>
            <Card className="bg-gray-900/50">
                <CardHeader>
                    <CardTitle>{t('basicInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label htmlFor="edit-title" className="block mb-2 font-medium text-gray-400">{t('title')}</label>
                        <Input name="edit-title" id="edit-title" defaultValue={initialData.title} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-category" className="block mb-2 font-medium text-gray-400">{t('category')}</label>
                            <Input name="edit-category" id="edit-category" defaultValue={initialData.category} />
                        </div>
                        <div>
                            <label htmlFor="edit-tags" className="block mb-2 font-medium text-gray-400">{t('tags')}</label>
                            <Input name="edit-tags" id="edit-tags" defaultValue={(initialData.tags || []).join(', ')} />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-gray-900/50">
                <CardHeader>
                    <CardTitle>{t('aiGeneratedSolution')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <label htmlFor="edit-answer" className="block mb-2 font-medium text-gray-400">{t('detailedAnswer')}</label>
                        <Textarea name="edit-answer" id="edit-answer" className="h-96" defaultValue={safeString(initialData.detailedAnswer)} />
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end pt-4 space-x-4">
                 <Button type="button" onClick={onSaveSuccess} className="bg-red-600 hover:bg-red-500">{t('rejectAndClear')}</Button>
                 <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-500">
                     {isSaving ? <><i className="fas fa-spinner fa-spin mr-2"></i>{t('saving')}</> : t('saveToDatabase')}
                 </Button>
            </div>
        </form>
    );
};

// 行为面试题管理组件 (新增)
const BehavioralAdmin = () => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        const skill = e.target.elements['behavioral-skill'].value;
        if (!skill) {
            alert(t('pleaseEnterSkill'));
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
            alert(`${t('saveFailed')} ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Card className="bg-gray-800 p-6">
            <CardHeader>
                <CardTitle>{t('addBehavioralQuestion')}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="behavioral-skill" className="block text-sm font-medium text-gray-400 mb-1">{t('skillToTest')}</label>
                        <Input name="behavioral-skill" id="behavioral-skill" placeholder={t('skillPlaceholder')} />
                    </div>
                    <Button type="submit" disabled={isSaving} className="w-full bg-indigo-600">
                        {isSaving ? t('saving') : t('addToDatabase')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default Admin;
