import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const NotFound = () => {
  const { t } = useSettings();

  return (
    <div className="min-h-screen pt-20 px-6 bg-gray-50 dark:bg-dark flex flex-col items-center justify-center text-center transition-colors duration-300">
      <Meta title="404 - Page Not Found" />

      {/* 1. الأيقونة أو الرقم الكبير */}
      <div className="relative mb-8">
        <h1 className="text-9xl font-black text-gray-200 dark:text-white/5 select-none transition-colors">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
            <FaExclamationTriangle className="text-6xl text-primary animate-bounce drop-shadow-lg" />
        </div>
      </div>

      {/* 2. النصوص */}
      <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 uppercase transition-colors">
        {t('pageNotFound') || "Oops! Page Not Found"}
      </h2>
      
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-sm md:text-base leading-relaxed transition-colors">
        {t('pageNotFoundMsg') || "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."}
      </p>

      {/* 3. زر العودة */}
      <Link 
        to="/" 
        className="group relative bg-primary hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-primary/40 transition-all duration-300 flex items-center gap-2 overflow-hidden"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
        <FaHome className="text-lg" /> 
        <span>{t('backToHome') || "BACK TO HOME"}</span>
      </Link>

    </div>
  );
};

export default NotFound;