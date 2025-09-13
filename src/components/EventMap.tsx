'use client';

import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { WeatherData } from '@/types/weather';
import type L from 'leaflet';

interface EventMapProps {
  latitude: number;
  longitude: number;
  location: string;
  eventType: string;
  weatherData?: WeatherData;
}

export default function EventMap({ latitude, longitude, location, eventType, weatherData }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current) {
      // Clear existing map if it exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Dynamic import for Leaflet to avoid SSR issues
      import('leaflet').then((L) => {
        // Initialize map
        const map = L.map(mapRef.current!).setView([latitude, longitude], 13);
        mapInstanceRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add marker
        const marker = L.marker([latitude, longitude]).addTo(map);
        
        // Create weather info for popup
        const weatherInfo = weatherData ? `
          <div style="text-align: center; padding: 10px; min-width: 250px;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">${location}</h3>
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; font-weight: 500;">${eventType}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; padding: 8px; background: #f8fafc; border-radius: 8px;">
              <div style="text-align: center;">
                <div style="color: #3b82f6; font-size: 12px; margin-bottom: 2px;">🌡️ Sıcaklık</div>
                <div style="font-weight: bold; color: #1f2937;">${weatherData.weather.temperature.max}°C</div>
              </div>
              <div style="text-align: center;">
                <div style="color: #10b981; font-size: 12px; margin-bottom: 2px;">💨 Rüzgar</div>
                <div style="font-weight: bold; color: #1f2937;">${weatherData.weather.windSpeed} km/h</div>
              </div>
              <div style="text-align: center;">
                <div style="color: #06b6d4; font-size: 12px; margin-bottom: 2px;">💧 Nem</div>
                <div style="font-weight: bold; color: #1f2937;">%${weatherData.weather.humidity}</div>
              </div>
              <div style="text-align: center;">
                <div style="color: #8b5cf6; font-size: 12px; margin-bottom: 2px;">🌧️ Yağış</div>
                <div style="font-weight: bold; color: #1f2937;">${weatherData.weather.precipitation}mm</div>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; padding: 8px; background: #fef3c7; border-radius: 8px;">
              <div style="text-align: center;">
                <div style="color: #f59e0b; font-size: 12px; margin-bottom: 2px;">☀️ UV</div>
                <div style="font-weight: bold; color: #1f2937;">${weatherData.weather.uvIndex}</div>
              </div>
              <div style="text-align: center;">
                <div style="color: #f97316; font-size: 12px; margin-bottom: 2px;">🌅 Batış</div>
                <div style="font-weight: bold; color: #1f2937; font-size: 11px;">${new Date(weatherData.weather.sunset).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div style="text-align: center;">
                <div style="color: #6366f1; font-size: 12px; margin-bottom: 2px;">👁️ Görüş</div>
                <div style="font-weight: bold; color: #1f2937;">${weatherData.weather.visibility}km</div>
              </div>
              <div style="text-align: center;">
                <div style="color: #6b7280; font-size: 12px; margin-bottom: 2px;">📊 Basınç</div>
                <div style="font-weight: bold; color: #1f2937;">${Math.round(weatherData.weather.pressure)}hPa</div>
              </div>
            </div>
            
            <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 11px;">
              ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
            </p>
          </div>
        ` : `
          <div style="text-align: center; padding: 10px;">
            <h3 style="margin: 0 0 5px 0; color: #1f2937;">${location}</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${eventType}</p>
            <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">
              ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
            </p>
          </div>
        `;
        
        // Add popup
        marker.bindPopup(weatherInfo).openPopup();

        // Cleanup function
        return () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }
        };
      });
    }
  }, [latitude, longitude, location, eventType, weatherData]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <MapPin className="w-6 h-6 mr-2 text-green-600" />
        Konum Haritası
      </h3>
      <div 
        ref={mapRef} 
        className="h-96 w-full rounded-lg border border-gray-200"
        style={{ minHeight: '384px' }}
      />
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>📍 {location} - {eventType}</p>
        <p className="text-xs">Koordinatlar: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
      </div>
    </div>
  );
}
