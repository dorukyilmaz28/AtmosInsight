'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Calendar, Activity, Thermometer, Wind, Droplets, Eye } from 'lucide-react';
import { WeatherData } from '@/types/weather';

// Dynamic import for Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// useMap is a hook, not a component, so we don't need dynamic import

// Dynamic import for Leaflet
let L: typeof import('leaflet') | null = null;
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  L = require('leaflet');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('leaflet/dist/leaflet.css');
}

// Fix for default markers in React Leaflet
if (L) {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}


interface EventMapProps {
  latitude: number;
  longitude: number;
  location: string;
  eventType: string;
  weatherData: WeatherData;
}

const EventMap: React.FC<EventMapProps> = ({ 
  latitude, 
  longitude, 
  location, 
  eventType, 
  weatherData 
}) => {

  // Create custom event icon
  const createEventIcon = () => {
    if (!L) return undefined;

    const getEventIcon = (eventType: string) => {
      switch (eventType.toLowerCase()) {
        case 'düğün':
        case 'wedding':
          return '💒';
        case 'piknik':
        case 'picnic':
          return '🧺';
        case 'doğa yürüyüşü':
        case 'hiking':
          return '🥾';
        case 'açık hava konseri':
        case 'outdoor concert':
          return '🎵';
        case 'iş toplantısı':
        case 'business meeting':
          return '💼';
        case 'fotoğraf çekimi':
        case 'photography':
          return '📸';
        case 'spor':
        case 'sports':
          return '⚽';
        default:
          return '🎯';
      }
    };

    return L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          border: 3px solid white;
        ">
          <span style="font-size: 24px;">${getEventIcon(eventType)}</span>
        </div>
      `,
      className: 'custom-event-icon',
      iconSize: [50, 50],
      iconAnchor: [25, 25],
    });
  };

  // Create weather icon
  const createWeatherIcon = () => {
    if (!L) return undefined;

    const getWeatherIcon = (weatherCode: number) => {
      if (weatherCode === 0) return '☀️';
      if (weatherCode <= 3) return '⛅';
      if (weatherCode <= 48) return '☁️';
      if (weatherCode <= 67) return '🌧️';
      if (weatherCode <= 77) return '❄️';
      if (weatherCode <= 99) return '⛈️';
      return '🌤️';
    };

    return L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          border: 2px solid white;
        ">
          <span style="font-size: 20px;">${getWeatherIcon(weatherData.weather.weatherCode)}</span>
        </div>
      `,
      className: 'custom-weather-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  // Show loading state only if we're on server side
  if (typeof window === 'undefined') {
    return (
      <div className="clean-card p-8">
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
    <div className="clean-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-xl p-3">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Etkinlik Konumu</h3>
            <p className="text-indigo-100">{eventType} - {location}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Event Info */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Etkinlik</span>
            </div>
            <p className="text-blue-700">{eventType}</p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Tarih</span>
            </div>
            <p className="text-green-700">
              {new Date(weatherData.date).toLocaleDateString('tr-TR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-800">Konum</span>
            </div>
            <p className="text-purple-700">{location}</p>
          </div>
        </div>

        {/* Map */}
        <div className="relative">
          <MapContainer
              center={[latitude, longitude]}
              zoom={13}
              style={{ height: '400px', width: '100%' }}
              className="rounded-lg shadow-lg"
            >
              <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Event Marker */}
            <Marker
              position={[latitude, longitude]}
              icon={createEventIcon()}
            >
              <Popup maxWidth={300}>
                <div className="p-3">
                  <div className="text-center mb-3">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {eventType}
                    </h3>
                    <p className="text-sm text-gray-600">{location}</p>
                  </div>

                  {/* Weather Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Hava Durumu</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <Thermometer className="w-3 h-3 text-red-500" />
                        <span className="text-gray-700">
                          {weatherData.weather.temperature.max}°C
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Wind className="w-3 h-3 text-green-500" />
                        <span className="text-gray-700">
                          {weatherData.weather.windSpeed} km/h
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Droplets className="w-3 h-3 text-blue-500" />
                        <span className="text-gray-700">
                          {weatherData.weather.precipitation}mm
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-purple-500" />
                        <span className="text-gray-700">
                          %{weatherData.weather.humidity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comfort Index */}
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Konfor Skoru</div>
                    <div className="text-lg font-bold text-gray-800">
                      {weatherData.comfortIndex.score}/100
                    </div>
                    <div className="text-xs text-gray-600">
                      {weatherData.comfortIndex.level}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Weather Marker (slightly offset) */}
            <Marker
              position={[latitude + 0.001, longitude + 0.001]}
              icon={createWeatherIcon()}
            >
              <Popup maxWidth={250}>
                <div className="p-2">
                  <div className="text-center mb-2">
                    <h3 className="text-sm font-bold text-gray-800">Hava Durumu</h3>
                    <p className="text-xs text-gray-600">{location}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                      {weatherData.weather.temperature.max}°C
                    </div>
                    <div className="text-xs text-gray-600">
                      Hava Durumu
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
            </MapContainer>
        </div>

        {/* Coordinates Info */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
            <span className="text-sm text-gray-600">
              📍 Koordinatlar: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventMap;