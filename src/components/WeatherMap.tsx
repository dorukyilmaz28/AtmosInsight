'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { WeatherData } from '@/types/weather';

// Dynamic import for Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Dynamic import for Leaflet
let L: any = null;
if (typeof window !== 'undefined') {
  L = require('leaflet');
  require('leaflet/dist/leaflet.css');
}

// Fix for default markers in React Leaflet
if (L) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Custom weather icons
const createWeatherIcon = (weatherCode: number, size: number = 30) => {
  if (!L) return L.divIcon({ html: '🌤️', className: 'custom-div-icon', iconSize: [size, size] });

  let iconUrl = '';
  let iconColor = '#3b82f6';

  if (weatherCode === 0) {
    iconUrl = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="5" fill="#fbbf24"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `);
    iconColor = '#fbbf24';
  } else if (weatherCode <= 3) {
    iconUrl = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#9ca3af"/>
      </svg>
    `);
    iconColor = '#9ca3af';
  } else if (weatherCode <= 67) {
    iconUrl = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4a8 8 0 1 1-16 0 8 8 0 0 1 16 0zM8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="#3b82f6"/>
        <path d="M8 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `);
    iconColor = '#3b82f6';
  } else {
    iconUrl = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#8b5cf6"/>
      </svg>
    `);
    iconColor = '#8b5cf6';
  }

  return L.divIcon({
    html: `<div style="background-color: ${iconColor}; border-radius: 50%; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${iconUrl ? `<img src="${iconUrl}" width="${size-8}" height="${size-8}" />` : '🌤️'}</div>`,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

interface WeatherMapProps {
  locations: Array<{
    name: string;
    lat: number;
    lng: number;
    country: string;
  }>;
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

  const fetchWeatherForLocations = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        locations.map(async (location) => {
          try {
            const response = await fetch(
              `http://localhost:5000/api/weather?location=${encodeURIComponent(location.name)}&date=${selectedDate}`
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
  };

  useEffect(() => {
    fetchWeatherForLocations();
  }, [selectedDate]);

  const getWeatherDescription = (weatherCode: number) => {
    if (weatherCode === 0) return 'Açık';
    if (weatherCode <= 3) return 'Parçalı Bulutlu';
    if (weatherCode <= 48) return 'Bulutlu';
    if (weatherCode <= 67) return 'Yağmurlu';
    if (weatherCode <= 77) return 'Karlı';
    if (weatherCode <= 99) return 'Fırtınalı';
    return 'Bilinmeyen';
  };

  const getComfortColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Show loading state if Leaflet is not loaded
  if (typeof window === 'undefined' || !L) {
    return (
      <div className="w-full h-full">
        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Hava Durumu Haritası</h3>
            <div className="flex items-center space-x-4">
              <label htmlFor="map-date" className="text-sm font-medium text-gray-700">
                Tarih:
              </label>
              <input
                type="date"
                id="map-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={fetchWeatherForLocations}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Yükleniyor...' : 'Yenile'}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Harita yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Date Selector */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Hava Durumu Haritası</h3>
          <div className="flex items-center space-x-4">
            <label htmlFor="map-date" className="text-sm font-medium text-gray-700">
              Tarih:
            </label>
            <input
              type="date"
              id="map-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={fetchWeatherForLocations}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Yükleniyor...' : 'Yenile'}
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <MapContainer
          center={[39.9334, 32.8597]} // Turkey center
          zoom={4}
          style={{ height: '400px', width: '100%' }}
          className="rounded-lg shadow-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {weatherData.map((weather, index) => {
            const location = locations.find(loc => loc.name === weather.location.name);
            if (!location) return null;

            return (
              <Marker
                key={index}
                position={[location.lat, location.lng]}
                icon={createWeatherIcon(weather.weather.weatherCode)}
              >
                <Popup className="custom-popup" maxWidth={280}>
                  <div className="p-2">
                    <div className="text-center mb-2">
                      <h3 className="text-base md:text-lg font-bold text-gray-800">
                        {weather.location.name}, {weather.location.country}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600">
                        {new Date(weather.date).toLocaleDateString('tr-TR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Weather Info */}
                    <div className="grid grid-cols-2 gap-1 md:gap-2 mb-2 md:mb-3 text-xs md:text-sm">
                      <div className="text-center p-1 md:p-2 bg-red-50 rounded">
                        <div className="font-semibold text-red-600 text-xs">Max</div>
                        <div className="text-sm md:text-base">{Math.round(weather.weather.temperature.max)}°C</div>
                      </div>
                      <div className="text-center p-1 md:p-2 bg-blue-50 rounded">
                        <div className="font-semibold text-blue-600 text-xs">Min</div>
                        <div className="text-sm md:text-base">{Math.round(weather.weather.temperature.min)}°C</div>
                      </div>
                      <div className="text-center p-1 md:p-2 bg-blue-100 rounded">
                        <div className="font-semibold text-blue-700 text-xs">Yağış</div>
                        <div className="text-sm md:text-base">{weather.weather.precipitation.toFixed(1)}mm</div>
                      </div>
                      <div className="text-center p-1 md:p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-700 text-xs">Rüzgar</div>
                        <div className="text-sm md:text-base">{weather.weather.windSpeed.toFixed(1)} km/h</div>
                      </div>
                    </div>

                    {/* Comfort Index */}
                    <div className="mb-2 md:mb-3 p-1 md:p-2 bg-gray-50 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm font-medium text-gray-700">Konfor Değerlendirmesi:</span>
                        <span className={`font-bold text-xs md:text-sm ${getComfortColor(weather.comfortIndex.score)}`}>
                          {weather.comfortIndex.score}/100
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {weather.comfortIndex.level}
                      </div>
                    </div>

                    {/* AI Recommendation Preview */}
                    <div className="mb-2 md:mb-3">
                      <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-1">AI Önerisi:</h4>
                      <p className="text-xs text-gray-600 line-clamp-2 md:line-clamp-3">
                        {weather.aiRecommendation.substring(0, 100)}...
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => onLocationSelect?.(weather.location.name, weather.date)}
                      className="w-full px-2 md:px-3 py-1 md:py-2 bg-blue-600 text-white text-xs md:text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Detaylı Analiz
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default WeatherMap;
