import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import CodingInterview from '../components/CodingInterview';
import BehavioralInterview from '../components/BehavioralInterview';
import SystemDesignInterview from '../components/SystemDesignInterview';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';

const MockInterview = () => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);
    const [interviewType, setInterviewType] = useState('coding');
    const [interviewLanguage, setInterviewLanguage] = useState('chinese');

    const renderInterviewContent = () => {
        switch (interviewType) {
            case 'coding':
                return <CodingInterview />;
            case 'system-design':
                return <SystemDesignInterview />;
            case 'behavioral':
                return <BehavioralInterview />;
            default:
                return <CodingInterview />;
        }
    };

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">{t('aiMockInterviewTitle')}</h1>
            
            {/* 面试类型选择 */}
            <Card className="bg-gray-800 p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">{t('interviewSettings')}</h2>
                <div className="flex space-x-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('interviewType')}</label>
                        <Select 
                            value={interviewType} 
                            onChange={(e) => setInterviewType(e.target.value)}
                        >
                            <option value="coding">{t('codingInterview')}</option>
                            <option value="system-design">{t('systemDesignInterview')}</option>
                            <option value="behavioral">{t('behavioralInterview')}</option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('language')}</label>
                        <Select 
                            value={interviewLanguage} 
                            onChange={(e) => setInterviewLanguage(e.target.value)}
                        >
                            <option value="chinese">{t('chinese')}</option>
                            <option value="english">{t('english')}</option>
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
