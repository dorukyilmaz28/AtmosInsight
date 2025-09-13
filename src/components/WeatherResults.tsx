'use client';

import WeatherCard from './WeatherCard';
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
  MapPin,
  Calendar
} from 'lucide-react';

const WeatherResults: React.FC<WeatherResultsProps> = ({ data }) => {
  const { location, date, weather, comfortIndex, nasaData, aiRecommendation } = data;

  // Get weather icon based on weather code
  const getWeatherIcon = (weatherCode: number) => {
    if (weatherCode === 0) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (weatherCode <= 3) return <Cloud className="w-8 h-8 text-gray-500" />;
    if (weatherCode <= 48) return <Cloud className="w-8 h-8 text-gray-600" />;
    if (weatherCode <= 67) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (weatherCode <= 77) return <CloudSnow className="w-8 h-8 text-blue-300" />;
    if (weatherCode <= 99) return <CloudLightning className="w-8 h-8 text-purple-500" />;
    return <Cloud className="w-8 h-8 text-gray-500" />;
  };

  // Get weather description based on weather code
  const getWeatherDescription = (weatherCode: number) => {
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
    <div className="space-y-8 animate-fadeIn">
      {/* Location Header */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-3xl p-8 text-white shadow-2xl animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 animate-float">
              {getWeatherIcon(weather.weatherCode)}
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">{location.name}</h2>
              <p className="text-blue-100 text-lg">{getWeatherDescription(weather.weatherCode)}</p>
            </div>
          </div>
          <div className="text-right bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-sm text-blue-100 mb-1">Tarih</div>
            <div className="font-bold text-lg">{formatDate(date)}</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold text-lg">{location.country}</span>
          </div>
          <div className="text-right bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
            <div className="text-sm text-blue-100 mb-1">Sıcaklık</div>
            <div className="text-4xl font-bold">{weather.temperature.max}°</div>
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      {aiRecommendation && (
        <div className="animate-scaleIn">
          <AIRecommendation recommendation={aiRecommendation} />
        </div>
      )}

      {/* Weather Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-xl p-3">
              <Thermometer className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600">Sıcaklık</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {weather.temperature.max}°
          </div>
          <div className="text-sm text-slate-500">
            Maks: {weather.temperature.max}° / Min: {weather.temperature.min}°
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-xl p-3">
              <Wind className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600">Rüzgar</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {weather.windSpeed}
          </div>
          <div className="text-sm text-slate-500">km/h</div>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-xl p-3">
              <Droplets className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600">Yağış</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {weather.precipitation}
          </div>
          <div className="text-sm text-slate-500">mm</div>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-xl p-3">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600">Nem</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {weather.humidity}%
          </div>
          <div className="text-sm text-slate-500">Bağıl nem</div>
        </div>
      </div>

      {/* Additional Weather Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 rounded-xl p-3">
              <Sun className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600">UV İndeksi</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {weather.uvIndex}
          </div>
          <div className="text-sm text-slate-500">
            {weather.uvIndex <= 2 ? 'Düşük' : 
             weather.uvIndex <= 5 ? 'Orta' :
             weather.uvIndex <= 7 ? 'Yüksek' :
             weather.uvIndex <= 10 ? 'Çok Yüksek' : 'Ekstrem'}
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 rounded-xl p-3">
              <i className="fas fa-sunset text-orange-600 text-xl"></i>
            </div>
            <span className="text-sm font-semibold text-slate-600">Gün Batımı</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {new Date(weather.sunset).toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          <div className="text-sm text-slate-500">
            Doğuş: {new Date(weather.sunrise).toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-100 rounded-xl p-3">
              <i className="fas fa-eye text-indigo-600 text-xl"></i>
            </div>
            <span className="text-sm font-semibold text-slate-600">Görüş</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {weather.visibility}
          </div>
          <div className="text-sm text-slate-500">km</div>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gray-100 rounded-xl p-3">
              <i className="fas fa-gauge text-gray-600 text-xl"></i>
            </div>
            <span className="text-sm font-semibold text-slate-600">Basınç</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {Math.round(weather.pressure)}
          </div>
          <div className="text-sm text-slate-500">hPa</div>
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
  );
};

export default WeatherResults;