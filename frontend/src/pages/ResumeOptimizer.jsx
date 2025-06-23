import React, { useState } from 'react';
import { CloudUpload, FileText, Target, Mail, Download, Copy, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { resumeAPI } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';

const ResumeOptimizer = () => {
    const { language } = useLanguage();
    const t = (key) => getText(key, language);

    const [activeTab, setActiveTab] = useState('analyzer');
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [positionTitle, setPositionTitle] = useState('');
    const [companyCulture, setCompanyCulture] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [copied, setCopied] = useState(false);

    // File upload handling
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setResumeText(e.target.result);
            };
            reader.readAsText(file);
        }
    };

    // Resume Analyzer
    const handleResumeAnalysis = async () => {
        if (!resumeText.trim()) {
            alert(t('pleaseEnterResumeText'));
            return;
        }

        setLoading(true);
        try {
            const response = await resumeAPI.analyzeResume(resumeText, jobDescription);
            setResults({ type: 'analysis', data: response.analysis });
        } catch (error) {
            console.error('Resume analysis error:', error);
            alert(t('analyzeResumeFailed'));
        } finally {
            setLoading(false);
        }
    };

    // JD Matching Assessment
    const handleJDMatching = async () => {
        if (!resumeText.trim() || !jobDescription.trim()) {
            alert(t('pleaseEnterResumeAndJD'));
            return;
        }

        setLoading(true);
        try {
            const response = await resumeAPI.assessJDMatching(resumeText, jobDescription);
            setResults({ type: 'matching', data: response.assessment });
        } catch (error) {
            console.error('JD matching error:', error);
            alert(t('assessJDMatchingFailed'));
        } finally {
            setLoading(false);
        }
    };

    // Cover Letter Generator
    const handleCoverLetterGeneration = async () => {
        if (!resumeText.trim() || !jobDescription.trim() || !companyName.trim() || !positionTitle.trim()) {
            alert(t('pleaseFillAllFields'));
            return;
        }

        setLoading(true);
        try {
            const response = await resumeAPI.generateCoverLetter(
                resumeText, 
                jobDescription, 
                companyName, 
                positionTitle, 
                companyCulture
            );
            setResults({ type: 'coverLetter', data: response.coverLetter });
        } catch (error) {
            console.error('Cover letter generation error:', error);
            alert(t('generateCoverLetterFailed'));
        } finally {
            setLoading(false);
        }
    };

    // Copy to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Download as text file
    const downloadAsFile = (content, filename) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const tabs = [
        { id: 'analyzer', label: t('resumeAnalyzer'), icon: FileText },
        { id: 'matching', label: t('jdMatching'), icon: Target },
        { id: 'coverLetter', label: t('coverLetter'), icon: Mail }
    ];

    const renderResults = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center p-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
                </div>
            );
        }
        
        if (!results) return null;

        switch (results.type) {
            case 'analysis':
                const { 
                    overallAssessment, 
                    optimizationSuggestions, 
                    recommendedModifications, 
                    skillsToHighlight, 
                    experienceImprovements, 
                    formattingSuggestions 
                } = results.data;

                return (
                    <Card className="bg-gray-800 mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <FileText className="w-6 h-6 text-blue-400" />
                                {t('resumeAnalysisResults')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Overall Assessment */}
                            <div className="p-4 bg-gray-900 rounded-lg">
                                <h4 className="font-semibold text-lg mb-2 text-blue-400">{t('overallAssessment')}</h4>
                                <p className="text-gray-300 whitespace-pre-wrap">{overallAssessment}</p>
                            </div>
                            
                            {/* Optimization Suggestions */}
                            {optimizationSuggestions?.length > 0 && (
                                <div className="p-4 bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-2 text-green-400">{t('optimizationSuggestions')}</h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        {optimizationSuggestions.map((suggestion, index) => (
                                            <li key={index}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Recommended Modifications */}
                            {recommendedModifications?.length > 0 && (
                                <div className="p-4 bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-2 text-yellow-400">{t('recommendedModifications')}</h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        {recommendedModifications.map((mod, index) => (
                                            <li key={index}>{mod}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Experience Improvements */}
                            {experienceImprovements?.length > 0 && (
                                <div className="p-4 bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-2 text-purple-400">{t('experienceImprovements')}</h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        {experienceImprovements.map((imp, index) => (
                                            <li key={index}>{imp}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Skills to Highlight */}
                            {skillsToHighlight?.length > 0 && (
                                <div className="p-4 bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-2 text-red-400">{t('skillsToHighlight')}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {skillsToHighlight.map((skill, index) => (
                                            <span key={index} className="bg-red-600/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {/* Formatting Suggestions */}
                             {formattingSuggestions?.length > 0 && (
                                <div className="p-4 bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-2 text-indigo-400">{t('formattingSuggestions')}</h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        {formattingSuggestions.map((suggestion, index) => (
                                            <li key={index}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );

            case 'matching':
                const { matchingScore, matchingAnalysis, missingSkills, reinforcementPoints } = results.data;
                return (
                    <Card className="bg-gray-800 mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Target className="w-6 h-6 text-green-400" />
                                {t('jdMatchingAssessment')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center p-4 bg-gray-900 rounded-lg">
                                <div className="text-5xl font-bold text-green-400 mb-2">
                                    {matchingScore || 0}%
                                </div>
                                <div className="text-gray-300 font-semibold">{t('overallMatchScore')}</div>
                            </div>
    
                            {matchingAnalysis && (
                                <div className="p-4 bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-3 text-green-400">{t('detailedAnalysis')}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(matchingAnalysis).map(([key, value]) => (
                                            <div key={key} className="p-3 bg-gray-800 rounded">
                                                <h5 className="capitalize font-bold text-gray-200">{key}</h5>
                                                <p className="text-sm text-gray-400">{value.details}</p>
                                                <div className="text-right font-bold text-lg text-green-500">{value.score}%</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {missingSkills?.length > 0 && (
                                <div className="p-4 bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-2 text-red-400">{t('skillsToAdd')}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {missingSkills.map((skill, index) => (
                                            <span key={index} className="bg-red-600/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
    
                            {reinforcementPoints?.length > 0 && (
                                <div className="p-4 bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-2 text-yellow-400">{t('reinforcementPoints')}</h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        {reinforcementPoints.map((point, index) => (
                                            <li key={index}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );

            case 'coverLetter':
                const { coverLetter, keyHighlights, customizationNotes } = results.data;
                return (
                    <Card className="bg-gray-800 mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Mail className="w-6 h-6 text-indigo-400" />
                                {t('coverLetterResult')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-gray-900 rounded-lg">
                                <h4 className="font-semibold text-lg mb-2 text-indigo-400">{t('coverLetter')}</h4>
                                <Textarea value={coverLetter} readOnly className="h-40 bg-gray-800 border-gray-700" />
                                <div className="flex gap-2 mt-2">
                                    <Button onClick={() => copyToClipboard(coverLetter)} variant="outline" size="sm">
                                        <Copy size={16} /> {copied ? t('copied') : t('copy')}
                                    </Button>
                                    <Button onClick={() => downloadAsFile(coverLetter, 'cover_letter.txt')} variant="outline" size="sm">
                                        <Download size={16} /> {t('download')}
                                    </Button>
                                </div>
                            </div>
                            {keyHighlights?.length > 0 && (
                                <div className="p-4 bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-2 text-purple-400">{t('keyHighlights')}</h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        {keyHighlights.map((highlight, index) => (
                                            <li key={index}>{highlight}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
    
                            {customizationNotes && (
                                <div className="p-4 bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-lg mb-2 text-purple-400">{t('customizationNotes')}</h4>
                                    <p className="text-gray-300 italic">"{customizationNotes}"</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">{t('resumeOptimizationSuite')}</h1>
                
                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="flex bg-gray-800 rounded-lg p-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Input Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Resume Input */}
                    <Card className="bg-gray-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                {t('resumeContent')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                                <input
                                    type="file"
                                    accept=".txt,.doc,.docx,.pdf"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="resume-upload"
                                />
                                <label htmlFor="resume-upload" className="cursor-pointer">
                                    <CloudUpload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    <p className="text-gray-400">{t('uploadResumeFileOrPaste')}</p>
                                </label>
                            </div>
                            <Textarea
                                placeholder={t('pasteResumeContent')}
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                className="h-40 bg-gray-900 border-gray-600"
                            />
                        </CardContent>
                    </Card>

                    {/* Job Description Input */}
                    <Card className="bg-gray-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                {t('jobDescription')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder={t('pasteJobDescription')}
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="h-40 bg-gray-900 border-gray-600"
                            />
                            
                            {/* Additional fields for cover letter */}
                            {activeTab === 'coverLetter' && (
                                <div className="space-y-3">
                                    <Input
                                        placeholder={t('companyName')}
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="bg-gray-900 border-gray-600"
                                    />
                                    <Input
                                        placeholder={t('positionTitle')}
                                        value={positionTitle}
                                        onChange={(e) => setPositionTitle(e.target.value)}
                                        className="bg-gray-900 border-gray-600"
                                    />
                                    <Textarea
                                        placeholder={t('companyCultureOptional')}
                                        value={companyCulture}
                                        onChange={(e) => setCompanyCulture(e.target.value)}
                                        className="h-20 bg-gray-900 border-gray-600"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Action Button */}
                <div className="flex justify-center mb-8 gap-4">
                    {activeTab === 'analyzer' && (
                        <Button onClick={handleResumeAnalysis} className="bg-blue-600 hover:bg-blue-700">
                            {t('analyzeResume')}
                        </Button>
                    )}
                    {activeTab === 'matching' && (
                        <Button onClick={handleJDMatching} className="bg-green-600 hover:bg-green-700">
                            {t('assessJDMatching')}
                        </Button>
                    )}
                    {activeTab === 'coverLetter' && (
                        <Button onClick={handleCoverLetterGeneration} className="bg-indigo-600 hover:bg-indigo-700">
                            {t('generateCoverLetter')}
                        </Button>
                    )}
                </div>

                {/* Results */}
                {renderResults()}
            </div>
        </div>
    );
};

export default ResumeOptimizer;