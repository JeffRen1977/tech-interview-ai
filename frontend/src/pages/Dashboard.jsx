import React from 'react';
import { Card } from '../components/ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';

export default function Dashboard() {
  const { language } = useLanguage();
  const t = (key) => getText(key, language);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-10">
        <Card className="bg-gray-800 p-6">
          <h1 className="text-3xl font-bold mb-4">{t('dashboardTitle')}</h1>
          <p className="text-gray-400">{t('welcomeMessage')}</p>
          <p className="text-gray-400 mt-2">{t('useSidebar')}</p>
        </Card>
      </div>
    </div>
  );
}