'use client';

import AIRecommendation from './AIRecommendation';
import ComfortIndex from './ComfortIndex';
import NASAData from './NASAData';
import { WeatherResultsProps } from '@/types/weather';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Cloud, 
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  MapPin
} from 'lucide-react';

const WeatherResults: React.FC<WeatherResultsProps> = ({ data }) => {
  // Validate data structure
  if (!data || !data.location || !data.weather) {
    return (
      <div className="clean-card p-8 text-center">
        <div className="text-red-500 mb-4">
          <Cloud className="w-12 h-12 mx-auto mb-2" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Veri Hatası</h3>
        <p className="text-gray-600">Hava durumu verileri alınamadı. Lütfen tekrar deneyin.</p>
      </div>
    );
  }

  const { location, date, weather, comfortIndex, nasaData, aiRecommendation } = data;

  // Get weather icon based on weather code with fallback
  const getWeatherIcon = (weatherCode: number | undefined) => {
    if (weatherCode === undefined || weatherCode === null) {
      return <Cloud className="w-8 h-8 text-gray-500" />;
    }
    
    if (weatherCode === 0) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (weatherCode <= 3) return <Cloud className="w-8 h-8 text-gray-500" />;
    if (weatherCode <= 48) return <Cloud className="w-8 h-8 text-gray-600" />;
    if (weatherCode <= 67) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (weatherCode <= 77) return <CloudSnow className="w-8 h-8 text-blue-300" />;
    if (weatherCode <= 99) return <CloudLightning className="w-8 h-8 text-purple-500" />;
    return <Cloud className="w-8 h-8 text-gray-500" />;
  };

  // Get weather description based on weather code
  const getWeatherDescription = (weatherCode: number | undefined) => {
    if (weatherCode === undefined || weatherCode === null) return 'Bilinmeyen';
    if (weatherCode === 0) return 'Açık';
    if (weatherCode <= 3) return 'Parçalı Bulutlu';
    if (weatherCode <= 48) return 'Bulutlu';
    if (weatherCode <= 67) return 'Yağmurlu';
    if (weatherCode <= 77) return 'Karlı';
    if (weatherCode <= 99) return 'Fırtınalı';
    return 'Bilinmeyen';
  };

  // Format date to Turkish
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        {/* Modern Location Header */}
        <div className="relative overflow-hidden bg-white/10 backdrop-blur-md rounded-3xl p-8 text-white shadow-2xl animate-slideUp border border-white/20">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-center space-x-6 mb-4 lg:mb-0">
                <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 animate-float shadow-xl">
                  {getWeatherIcon(weather.weatherCode)}
                </div>
                <div>
                  <h2 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {location?.name || 'Bilinmeyen Konum'}
                  </h2>
                  <p className="text-blue-100 text-xl font-medium">{getWeatherDescription(weather?.weatherCode)}</p>
                </div>
              </div>
              <div className="text-center lg:text-right bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/10">
                <div className="text-sm text-blue-100 mb-2 font-medium">Tarih</div>
                <div className="font-bold text-xl">{formatDate(date)}</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl border border-white/10">
                <MapPin className="w-6 h-6" />
                <span className="font-semibold text-xl">{location?.country || 'Bilinmeyen Ülke'}</span>
              </div>
              <div className="text-center bg-white/5 backdrop-blur-md rounded-2xl px-8 py-6 shadow-xl border border-white/10">
                <div className="text-sm text-blue-100 mb-2 font-medium">Mevcut Sıcaklık</div>
                <div className="text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {weather?.temperature?.max || '--'}°
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* AI Recommendation */}
      <div className="animate-scaleIn">
        <AIRecommendation recommendation={aiRecommendation || "AI analizi yükleniyor..."} />
      </div>

        {/* Modern Weather Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp">
          <div className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl border border-white/10 hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 shadow-lg">
                  <Thermometer className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-semibold text-white/90">Sıcaklık</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {weather?.temperature?.max || '--'}°
              </div>
              <div className="text-sm text-white/70">
                Maks: {weather?.temperature?.max || '--'}° / Min: {weather?.temperature?.min || '--'}°
              </div>
            </div>
          </div>

          <div className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl border border-white/10 hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-4 shadow-lg">
                  <Wind className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-semibold text-white/90">Rüzgar</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {weather?.windSpeed || '--'}
              </div>
              <div className="text-sm text-white/70">km/h</div>
            </div>
          </div>

          <div className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl border border-white/10 hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-4 shadow-lg">
                  <Droplets className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-semibold text-white/90">Yağış</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {weather?.precipitation || '--'}
              </div>
              <div className="text-sm text-white/70">mm</div>
            </div>
          </div>

          <div className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl border border-white/10 hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 shadow-lg">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-semibold text-white/90">Nem</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {weather?.humidity || '--'}%
              </div>
              <div className="text-sm text-white/70">Bağıl nem</div>
            </div>
          </div>
        </div>

        {/* Additional Weather Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp">
          <div className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl border border-white/10 hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 shadow-lg">
                  <Sun className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-semibold text-white/90">UV İndeksi</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {weather?.uvIndex || '--'}
              </div>
              <div className="text-sm text-white/70">
                {weather?.uvIndex ? (
                  weather.uvIndex <= 2 ? 'Düşük' : 
                  weather.uvIndex <= 5 ? 'Orta' :
                  weather.uvIndex <= 7 ? 'Yüksek' :
                  weather.uvIndex <= 10 ? 'Çok Yüksek' : 'Ekstrem'
                ) : 'Bilinmeyen'}
              </div>
            </div>
          </div>

          <div className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl border border-white/10 hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 shadow-lg">
                  <i className="fas fa-sunset text-white text-2xl"></i>
                </div>
                <span className="text-sm font-semibold text-white/90">Gün Batımı</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {weather?.sunset ? new Date(weather.sunset).toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : '--'}
              </div>
              <div className="text-sm text-white/70">
                Doğuş: {weather?.sunrise ? new Date(weather.sunrise).toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : '--'}
              </div>
            </div>
          </div>

          <div className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl border border-white/10 hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-4 shadow-lg">
                  <i className="fas fa-eye text-white text-2xl"></i>
                </div>
                <span className="text-sm font-semibold text-white/90">Görüş</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {weather?.visibility || '--'}
              </div>
              <div className="text-sm text-white/70">km</div>
            </div>
          </div>

          <div className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl border border-white/10 hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 to-slate-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-gray-500 to-slate-500 rounded-2xl p-4 shadow-lg">
                  <i className="fas fa-gauge text-white text-2xl"></i>
                </div>
                <span className="text-sm font-semibold text-white/90">Basınç</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {Math.round(weather?.pressure || 0)}
              </div>
              <div className="text-sm text-white/70">hPa</div>
            </div>
          </div>
        </div>

        {/* Comfort Index */}
        {comfortIndex && (
          <div className="animate-scaleIn">
            <ComfortIndex comfortIndex={comfortIndex} />
          </div>
        )}

        {/* NASA Data */}
        {nasaData && (
          <div className="animate-scaleIn">
            <NASAData nasaData={nasaData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherResults;