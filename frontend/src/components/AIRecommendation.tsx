'use client';

import React from 'react';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shirt, 
  Target, 
  Shield, 
  Heart,
  MapPin,
  Thermometer
} from 'lucide-react';

interface AIRecommendationProps {
  recommendation: string;
}

const AIRecommendation: React.FC<AIRecommendationProps> = ({ recommendation }) => {
  if (!recommendation || recommendation === "AI analizi yükleniyor...") {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden animate-scaleIn shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-xl p-3 animate-glow">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">AI Hava Durumu Asistanı</h3>
              <p className="text-purple-100">Kapsamlı analiz ve kişiselleştirilmiş öneriler</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-white/70 text-lg">AI analizi hazırlanıyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Parse the comprehensive recommendation text
  const parseRecommendation = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const sections = {
      suitability: '',
      suitabilityScore: '',
      weatherAnalysis: [] as string[],
      comfortAnalysis: [] as string[],
      timeRecommendations: [] as string[],
      optimalTimes: [] as string[],
      clothingBasic: [] as string[],
      clothingPriority: [] as string[],
      activityTips: [] as string[],
      activityGear: [] as string[],
      activityTiming: [] as string[],
      safetyTips: [] as string[],
      safetyPriority: [] as string[],
      healthTips: [] as string[],
      locationInfo: [] as string[]
    };

    let currentSection = '';
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.includes('**ETKİNLİK UYGUNLUĞU:**') || trimmed.includes('Uygunluk:')) {
        sections.suitability = trimmed;
        currentSection = 'suitability';
      } else if (trimmed.includes('**DETAYLI HAVA DURUMU ANALİZİ:**')) {
        currentSection = 'weatherAnalysis';
      } else if (trimmed.includes('**KONFOR DEĞERLENDİRMESİ:**')) {
        currentSection = 'comfortAnalysis';
      } else if (trimmed.includes('**ZAMAN ÖNERİLERİ:**')) {
        currentSection = 'timeRecommendations';
      } else if (trimmed.includes('**En İyi Zamanlar:**')) {
        currentSection = 'optimalTimes';
      } else if (trimmed.includes('**Temel Giyim:**')) {
        currentSection = 'clothingBasic';
      } else if (trimmed.includes('**Öncelikli Eşyalar:**')) {
        currentSection = 'clothingPriority';
      } else if (trimmed.includes('**Genel İpuçları:**')) {
        currentSection = 'activityTips';
      } else if (trimmed.includes('**Gerekli Ekipmanlar:**')) {
        currentSection = 'activityGear';
      } else if (trimmed.includes('**Zamanlama:**')) {
        currentSection = 'activityTiming';
      } else if (trimmed.includes('**GÜVENLİK UYARILARI:**')) {
        currentSection = 'safetyTips';
      } else if (trimmed.includes('**Yüksek Öncelikli Riskler:**')) {
        currentSection = 'safetyPriority';
      } else if (trimmed.includes('**SAĞLIK İPUÇLARI:**')) {
        currentSection = 'healthTips';
      } else if (trimmed.includes('**KONUM BİLGİSİ:**')) {
        currentSection = 'locationInfo';
      } else if (trimmed && currentSection && trimmed.startsWith('•')) {
        const section = sections[currentSection as keyof typeof sections];
        if (Array.isArray(section)) {
          section.push(trimmed.substring(1).trim());
        }
      } else if (trimmed && currentSection === 'suitability' && !trimmed.includes('**')) {
        sections.suitabilityScore = trimmed;
      }
    });

    return sections;
  };

  const parsed = parseRecommendation(recommendation);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden animate-scaleIn shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-xl p-3 animate-glow">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">AI Hava Durumu Asistanı</h3>
            <p className="text-purple-100">Kapsamlı analiz ve kişiselleştirilmiş öneriler</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Suitability Assessment */}
        {parsed.suitability && (
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-6 border border-green-400/30">
            <div className="flex items-start space-x-4">
              <div className="bg-green-500/20 rounded-xl p-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-white mb-2">Etkinlik Uygunluğu</h4>
                <div className="text-white/90 text-lg leading-relaxed">
                  {parsed.suitability}
                </div>
                {parsed.suitabilityScore && (
                  <div className="mt-2 text-white/80 text-sm">
                    {parsed.suitabilityScore}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Weather Analysis */}
        {parsed.weatherAnalysis.length > 0 && (
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center">
              <Thermometer className="w-6 h-6 mr-3 text-cyan-400" />
              Detaylı Hava Durumu Analizi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parsed.weatherAnalysis.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></div>
                  <span className="text-white/90 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comfort Analysis */}
        {parsed.comfortAnalysis.length > 0 && (
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center">
              <Heart className="w-6 h-6 mr-3 text-pink-400" />
              Konfor Değerlendirmesi
            </h4>
            <div className="space-y-3">
              {parsed.comfortAnalysis.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-2 h-2 bg-pink-400 rounded-full flex-shrink-0"></div>
                  <span className="text-white/90 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Recommendations */}
        {(parsed.timeRecommendations.length > 0 || parsed.optimalTimes.length > 0) && (
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-yellow-400" />
              Zaman Önerileri
            </h4>
            
            {parsed.optimalTimes.length > 0 && (
              <div className="mb-4">
                <h5 className="text-lg font-semibold text-white/90 mb-2">En İyi Zamanlar</h5>
                <div className="space-y-2">
                  {parsed.optimalTimes.map((time, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-500/20 rounded-xl border border-yellow-400/30">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                      <span className="text-white/90 text-sm font-medium">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsed.timeRecommendations.length > 0 && (
              <div>
                <h5 className="text-lg font-semibold text-white/90 mb-2">Genel Öneriler</h5>
                <div className="space-y-2">
                  {parsed.timeRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                      <span className="text-white/90 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clothing Recommendations */}
        {(parsed.clothingBasic.length > 0 || parsed.clothingPriority.length > 0) && (
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center">
              <Shirt className="w-6 h-6 mr-3 text-purple-400" />
              Giyim Önerileri
            </h4>
            
            {parsed.clothingBasic.length > 0 && (
              <div className="mb-4">
                <h5 className="text-lg font-semibold text-white/90 mb-2">Temel Giyim</h5>
                <div className="space-y-2">
                  {parsed.clothingBasic.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                      <span className="text-white/90 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsed.clothingPriority.length > 0 && (
              <div>
                <h5 className="text-lg font-semibold text-white/90 mb-2">Öncelikli Eşyalar</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {parsed.clothingPriority.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-purple-500/20 rounded-xl border border-purple-400/30">
                      <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                      <span className="text-white/90 text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Recommendations */}
        {(parsed.activityTips.length > 0 || parsed.activityGear.length > 0 || parsed.activityTiming.length > 0) && (
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center">
              <Target className="w-6 h-6 mr-3 text-orange-400" />
              Etkinlik Özel Önerileri
            </h4>
            
            {parsed.activityTips.length > 0 && (
              <div className="mb-4">
                <h5 className="text-lg font-semibold text-white/90 mb-2">Genel İpuçları</h5>
                <div className="space-y-2">
                  {parsed.activityTips.map((tip, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                      <span className="text-white/90 text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsed.activityGear.length > 0 && (
              <div className="mb-4">
                <h5 className="text-lg font-semibold text-white/90 mb-2">Gerekli Ekipmanlar</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {parsed.activityGear.map((gear, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-orange-500/20 rounded-xl border border-orange-400/30">
                      <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                      <span className="text-white/90 text-sm font-medium">{gear}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsed.activityTiming.length > 0 && (
              <div>
                <h5 className="text-lg font-semibold text-white/90 mb-2">Zamanlama</h5>
                <div className="space-y-2">
                  {parsed.activityTiming.map((timing, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                      <span className="text-white/90 text-sm">{timing}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Safety Warnings */}
        {(parsed.safetyTips.length > 0 || parsed.safetyPriority.length > 0) && (
          <div className="bg-red-500/10 rounded-2xl p-6 border border-red-400/30">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-red-400" />
              Güvenlik Uyarıları
            </h4>
            
            {parsed.safetyPriority.length > 0 && (
              <div className="mb-4">
                <h5 className="text-lg font-semibold text-white/90 mb-2">Yüksek Öncelikli Riskler</h5>
                <div className="space-y-2">
                  {parsed.safetyPriority.map((risk, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-red-500/20 rounded-xl border border-red-400/50">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-white/90 text-sm font-medium">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsed.safetyTips.length > 0 && (
              <div>
                <h5 className="text-lg font-semibold text-white/90 mb-2">Güvenlik Önerileri</h5>
                <div className="space-y-2">
                  {parsed.safetyTips.map((tip, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                      <span className="text-white/90 text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Health Tips */}
        {parsed.healthTips.length > 0 && (
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center">
              <Heart className="w-6 h-6 mr-3 text-pink-400" />
              Sağlık İpuçları
            </h4>
            <div className="space-y-2">
              {parsed.healthTips.map((tip, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-pink-500/20 rounded-xl border border-pink-400/30">
                  <div className="w-2 h-2 bg-pink-400 rounded-full flex-shrink-0"></div>
                  <span className="text-white/90 text-sm font-medium">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Info */}
        {parsed.locationInfo.length > 0 && (
          <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl p-6 border border-blue-400/30">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center">
              <MapPin className="w-6 h-6 mr-3 text-blue-400" />
              Konum Bilgisi
            </h4>
            <div className="space-y-2">
              {parsed.locationInfo.map((info, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span className="text-white/90 text-sm">{info}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Badge */}
        <div className="text-center pt-6 border-t border-white/10">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-400/30">
            <Brain className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-white/90">
              🤖 AI destekli analiz - NASA verileri ile güçlendirilmiştir
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendation;