'use client';

import { useState } from 'react';
import { MapPin, Calendar, Clock, Activity, Thermometer, Wind, Droplets, Eye, AlertTriangle, CheckCircle, Clock as ClockIcon, Sun, Sunset, Gauge, Eye as EyeIcon } from 'lucide-react';
import { EventData } from './EventWeatherSearch';
import { WeatherData } from '@/types/weather';
import EventMap from './EventMap';

interface EventWeatherResultsProps {
  eventData: EventData;
  weatherData: WeatherData;
}

// Rüzgar yönü hesaplama fonksiyonu
function getWindDirection(degrees: number): string {
  const directions = [
    'Kuzey', 'Kuzey-Kuzeydoğu', 'Kuzeydoğu', 'Doğu-Kuzeydoğu', 
    'Doğu', 'Doğu-Güneydoğu', 'Güneydoğu', 'Güney-Güneydoğu', 
    'Güney', 'Güney-Güneybatı', 'Güneybatı', 'Batı-Güneybatı', 
    'Batı', 'Batı-Kuzeybatı', 'Kuzeybatı', 'Kuzey-Kuzeybatı'
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export default function EventWeatherResults({ eventData, weatherData }: EventWeatherResultsProps) {
  const [showMap, setShowMap] = useState(false);

  const getWeatherIcon = (weatherCode: number) => {
    if (weatherCode >= 0 && weatherCode <= 3) return '☀️';
    if (weatherCode >= 45 && weatherCode <= 48) return '🌫️';
    if (weatherCode >= 51 && weatherCode <= 67) return '🌧️';
    if (weatherCode >= 71 && weatherCode <= 77) return '❄️';
    if (weatherCode >= 80 && weatherCode <= 82) return '🌦️';
    if (weatherCode >= 85 && weatherCode <= 86) return '🌨️';
    if (weatherCode >= 95 && weatherCode <= 99) return '⛈️';
    return '☀️';
  };

  const getEventSuitability = () => {
    const temp = weatherData.weather.temperature.max;
    const wind = weatherData.weather.windSpeed;
    const precipitation = weatherData.weather.precipitation;
    const humidity = weatherData.weather.humidity;
    const uvIndex = weatherData.weather.uvIndex;

    let score = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];
    const timeRecommendations: string[] = [];
    const clothingRecommendations: string[] = [];
    const eventTips: string[] = [];
    const safetyWarnings: string[] = [];
    const generalAdvice: string[] = [];

    // Temperature analysis
    if (temp < 5) {
      score -= 30;
      issues.push('Çok soğuk hava');
      recommendations.push('Sıcak giysiler giy');
      clothingRecommendations.push('Kalın mont ve eldiven giy');
    } else if (temp < 15) {
      score -= 15;
      issues.push('Soğuk hava');
      recommendations.push('Ceket getir');
      clothingRecommendations.push('Hafif mont veya ceket giy');
    } else if (temp > 35) {
      score -= 25;
      issues.push('Çok sıcak hava');
      recommendations.push('Hafif giysiler giy');
      clothingRecommendations.push('Pamuklu ve nefes alabilen kumaşlar tercih et');
    } else if (temp > 30) {
      score -= 10;
      issues.push('Sıcak hava');
      recommendations.push('Güneş kremi ve şapka kullan');
      clothingRecommendations.push('Açık renkli ve hafif giysiler giy');
    }

    // Wind analysis
    if (wind > 30) {
      score -= 20;
      issues.push('Güçlü rüzgar');
      recommendations.push('Rüzgar korumalı giysiler giy');
      clothingRecommendations.push('Rüzgar geçirmeyen giysiler tercih et');
      timeRecommendations.push('Rüzgar güçlü, sabah 8-10 arası veya akşam 18:00 sonrası daha uygun');
    } else if (wind > 20) {
      score -= 10;
      issues.push('Orta şiddette rüzgar');
      recommendations.push('Dikkatli ol');
      timeRecommendations.push('Rüzgar orta şiddette, dikkatli olun');
    }

    // Precipitation analysis
    if (precipitation > 10) {
      score -= 25;
      issues.push('Yoğun yağış');
      recommendations.push('Yağmurluk getir');
      clothingRecommendations.push('Su geçirmez ayakkabı ve yağmurluk giy');
      safetyWarnings.push('Yoğun yağış nedeniyle dikkatli olun');
    } else if (precipitation > 5) {
      score -= 15;
      issues.push('Hafif yağış');
      recommendations.push('Şemsiye getir');
      clothingRecommendations.push('Su geçirmez ceket giy');
    }

    // Humidity analysis
    if (humidity > 80) {
      score -= 10;
      issues.push('Yüksek nem');
      recommendations.push('Nefes alabilen kumaşlar giy');
      clothingRecommendations.push('Pamuklu ve nefes alabilen kumaşlar tercih et');
      timeRecommendations.push('Nem yüksek, öğle saatlerinde daha rahat olabilir');
    }

    // UV Index analysis
    if (uvIndex > 8) {
      score -= 15;
      issues.push('Çok yüksek UV indeksi');
      recommendations.push('Güneş kremi ve şapka kullan');
      clothingRecommendations.push('Güneş gözlüğü ve şapka tak');
      safetyWarnings.push('Yüksek UV indeksi nedeniyle güneş koruması şart');
    } else if (uvIndex > 6) {
      score -= 8;
      issues.push('Yüksek UV indeksi');
      recommendations.push('Güneş koruması kullan');
      clothingRecommendations.push('Güneş gözlüğü tak');
    }

    // Generate friendly message
    let friendlyMessage = '';
    if (score >= 90) {
      friendlyMessage = 'Mükemmel! Hava koşulları etkinliğiniz için ideal! 🌟';
    } else if (score >= 75) {
      friendlyMessage = 'Harika! Hava durumu çok uygun, sadece birkaç noktaya dikkat edin.';
    } else if (score >= 60) {
      friendlyMessage = 'İyi! Hava durumu genel olarak uygun, bazı önlemler alın.';
    } else if (score >= 40) {
      friendlyMessage = 'Dikkatli olun! Hava durumu zorlayıcı olabilir.';
    } else {
      friendlyMessage = 'Hava durumu etkinliğiniz için çok uygun değil. Alternatif planlar düşünün.';
    }

    let suitability = 'Mükemmel';
    let color = 'green';
    
    if (score < 20) {
      suitability = 'Uygun Değil';
      color = 'red';
    } else if (score < 40) {
      suitability = 'Zayıf';
      color = 'red';
    } else if (score < 60) {
      suitability = 'Orta';
      color = 'yellow';
    } else if (score < 80) {
      suitability = 'İyi';
      color = 'blue';
    }

    // Add general advice
    generalAdvice.push('Hava durumunu sürekli takip et');
    generalAdvice.push('Yedek plan hazırla');
    generalAdvice.push('Acil durum iletişim bilgilerini yanında bulundur');
    generalAdvice.push('Etkinlik sırasında dikkatli ol');

    // Add event tips
    eventTips.push('Genel güvenlik kurallarına uy');

    return { 
      score, 
      suitability, 
      color, 
      issues, 
      recommendations, 
      friendlyMessage,
      timeRecommendations,
      clothingRecommendations,
      eventTips,
      safetyWarnings,
      generalAdvice
    };
  };

  const suitability = getEventSuitability();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Event Info Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-8 border border-slate-200 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{eventData.eventType}</h2>
              <p className="text-gray-600 text-lg">Etkinlik Analizi</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Tarih & Saat</div>
            <div className="font-semibold text-gray-900 text-lg">{new Date(eventData.date).toLocaleDateString('tr-TR')}</div>
            <div className="text-sm text-gray-600">{eventData.time}</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <span className="font-medium text-lg">{eventData.location}</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Uygunluk Skoru</div>
            <div className="text-4xl font-bold text-gray-900">{suitability.score}/100</div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Card */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl shadow-xl border border-slate-200 overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-xl p-3">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">AI Önerisi</h3>
              <p className="text-purple-100">Akıllı hava durumu analizi ve etkinlik önerileri</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Recommendation Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold ${
              suitability.color === 'red' ? 'bg-red-100 text-red-800' :
              suitability.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              suitability.color === 'blue' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {suitability.suitability} ({suitability.score}/100)
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Uygunluk</div>
              <div className="text-2xl font-bold text-gray-900">{suitability.suitability}</div>
            </div>
          </div>
          
          {/* Summary Message */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
            <p className="text-gray-800 text-lg font-medium text-center">
              {suitability.friendlyMessage}
            </p>
          </div>

          {/* AI Details */}
          {weatherData.aiRecommendation && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3 text-lg">AI Detayları: {eventData.eventType} için Hava Durumu Analizi</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="font-medium text-gray-900">Uygunluk: {suitability.suitability}</span>
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">Sıcaklık:</span> {weatherData.weather.temperature.max}°C (maks) / {weatherData.weather.temperature.min}°C (min)
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">Rüzgar:</span> {weatherData.weather.windSpeed} km/h
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">Nem:</span> %{weatherData.weather.humidity}
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">Yağış:</span> {weatherData.weather.precipitation}mm
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">UV İndeksi:</span> {weatherData.weather.uvIndex}
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">Konfor Skoru:</span> {suitability.score}/100 ({suitability.suitability})
                </div>
              </div>
            </div>
          )}

          {/* Time Recommendations */}
          {suitability.timeRecommendations.length > 0 && (
            <div className="mb-8">
              <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-blue-500" />
                Zaman Önerileri
              </h4>
              <div className="bg-blue-50 rounded-xl p-4">
                <ul className="space-y-2">
                  {suitability.timeRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start text-blue-800">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Clothing Recommendations */}
          {suitability.clothingRecommendations.length > 0 && (
            <div className="mb-8">
              <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                <Sun className="w-5 h-5 mr-2 text-orange-500" />
                Giyim Önerileri
              </h4>
              <div className="bg-orange-50 rounded-xl p-4">
                <ul className="space-y-2">
                  {suitability.clothingRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start text-orange-800">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Event Tips */}
          {suitability.eventTips.length > 0 && (
            <div className="mb-8">
              <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-500" />
                Etkinlik İpuçları
              </h4>
              <div className="bg-green-50 rounded-xl p-4">
                <ul className="space-y-2">
                  {suitability.eventTips.map((tip, index) => (
                    <li key={index} className="flex items-start text-green-800">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Safety Warnings */}
          {suitability.safetyWarnings.length > 0 && (
            <div className="mb-8">
              <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Güvenlik Uyarıları
              </h4>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <ul className="space-y-2">
                  {suitability.safetyWarnings.map((warning, index) => (
                    <li key={index} className="flex items-start text-red-800">
                      <AlertTriangle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* General Advice */}
          <div className="mb-8">
            <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
              <Gauge className="w-5 h-5 mr-2 text-purple-500" />
              Genel Tavsiyeler
            </h4>
            <div className="bg-purple-50 rounded-xl p-4">
              <ul className="space-y-2">
                {suitability.generalAdvice.map((advice, index) => (
                  <li key={index} className="flex items-start text-purple-800">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span className="text-sm">{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Things to Watch Out For */}
          {suitability.issues.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Dikkat Edilmesi Gerekenler
              </h4>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <ul className="space-y-2">
                  {suitability.issues.map((issue, index) => (
                    <li key={index} className="flex items-start text-red-800">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weather Details */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-3xl mr-3">{getWeatherIcon(weatherData.weather.weatherCode)}</span>
          Hava Durumu Koşulları
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300 shadow-sm">
            <Thermometer className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {weatherData.weather.temperature.max}°
            </div>
            <div className="text-sm text-gray-600 font-medium">Maksimum Sıcaklık</div>
            <div className="text-xs text-gray-500 mt-1">
              Min: {weatherData.weather.temperature.min}°C
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300 shadow-sm">
            <Wind className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {weatherData.weather.windSpeed}
            </div>
            <div className="text-sm text-gray-600 font-medium">Rüzgar Hızı</div>
            <div className="text-xs text-gray-500 mt-1">
              {getWindDirection(weatherData.weather.windDirection)} yönünde
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300 shadow-sm">
            <Droplets className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {weatherData.weather.precipitation}
            </div>
            <div className="text-sm text-gray-600 font-medium">Yağış Miktarı</div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300 shadow-sm">
            <Eye className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {weatherData.weather.humidity}%
            </div>
            <div className="text-sm text-gray-600 font-medium">Nem Oranı</div>
          </div>
        </div>

        {/* Additional Weather Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          <div className="text-center p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300 shadow-sm">
            <Sun className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {weatherData.weather.uvIndex}
            </div>
            <div className="text-sm text-gray-600 font-medium">UV İndeksi</div>
            <div className="text-xs text-gray-500 mt-1">
              {weatherData.weather.uvIndex <= 2 ? 'Düşük' : 
               weatherData.weather.uvIndex <= 5 ? 'Orta' :
               weatherData.weather.uvIndex <= 7 ? 'Yüksek' :
               weatherData.weather.uvIndex <= 10 ? 'Çok Yüksek' : 'Aşırı'}
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300 shadow-sm">
            <Sunset className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {new Date(weatherData.weather.sunset).toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="text-sm text-gray-600 font-medium">Gün Batımı</div>
            <div className="text-xs text-gray-500 mt-1">
              Gün Doğumu: {new Date(weatherData.weather.sunrise).toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300 shadow-sm">
            <EyeIcon className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {weatherData.weather.visibility > 100 ? (weatherData.weather.visibility / 1000).toFixed(1) : weatherData.weather.visibility}
            </div>
            <div className="text-sm text-gray-600 font-medium">km Görüş Mesafesi</div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300 shadow-sm">
            <Gauge className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(weatherData.weather.pressure)}
            </div>
            <div className="text-sm text-gray-600 font-medium">Hava Basıncı</div>
          </div>
        </div>

        {/* NASA Data Section */}
        {weatherData.nasaData && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
              <span className="text-2xl mr-3">🚀</span>
              NASA POWER Verileri
            </h4>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Bu analiz NASA POWER (Prediction of Worldwide Energy Resources) veritabanından gelen 
                  güneş radyasyonu ve atmosferik veriler kullanılarak oluşturulmuştur.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weatherData.nasaData.solarRadiation && weatherData.nasaData.solarRadiation > 0 && (
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {weatherData.nasaData.solarRadiation.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">MJ/m² Güneş Radyasyonu</div>
                  </div>
                )}
                {weatherData.nasaData.temperature && weatherData.nasaData.temperature.max && weatherData.nasaData.temperature.max > -50 && (
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {weatherData.nasaData.temperature.max.toFixed(1)}°
                    </div>
                    <div className="text-sm text-gray-600">NASA Max Sıcaklık</div>
                  </div>
                )}
                {weatherData.nasaData.humidity && weatherData.nasaData.humidity > 0 && (
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {weatherData.nasaData.humidity.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">NASA Nem Oranı</div>
                  </div>
                )}
              </div>
              
              {/* Show message if no NASA data available */}
              {(!weatherData.nasaData.solarRadiation || 
                !weatherData.nasaData.temperature?.max || 
                !weatherData.nasaData.humidity) && (
                <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-yellow-600 mb-2">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-yellow-800 font-medium">NASA verileri şu anda mevcut değil</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Hava durumu analizi Open-Meteo API verileri ile yapılmaktadır
                  </p>
                </div>
              )}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
                  <span className="text-sm font-medium text-blue-700">
                    🌍 NASA POWER API ile güçlendirilmiştir
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comfort Index */}
        {weatherData.comfortIndex && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4 text-lg">Konfor İndeksi</h4>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 font-medium text-lg">{weatherData.comfortIndex.level}</span>
                <span className="text-gray-900 font-bold text-xl">{weatherData.comfortIndex.score}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    weatherData.comfortIndex.score >= 80 ? 'bg-green-500' :
                    weatherData.comfortIndex.score >= 60 ? 'bg-yellow-500' :
                    weatherData.comfortIndex.score >= 40 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${weatherData.comfortIndex.score}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowMap(!showMap)}
          className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-4 rounded-xl font-medium hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {showMap ? 'Haritayı Gizle' : 'Haritada Göster'}
        </button>
      </div>

      {/* Map Component */}
      {showMap && eventData.latitude && eventData.longitude && (
        <EventMap
          latitude={eventData.latitude}
          longitude={eventData.longitude}
          location={eventData.location}
          eventType={eventData.eventType}
          weatherData={weatherData}
        />
      )}
    </div>
  );
}