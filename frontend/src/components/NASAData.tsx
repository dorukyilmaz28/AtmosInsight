'use client';

import React from 'react';
import { Rocket, Sun, Thermometer, Droplets, Zap, Globe, Database, TrendingUp } from 'lucide-react';

interface NASADataProps {
  nasaData: {
    solarRadiation: number | null;
    temperature: {
      max: number | null;
      min: number | null;
    };
    humidity: number | null;
  } | null;
}

const NASAData: React.FC<NASADataProps> = ({ nasaData }) => {
  if (!nasaData) return null;

  // Check if we have any meaningful NASA data
  const hasSolarRadiation = nasaData.solarRadiation && nasaData.solarRadiation > 0;
  const hasTemperature = nasaData.temperature && 
    (nasaData.temperature.max !== null || nasaData.temperature.min !== null);
  const hasHumidity = nasaData.humidity && nasaData.humidity > 0;

  if (!hasSolarRadiation && !hasTemperature && !hasHumidity) {
    return (
      <div className="overflow-hidden animate-scaleIn">
        <div className="bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm p-6 text-white rounded-t-2xl">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-xl p-3">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">NASA POWER Verileri</h3>
              <p className="text-yellow-100">Uzay tabanlı atmosferik veriler</p>
            </div>
          </div>
        </div>
        <div className="p-8 bg-white/5 backdrop-blur-sm">
          <div className="text-center py-8">
            <div className="text-yellow-400 mb-4">
              <Database className="w-16 h-16 mx-auto" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">NASA Verileri Mevcut Değil</h4>
            <p className="text-white/80 mb-4">
              Şu anda NASA POWER veritabanından veri alınamıyor. 
              Hava durumu analizi Open-Meteo API verileri ile yapılmaktadır.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-yellow-500/20 backdrop-blur-sm rounded-full border border-yellow-400/30">
              <span className="text-sm font-medium text-yellow-200">
                🔄 Veriler güncelleniyor...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getSolarRadiationLevel = (value: number) => {
    if (value < 5) return { level: 'Düşük', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (value < 15) return { level: 'Orta', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (value < 25) return { level: 'Yüksek', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Çok Yüksek', color: 'text-red-600', bgColor: 'bg-red-100' };
  };


  return (
    <div className="overflow-hidden animate-scaleIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-sm p-6 text-white rounded-t-2xl">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-xl p-3 animate-glow">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">NASA POWER Verileri</h3>
            <p className="text-blue-100">Uzay tabanlı atmosferik ve güneş radyasyonu verileri</p>
          </div>
        </div>
      </div>

      <div className="p-8 bg-white/5 backdrop-blur-sm">
        {/* Introduction */}
        <div className="mb-8 bg-blue-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-400/30">
          <div className="flex items-start space-x-4">
            <Globe className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">NASA POWER Hakkında</h4>
              <p className="text-white/90 leading-relaxed">
                Bu veriler NASA&apos;nın Prediction of Worldwide Energy Resources (POWER) veritabanından gelmektedir. 
                Uydu gözlemleri ve atmosferik modeller kullanılarak oluşturulan bu veriler, 
                güneş radyasyonu ve atmosferik koşullar hakkında yüksek doğrulukta bilgi sağlar.
              </p>
            </div>
          </div>
        </div>

        {/* Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Solar Radiation */}
          {hasSolarRadiation && (
            <div className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl border border-white/20 hover:bg-white/15">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 shadow-lg">
                    <Sun className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white/90">Güneş Radyasyonu</span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {nasaData.solarRadiation?.toFixed(1)}
                </div>
                <div className="text-sm text-white/70">MJ/m²</div>
                <div className="mt-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    getSolarRadiationLevel(nasaData.solarRadiation!).bgColor
                  } ${getSolarRadiationLevel(nasaData.solarRadiation!).color}`}>
                    {getSolarRadiationLevel(nasaData.solarRadiation!).level}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Temperature Comparison */}
          {hasTemperature && (nasaData.temperature.max !== null || nasaData.temperature.min !== null) && (
            <div className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl border border-white/20 hover:bg-white/15">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 shadow-lg">
                    <Thermometer className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white/90">NASA Sıcaklık</span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {nasaData.temperature.max?.toFixed(1) || '--'}°
                </div>
                <div className="text-sm text-white/70">
                  {nasaData.temperature.min && `Min: ${nasaData.temperature.min.toFixed(1)}°C`}
                </div>
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Uydu Verisi
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Humidity */}
          {hasHumidity && (
            <div className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl border border-white/20 hover:bg-white/15">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 shadow-lg">
                    <Droplets className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white/90">NASA Nem</span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {nasaData.humidity?.toFixed(1)}%
                </div>
                <div className="text-sm text-white/70">Bağıl nem</div>
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Zap className="w-3 h-3 mr-1" />
                    Atmosferik
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Data Quality Information */}
        <div className="bg-gray-500/20 backdrop-blur-sm rounded-xl p-6 border border-gray-400/30">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-gray-400" />
            Veri Kalitesi ve Kaynak
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-white mb-2">Veri Kaynağı</h5>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• NASA POWER API v1.2</li>
                <li>• Uydu gözlemleri</li>
                <li>• Atmosferik modeller</li>
                <li>• Günlük güncellemeler</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-white mb-2">Doğruluk</h5>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• Yüksek çözünürlük (0.5° x 0.625°)</li>
                <li>• 40+ yıllık geçmiş veri</li>
                <li>• Bilimsel doğrulama</li>
                <li>• Gerçek zamanlı güncellemeler</li>
              </ul>
            </div>
          </div>
        </div>

        {/* NASA Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30">
            <Rocket className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-200">
              🚀 NASA POWER API ile güçlendirilmiştir
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NASAData;