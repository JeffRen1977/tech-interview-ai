import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';

const Placeholder = ({ title }) => {
  const { language } = useLanguage();
  const t = (key) => getText(key, language);
  
  return (
    <div>
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="mt-4 text-gray-500">
        {language === 'zh' ? '此功能正在开发中...' : 'This feature is under development...'}
      </p>
    </div>
  );
};

export default Placeholder;