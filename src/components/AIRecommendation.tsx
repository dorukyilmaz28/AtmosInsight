'use client';

import { Bot, MessageCircle, Sparkles } from 'lucide-react';

interface AIRecommendationProps {
  recommendation: string;
}

const AIRecommendation: React.FC<AIRecommendationProps> = ({ recommendation }) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-xl p-4 md:p-8 border border-purple-100">
      <div className="flex items-center mb-4 md:mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-2 md:p-3 mr-3 md:mr-4">
          <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 text-purple-500" />
            AI Asistan Önerisi
          </h3>
          <p className="text-xs md:text-sm text-gray-600">
            Akıllı hava durumu analizi ve etkinlik önerileri
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-inner border border-gray-100">
        <div className="space-y-4">
          {/* Parse and display recommendation in a structured way */}
          {recommendation.split('\n\n').map((section, index) => {
            if (section.includes('**Uygunluk:**')) {
              const suitability = section.match(/\*\*Uygunluk:\*\* (.+)/)?.[1] || '';
              const emoji = section.match(/^([^\s]+)/)?.[1] || '';
              return (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-xl md:text-2xl mr-2">{emoji}</span>
                    <span className="font-semibold text-green-800 text-sm md:text-base">Etkinlik Uygunluğu</span>
                  </div>
                  <p className="text-green-700 font-medium text-sm md:text-base">{suitability}</p>
                </div>
              );
            }
            
            if (section.includes('**Hava Durumu:**')) {
              const weatherData = section.split('\n').slice(1);
              return (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                  <h4 className="font-semibold text-blue-800 mb-2 md:mb-3 flex items-center text-sm md:text-base">
                    <span className="text-lg md:text-xl mr-2">📊</span>
                    Hava Durumu
                  </h4>
                  <div className="grid grid-cols-1 gap-1 md:gap-2">
                    {weatherData.map((line, i) => (
                      <div key={i} className="text-blue-700 text-xs md:text-sm">
                        {line.replace(/^• /, '')}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            
            if (section.includes('**Konfor Skoru:**')) {
              const scoreMatch = section.match(/\*\*Konfor Skoru:\*\* (\d+)\/100 \((.+)\)/);
              if (scoreMatch) {
                const score = scoreMatch[1];
                const level = scoreMatch[2];
                return (
                <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3 md:p-4">
                  <h4 className="font-semibold text-purple-800 mb-2 flex items-center text-sm md:text-base">
                    <span className="text-lg md:text-xl mr-2">📈</span>
                    Konfor Değerlendirmesi
                  </h4>
                  <div className="flex items-center space-x-2 md:space-x-4">
                    <div className="text-xl md:text-2xl font-bold text-purple-700">{score}/100</div>
                    <div className="text-purple-600 font-medium text-sm md:text-base">{level}</div>
                  </div>
                </div>
                );
              }
            }
            
            if (section.includes('**Zaman Önerileri:**') || section.includes('**Giyim Önerileri:**') || section.includes('**Etkinlik İpuçları:**') || section.includes('**Güvenlik Uyarıları:**')) {
              const title = section.match(/\*\*(.+?):\*\*/)?.[1] || '';
              const items = section.split('\n').slice(1).filter(item => item.trim());
              const iconMap: { [key: string]: string } = {
                'Zaman Önerileri': '⏰',
                'Giyim Önerileri': '👕',
                'Etkinlik İpuçları': '🎯',
                'Güvenlik Uyarıları': '⚠️'
              };
              
              return (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 flex items-center text-sm md:text-base">
                    <span className="text-lg md:text-xl mr-2">{iconMap[title] || '💡'}</span>
                    {title}
                  </h4>
                  <ul className="space-y-1 md:space-y-2">
                    {items.map((item, i) => (
                      <li key={i} className="text-gray-700 text-xs md:text-sm flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span>{item.replace(/^• /, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            
            // Default case for other content
            return (
              <div key={index} className="text-gray-700 text-sm leading-relaxed">
                {section}
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};

export default AIRecommendation;
