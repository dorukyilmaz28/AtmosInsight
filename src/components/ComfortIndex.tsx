'use client';

import React from 'react';
import { Thermometer, Droplets, Wind, Eye, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface ComfortIndexProps {
  comfortIndex: {
    score: number;
    level: string;
    issues: string[];
    color: string;
  };
}

const ComfortIndex: React.FC<ComfortIndexProps> = ({ comfortIndex }) => {
  if (!comfortIndex) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };


  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 60) return 'from-green-300 to-green-500';
    if (score >= 40) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-red-600';
  };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'mükemmel':
      case 'excellent':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'iyi':
      case 'good':
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case 'orta':
      case 'fair':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'kötü':
      case 'poor':
      case 'zorlu':
      case 'very poor':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      default:
        return <Thermometer className="w-6 h-6 text-gray-500" />;
    }
  };

  const getLevelDescription = (level: string) => {
    switch (level.toLowerCase()) {
      case 'mükemmel':
      case 'excellent':
        return 'Hava koşulları açık hava etkinlikleri için ideal. Herhangi bir özel önlem gerekmez.';
      case 'iyi':
      case 'good':
        return 'Hava koşulları genel olarak uygun. Sadece birkaç küçük önlem alınması yeterli.';
      case 'orta':
      case 'fair':
        return 'Hava koşulları orta düzeyde uygun. Bazı ek önlemler alınması önerilir.';
      case 'kötü':
      case 'poor':
        return 'Hava koşulları zorlayıcı olabilir. Dikkatli olun ve gerekli önlemleri alın.';
      case 'zorlu':
      case 'very poor':
        return 'Hava koşulları çok zorlayıcı. Açık hava etkinlikleri önerilmez.';
      default:
        return 'Hava koşulları değerlendiriliyor...';
    }
  };

  return (
    <div className="overflow-hidden animate-scaleIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90 backdrop-blur-sm p-6 text-white rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-xl p-3 animate-glow">
              <Thermometer className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Konfor İndeksi</h3>
              <p className="text-indigo-100">Hava koşullarının uygunluk değerlendirmesi</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-indigo-100 mb-1">Skor</div>
            <div className={`text-4xl font-bold ${getScoreColor(comfortIndex.score)}`}>
              {comfortIndex.score}/100
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-white/5 backdrop-blur-sm">
        {/* Main sections arranged side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - General Assessment */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Genel Değerlendirme</h4>
              <div className="flex items-center space-x-2">
                {getLevelIcon(comfortIndex.level)}
                <span className={`text-lg font-bold ${getScoreColor(comfortIndex.score)}`}>
                  {comfortIndex.level}
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative mb-4">
              <div className="w-full bg-white/20 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full bg-gradient-to-r ${getScoreGradient(comfortIndex.score)} transition-all duration-1000 ease-out`}
                  style={{ width: `${comfortIndex.score}%` }}
                ></div>
              </div>
              
              {/* Score markers */}
              <div className="flex justify-between text-xs text-white/70 mt-2">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20">
              <p className="text-white/90 leading-relaxed">
                {getLevelDescription(comfortIndex.level)}
              </p>
            </div>
          </div>

          {/* Right Column - Issues and Recommendations */}
          <div className="space-y-6">
            {/* Issues */}
            {comfortIndex.issues && comfortIndex.issues.length > 0 && (
              <div className="bg-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-orange-400/30">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
                  Dikkat Edilmesi Gerekenler
                </h4>
                <div className="space-y-3">
                  {comfortIndex.issues.map((issue, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-orange-100 leading-relaxed">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-indigo-500/20 backdrop-blur-sm rounded-2xl p-6 border border-indigo-400/30">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-indigo-400" />
                Genel Öneriler
              </h4>
              <div className="space-y-3">
                {comfortIndex.score >= 80 && (
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-white/90">Hava koşulları mükemmel! Açık hava etkinlikleri için ideal zaman.</p>
                  </div>
                )}
                {comfortIndex.score >= 60 && comfortIndex.score < 80 && (
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-white/90">Hava koşulları genel olarak uygun. Sadece temel önlemler alın.</p>
                  </div>
                )}
                {comfortIndex.score >= 40 && comfortIndex.score < 60 && (
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-white/90">Hava koşulları orta düzeyde. Ek önlemler almayı düşünün.</p>
                  </div>
                )}
                {comfortIndex.score < 40 && (
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-white/90">Hava koşulları zorlayıcı. Açık hava etkinlikleri önerilmez.</p>
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-white/90">Hava durumunu sürekli takip edin ve gerekirse planlarınızı güncelleyin.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown - Full width below */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4">Skor Analizi</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Temperature Factor */}
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30">
              <div className="flex items-center space-x-2 mb-2">
                <Thermometer className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-blue-200">Sıcaklık</span>
              </div>
              <div className="text-2xl font-bold text-blue-100">
                {comfortIndex.score >= 80 ? 'Mükemmel' : 
                 comfortIndex.score >= 60 ? 'İyi' : 
                 comfortIndex.score >= 40 ? 'Orta' : 'Zayıf'}
              </div>
            </div>

            {/* Wind Factor */}
            <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
              <div className="flex items-center space-x-2 mb-2">
                <Wind className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-green-200">Rüzgar</span>
              </div>
              <div className="text-2xl font-bold text-green-100">
                {comfortIndex.score >= 80 ? 'Uygun' : 
                 comfortIndex.score >= 60 ? 'Orta' : 
                 comfortIndex.score >= 40 ? 'Dikkat' : 'Güçlü'}
              </div>
            </div>

            {/* Precipitation Factor */}
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-blue-200">Yağış</span>
              </div>
              <div className="text-2xl font-bold text-blue-100">
                {comfortIndex.score >= 80 ? 'Yok' : 
                 comfortIndex.score >= 60 ? 'Az' : 
                 comfortIndex.score >= 40 ? 'Orta' : 'Yoğun'}
              </div>
            </div>

            {/* Humidity Factor */}
            <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-purple-200">Nem</span>
              </div>
              <div className="text-2xl font-bold text-purple-100">
                {comfortIndex.score >= 80 ? 'İdeal' : 
                 comfortIndex.score >= 60 ? 'Uygun' : 
                 comfortIndex.score >= 40 ? 'Orta' : 'Yüksek'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComfortIndex;