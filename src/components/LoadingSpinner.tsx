'use client';

import { LoadingSpinnerProps } from '@/types/weather';
import { useLanguage } from '@/contexts/LanguageContext';
import { Cloud, Sparkles } from 'lucide-react';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const { t } = useLanguage();
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center space-y-6 animate-fadeIn">
      <div className="clean-card p-8 rounded-2xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className={`${sizeClasses[size]} animate-spin`}>
              <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-pulse text-blue-600" />
              {t('analyzing_weather_data')}
            </p>
            <p className="text-sm text-gray-600">
              {t('ai_processing_request')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
