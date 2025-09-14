'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Calendar, RefreshCw, Thermometer, Droplets, Wind, Eye, Zap } from 'lucide-react';
import { WeatherData } from '@/types/weather';

interface Location {
    name: string;
    lat: number;
    lng: number;
    country: string;
}

interface WeatherMapProps {
  locations: Location[];
  onLocationSelect?: (location: string, date: string) => void;
}

const WeatherMap: React.FC<WeatherMapProps> = ({ locations, onLocationSelect }) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);

  const fetchWeatherForLocations = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        locations.map(async (location) => {
          try {
            const response = await fetch(
              `/api/weather?location=${encodeURIComponent(location.name)}&date=${selectedDate}`
            );
            if (response.ok) {
              return await response.json();
            }
            return null;
          } catch (error) {
            console.error(`Error fetching weather for ${location.name}:`, error);
            return null;
          }
        })
      );
      
      setWeatherData(results.filter(Boolean));
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  }, [locations, selectedDate]);

  useEffect(() => {
    fetchWeatherForLocations();
  }, [fetchWeatherForLocations]);

  const getWeatherIcon = (weatherCode: number) => {
    if (weatherCode === 0) return '☀️'; // Clear sky
    if (weatherCode <= 3) return '⛅'; // Partly cloudy
    if (weatherCode <= 67) return '🌧️'; // Rain
    return '⛈️'; // Thunderstorm
  };

  const getComfortColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getComfortBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-400/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-400/30';
    if (score >= 40) return 'bg-orange-500/20 border-orange-400/30';
    return 'bg-red-500/20 border-red-400/30';
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return 'text-red-400';
    if (temp >= 20) return 'text-orange-400';
    if (temp >= 10) return 'text-yellow-400';
    return 'text-blue-400';
  };

    return (
    <div className="w-full space-y-6">
      {/* Header Controls */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Hava Durumu Haritası</h2>
              <p className="text-white/70">Dünya genelinde hava durumu analizi</p>
        </div>
      </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-white/70" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
            </div>
            <button
              onClick={fetchWeatherForLocations}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Yükleniyor...' : 'Yenile'}
            </button>
          </div>
        </div>
      </div>

      {/* Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Locations Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Konumlar ({weatherData.length})
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-white/70">Hava durumu verileri yükleniyor...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
            {weatherData.map((weather, index) => {
              const location = locations.find(loc => loc.name === weather.location.name);
              if (!location) return null;

              return (
                    <div
                  key={index}
                      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${
                        selectedLocation?.name === location.name
                          ? 'bg-cyan-500/20 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                      onClick={() => setSelectedLocation(location)}
                      onMouseEnter={() => setHoveredLocation(location)}
                      onMouseLeave={() => setHoveredLocation(null)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {location.name}
                          </h4>
                          <p className="text-sm text-white/60">{location.country}</p>
                        </div>
                        <div className="text-2xl">{getWeatherIcon(weather.weather.weatherCode)}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getTemperatureColor(weather.weather.temperature.max)}`}>
                            {Math.round(weather.weather.temperature.max)}°
                          </div>
                          <div className="text-xs text-white/60">Max</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getTemperatureColor(weather.weather.temperature.min)}`}>
                            {Math.round(weather.weather.temperature.min)}°
                          </div>
                          <div className="text-xs text-white/60">Min</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-white/70">
                          <Droplets className="w-3 h-3" />
                          {weather.weather.precipitation.toFixed(1)}mm
                        </div>
                        <div className="flex items-center gap-1 text-white/70">
                          <Wind className="w-3 h-3" />
                          {weather.weather.windSpeed.toFixed(0)}km/h
                        </div>
                      </div>

                      <div className={`mt-3 p-2 rounded-lg ${getComfortBgColor(weather.comfortIndex.score)}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/80">Konfor</span>
                          <span className={`text-xs font-semibold ${getComfortColor(weather.comfortIndex.score)}`}>
                            {weather.comfortIndex.score}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Location Details */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 sticky top-6">
            {selectedLocation ? (
              (() => {
                const weather = weatherData.find(w => w.location.name === selectedLocation.name);
                if (!weather) return null;

                return (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-1">{selectedLocation.name}</h3>
                      <p className="text-white/70 mb-4">{selectedLocation.country}</p>
                      <div className="text-4xl mb-2">{getWeatherIcon(weather.weather.weatherCode)}</div>
                      <div className="text-sm text-white/60">
                          {new Date(weather.date).toLocaleDateString('tr-TR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-4 mb-2">
                        <div className="text-3xl font-bold text-white">
                          {Math.round(weather.weather.temperature.max)}°
                        </div>
                        <div className="text-xl text-white/60">
                          {Math.round(weather.weather.temperature.min)}°
                        </div>
                      </div>
                      <div className="text-sm text-white/60">Maksimum / Minimum Sıcaklık</div>
                    </div>

                    {/* Weather Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-400" />
                          <span className="text-white/80">Yağış</span>
                        </div>
                        <span className="text-white font-semibold">
                          {weather.weather.precipitation.toFixed(1)} mm
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-cyan-400" />
                          <span className="text-white/80">Rüzgar</span>
                        </div>
                        <span className="text-white font-semibold">
                          {weather.weather.windSpeed.toFixed(1)} km/h
                        </span>
                        </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-purple-400" />
                          <span className="text-white/80">Görüş</span>
                        </div>
                        <span className="text-white font-semibold">
                          {weather.weather.visibility.toFixed(1)} km
                        </span>
                        </div>
                      </div>

                      {/* Comfort Index */}
                    <div className={`p-4 rounded-lg ${getComfortBgColor(weather.comfortIndex.score)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 font-medium">Konfor Değerlendirmesi</span>
                        <span className={`font-bold ${getComfortColor(weather.comfortIndex.score)}`}>
                            {weather.comfortIndex.score}/100
                          </span>
                        </div>
                      <div className="text-sm text-white/70 mb-3">
                          {weather.comfortIndex.level}
                        </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            weather.comfortIndex.score >= 80 ? 'bg-green-400' :
                            weather.comfortIndex.score >= 60 ? 'bg-yellow-400' :
                            weather.comfortIndex.score >= 40 ? 'bg-orange-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${weather.comfortIndex.score}%` }}
                        ></div>
                      </div>
                      </div>

                    {/* AI Recommendation */}
                    <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-medium">AI Önerisi</span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {weather.aiRecommendation}
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                      onClick={() => onLocationSelect?.(selectedLocation.name, weather.date)}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                      Detaylı Analiz Görüntüle
                      </button>
                    </div>
                );
              })()
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white/70 mb-2">Konum Seçin</h3>
                <p className="text-white/50 text-sm">
                  Sol taraftaki listeden bir konum seçerek detaylı hava durumu bilgilerini görüntüleyin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Gösterge</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-white/70 text-sm">Mükemmel (80-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-white/70 text-sm">İyi (60-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
            <span className="text-white/70 text-sm">Orta (40-59)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-white/70 text-sm">Kötü (0-39)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherMap;
