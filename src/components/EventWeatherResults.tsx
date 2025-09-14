'use client';

import { useState } from 'react';
import { MapPin, Activity, Thermometer, Wind, Droplets, Eye, AlertTriangle, CheckCircle, Clock as ClockIcon, Sun, Sunset, Gauge, Eye as EyeIcon } from 'lucide-react';
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
    const tempMin = weatherData.weather.temperature.min;
    const wind = weatherData.weather.windSpeed;
    const precipitation = weatherData.weather.precipitation;
    const humidity = weatherData.weather.humidity;
    const uvIndex = weatherData.weather.uvIndex;
    const visibility = weatherData.weather.visibility;
    const pressure = weatherData.weather.pressure;
    const windDirection = weatherData.weather.windDirection;

    let score = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];
    const timeRecommendations: string[] = [];
    const clothingRecommendations: string[] = [];
    const eventTips: string[] = [];
    const safetyWarnings: string[] = [];
    const generalAdvice: string[] = [];
    const detailedAnalysis: string[] = [];
    const equipmentRecommendations: string[] = [];
    const healthTips: string[] = [];

    // Detailed Temperature analysis
    const tempRange = temp - tempMin;
    const avgTemp = (temp + tempMin) / 2;
    
    if (temp < -10) {
      score -= 40;
      issues.push('Aşırı soğuk hava (-10°C altı)');
      recommendations.push('Donma riski var, dışarı çıkmayın');
      clothingRecommendations.push('Kalın kış montu, eldiven, bere ve bot giy');
      safetyWarnings.push('Donma riski çok yüksek! Açık hava etkinlikleri tehlikeli');
      healthTips.push('Hipotermi riski var, sıcak içecekler tüketin');
      detailedAnalysis.push(`Sıcaklık ${temp}°C - Donma riski var`);
    } else if (temp < 0) {
      score -= 30;
      issues.push('Çok soğuk hava (0°C altı)');
      recommendations.push('Çok sıcak giysiler giy');
      clothingRecommendations.push('Kalın mont, eldiven, bere ve sıcak bot giy');
      safetyWarnings.push('Donma riski yüksek, dikkatli olun');
      healthTips.push('Soğuk hava solunum yollarını etkileyebilir');
      detailedAnalysis.push(`Sıcaklık ${temp}°C - Çok soğuk koşullar`);
    } else if (temp < 5) {
      score -= 25;
      issues.push('Soğuk hava (0-5°C)');
      recommendations.push('Sıcak giysiler giy');
      clothingRecommendations.push('Kalın mont, eldiven ve bere giy');
      healthTips.push('Soğuk hava vücut direncini düşürebilir');
      detailedAnalysis.push(`Sıcaklık ${temp}°C - Soğuk koşullar`);
    } else if (temp < 15) {
      score -= 15;
      issues.push('Serin hava (5-15°C)');
      recommendations.push('Ceket getir');
      clothingRecommendations.push('Hafif mont veya kalın ceket giy');
      detailedAnalysis.push(`Sıcaklık ${temp}°C - Serin koşullar`);
    } else if (temp > 40) {
      score -= 35;
      issues.push('Aşırı sıcak hava (40°C üstü)');
      recommendations.push('Sıcak çarpması riski var, dışarı çıkmayın');
      clothingRecommendations.push('Çok hafif, beyaz renkli giysiler giy');
      safetyWarnings.push('Sıcak çarpması riski çok yüksek! Açık hava etkinlikleri tehlikeli');
      healthTips.push('Bol su için, gölgede kalın');
      detailedAnalysis.push(`Sıcaklık ${temp}°C - Aşırı sıcak koşullar`);
    } else if (temp > 35) {
      score -= 25;
      issues.push('Çok sıcak hava (35-40°C)');
      recommendations.push('Hafif giysiler giy, bol su iç');
      clothingRecommendations.push('Pamuklu ve nefes alabilen kumaşlar tercih et');
      safetyWarnings.push('Sıcak çarpması riski yüksek');
      healthTips.push('Her 15 dakikada bir su için');
      detailedAnalysis.push(`Sıcaklık ${temp}°C - Çok sıcak koşullar`);
    } else if (temp > 30) {
      score -= 10;
      issues.push('Sıcak hava (30-35°C)');
      recommendations.push('Güneş kremi ve şapka kullan');
      clothingRecommendations.push('Açık renkli ve hafif giysiler giy');
      healthTips.push('Güneş koruması kullanın');
      detailedAnalysis.push(`Sıcaklık ${temp}°C - Sıcak koşullar`);
    } else if (temp >= 20 && temp <= 25) {
      detailedAnalysis.push(`Sıcaklık ${temp}°C - Mükemmel koşullar`);
      recommendations.push('İdeal sıcaklık koşulları');
    } else {
      detailedAnalysis.push(`Sıcaklık ${temp}°C - Uygun koşullar`);
    }

    // Temperature range analysis
    if (tempRange > 20) {
      issues.push('Büyük sıcaklık farkı');
      clothingRecommendations.push('Katmanlı giyinin, kolayca çıkarılabilir giysiler tercih edin');
      detailedAnalysis.push(`Sıcaklık farkı ${tempRange.toFixed(1)}°C - Büyük değişim`);
    }

    // Detailed Wind analysis
    const windDirectionName = getWindDirection(windDirection);
    
    if (wind > 50) {
      score -= 30;
      issues.push('Fırtına rüzgarı (50+ km/h)');
      recommendations.push('Açık hava etkinlikleri tehlikeli');
      clothingRecommendations.push('Rüzgar geçirmeyen, ağır giysiler giy');
      safetyWarnings.push('Fırtına rüzgarı! Açık hava etkinlikleri yasak');
      equipmentRecommendations.push('Rüzgar korumalı ekipman kullanın');
      detailedAnalysis.push(`Rüzgar ${wind} km/h - Fırtına koşulları`);
    } else if (wind > 40) {
      score -= 25;
      issues.push('Çok güçlü rüzgar (40-50 km/h)');
      recommendations.push('Açık hava etkinlikleri riskli');
      clothingRecommendations.push('Rüzgar geçirmeyen giysiler tercih et');
      safetyWarnings.push('Çok güçlü rüzgar! Dikkatli olun');
      equipmentRecommendations.push('Ağır ekipmanları sabitleyin');
      detailedAnalysis.push(`Rüzgar ${wind} km/h - Çok güçlü koşullar`);
    } else if (wind > 30) {
      score -= 20;
      issues.push('Güçlü rüzgar (30-40 km/h)');
      recommendations.push('Rüzgar korumalı giysiler giy');
      clothingRecommendations.push('Rüzgar geçirmeyen giysiler tercih et');
      timeRecommendations.push('Rüzgar güçlü, sabah 8-10 arası veya akşam 18:00 sonrası daha uygun');
      equipmentRecommendations.push('Hafif ekipmanları sabitleyin');
      detailedAnalysis.push(`Rüzgar ${wind} km/h - Güçlü koşullar`);
    } else if (wind > 20) {
      score -= 10;
      issues.push('Orta şiddette rüzgar (20-30 km/h)');
      recommendations.push('Dikkatli ol');
      timeRecommendations.push('Rüzgar orta şiddette, dikkatli olun');
      equipmentRecommendations.push('Hafif eşyaları sabitleyin');
      detailedAnalysis.push(`Rüzgar ${wind} km/h - Orta şiddet`);
    } else if (wind > 10) {
      detailedAnalysis.push(`Rüzgar ${wind} km/h - Hafif rüzgar`);
      recommendations.push('Hafif rüzgar, rahat koşullar');
    } else {
      detailedAnalysis.push(`Rüzgar ${wind} km/h - Sakin koşullar`);
      recommendations.push('Rüzgarsız, sakin koşullar');
    }

    // Wind direction analysis
    if (wind > 15) {
      if (windDirectionName.includes('Kuzey')) {
        timeRecommendations.push('Kuzey rüzgarı soğuk getirebilir, sıcak giyinin');
      } else if (windDirectionName.includes('Güney')) {
        timeRecommendations.push('Güney rüzgarı sıcak getirebilir, hafif giyinin');
      } else if (windDirectionName.includes('Doğu')) {
        timeRecommendations.push('Doğu rüzgarı genellikle kuru ve temiz hava getirir');
      } else if (windDirectionName.includes('Batı')) {
        timeRecommendations.push('Batı rüzgarı nemli hava getirebilir');
      }
    }

    // Detailed Precipitation analysis
    if (precipitation > 50) {
      score -= 40;
      issues.push('Aşırı yoğun yağış (50+ mm)');
      recommendations.push('Açık hava etkinlikleri tehlikeli');
      clothingRecommendations.push('Su geçirmez mont, pantolon ve bot giy');
      safetyWarnings.push('Sel riski! Açık hava etkinlikleri yasak');
      equipmentRecommendations.push('Su geçirmez ekipman kullanın');
      detailedAnalysis.push(`Yağış ${precipitation}mm - Aşırı yoğun`);
    } else if (precipitation > 25) {
      score -= 30;
      issues.push('Çok yoğun yağış (25-50 mm)');
      recommendations.push('Açık hava etkinlikleri riskli');
      clothingRecommendations.push('Tam su geçirmez kıyafet giy');
      safetyWarnings.push('Çok yoğun yağış! Dikkatli olun');
      equipmentRecommendations.push('Su geçirmez koruma kullanın');
      detailedAnalysis.push(`Yağış ${precipitation}mm - Çok yoğun`);
    } else if (precipitation > 10) {
      score -= 25;
      issues.push('Yoğun yağış (10-25 mm)');
      recommendations.push('Yağmurluk getir');
      clothingRecommendations.push('Su geçirmez ayakkabı ve yağmurluk giy');
      safetyWarnings.push('Yoğun yağış nedeniyle dikkatli olun');
      equipmentRecommendations.push('Su geçirmez çanta kullanın');
      detailedAnalysis.push(`Yağış ${precipitation}mm - Yoğun`);
    } else if (precipitation > 5) {
      score -= 15;
      issues.push('Orta şiddette yağış (5-10 mm)');
      recommendations.push('Şemsiye getir');
      clothingRecommendations.push('Su geçirmez ceket giy');
      equipmentRecommendations.push('Su geçirmez çanta düşünün');
      detailedAnalysis.push(`Yağış ${precipitation}mm - Orta şiddet`);
    } else if (precipitation > 1) {
      score -= 8;
      issues.push('Hafif yağış (1-5 mm)');
      recommendations.push('Hafif yağmurluk getir');
      clothingRecommendations.push('Su geçirmez ayakkabı giy');
      detailedAnalysis.push(`Yağış ${precipitation}mm - Hafif`);
    } else if (precipitation > 0) {
      detailedAnalysis.push(`Yağış ${precipitation}mm - Çok hafif`);
      recommendations.push('Minimal yağış, genel olarak kuru');
    } else {
      detailedAnalysis.push('Yağış yok - Kuru koşullar');
      recommendations.push('Kuru hava, ideal koşullar');
    }

    // Detailed Humidity analysis
    if (humidity > 90) {
      score -= 15;
      issues.push('Aşırı yüksek nem (90%+)');
      recommendations.push('Çok nemli hava, dikkatli olun');
      clothingRecommendations.push('Pamuklu ve nefes alabilen kumaşlar tercih et');
      healthTips.push('Yüksek nem solunum zorluğu yaratabilir');
      detailedAnalysis.push(`Nem %${humidity} - Aşırı yüksek`);
    } else if (humidity > 80) {
      score -= 10;
      issues.push('Yüksek nem (80-90%)');
      recommendations.push('Nefes alabilen kumaşlar giy');
      clothingRecommendations.push('Pamuklu ve nefes alabilen kumaşlar tercih et');
      timeRecommendations.push('Nem yüksek, öğle saatlerinde daha rahat olabilir');
      healthTips.push('Yüksek nem terlemeyi artırabilir');
      detailedAnalysis.push(`Nem %${humidity} - Yüksek`);
    } else if (humidity > 70) {
      score -= 5;
      issues.push('Orta-yüksek nem (70-80%)');
      recommendations.push('Rahat kumaşlar giy');
      clothingRecommendations.push('Nefes alabilen kumaşlar tercih et');
      detailedAnalysis.push(`Nem %${humidity} - Orta-yüksek`);
    } else if (humidity < 30) {
      score -= 5;
      issues.push('Düşük nem (30% altı)');
      recommendations.push('Cilt kuruluğu olabilir');
      clothingRecommendations.push('Cildi koruyan kumaşlar tercih et');
      healthTips.push('Düşük nem cilt kuruluğuna neden olabilir');
      detailedAnalysis.push(`Nem %${humidity} - Düşük`);
    } else if (humidity >= 40 && humidity <= 60) {
      detailedAnalysis.push(`Nem %${humidity} - İdeal seviye`);
      recommendations.push('İdeal nem seviyesi');
    } else {
      detailedAnalysis.push(`Nem %${humidity} - Normal seviye`);
      recommendations.push('Normal nem seviyesi');
    }

    // Detailed UV Index analysis
    if (uvIndex > 11) {
      score -= 20;
      issues.push('Aşırı yüksek UV indeksi (11+)');
      recommendations.push('Güneşten kaçının, dışarı çıkmayın');
      clothingRecommendations.push('Uzun kollu, güneş korumalı giysiler giy');
      safetyWarnings.push('Aşırı yüksek UV! Güneş yanığı riski çok yüksek');
      healthTips.push('Güneş yanığı riski çok yüksek, korunun');
      detailedAnalysis.push(`UV İndeksi ${uvIndex} - Aşırı yüksek`);
    } else if (uvIndex > 8) {
      score -= 15;
      issues.push('Çok yüksek UV indeksi (8-11)');
      recommendations.push('Güneş kremi ve şapka kullan');
      clothingRecommendations.push('Güneş gözlüğü ve şapka tak');
      safetyWarnings.push('Yüksek UV indeksi nedeniyle güneş koruması şart');
      healthTips.push('Güneş yanığı riski yüksek');
      detailedAnalysis.push(`UV İndeksi ${uvIndex} - Çok yüksek`);
    } else if (uvIndex > 6) {
      score -= 8;
      issues.push('Yüksek UV indeksi (6-8)');
      recommendations.push('Güneş koruması kullan');
      clothingRecommendations.push('Güneş gözlüğü tak');
      healthTips.push('Güneş yanığı riski orta');
      detailedAnalysis.push(`UV İndeksi ${uvIndex} - Yüksek`);
    } else if (uvIndex > 3) {
      score -= 3;
      issues.push('Orta UV indeksi (3-6)');
      recommendations.push('Hafif güneş koruması kullan');
      clothingRecommendations.push('Şapka takmayı düşünün');
      detailedAnalysis.push(`UV İndeksi ${uvIndex} - Orta`);
    } else if (uvIndex > 0) {
      detailedAnalysis.push(`UV İndeksi ${uvIndex} - Düşük`);
      recommendations.push('Düşük UV, güneş koruması gerekli değil');
    } else {
      detailedAnalysis.push('UV İndeksi 0 - Güneş yok');
      recommendations.push('Güneş yok, UV koruması gerekmiyor');
    }

    // Visibility analysis
    if (visibility < 1) {
      score -= 20;
      issues.push('Çok düşük görüş mesafesi (1km altı)');
      recommendations.push('Sisli hava, dikkatli olun');
      safetyWarnings.push('Çok düşük görüş! Açık hava etkinlikleri riskli');
      detailedAnalysis.push(`Görüş ${visibility}km - Çok düşük`);
    } else if (visibility < 5) {
      score -= 10;
      issues.push('Düşük görüş mesafesi (1-5km)');
      recommendations.push('Sisli hava, dikkatli olun');
      detailedAnalysis.push(`Görüş ${visibility}km - Düşük`);
    } else if (visibility < 10) {
      score -= 5;
      issues.push('Orta görüş mesafesi (5-10km)');
      recommendations.push('Hafif sis, dikkatli olun');
      detailedAnalysis.push(`Görüş ${visibility}km - Orta`);
    } else {
      detailedAnalysis.push(`Görüş ${visibility}km - İyi`);
      recommendations.push('İyi görüş mesafesi');
    }

    // Pressure analysis
    if (pressure < 1000) {
      score -= 5;
      issues.push('Düşük hava basıncı (1000 hPa altı)');
      recommendations.push('Hava basıncı düşük, fırtına olabilir');
      detailedAnalysis.push(`Basınç ${pressure}hPa - Düşük`);
    } else if (pressure > 1030) {
      score -= 3;
      issues.push('Yüksek hava basıncı (1030 hPa üstü)');
      recommendations.push('Hava basıncı yüksek, stabil hava');
      detailedAnalysis.push(`Basınç ${pressure}hPa - Yüksek`);
    } else {
      detailedAnalysis.push(`Basınç ${pressure}hPa - Normal`);
      recommendations.push('Normal hava basıncı');
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
      generalAdvice,
      detailedAnalysis,
      equipmentRecommendations,
      healthTips
    };
  };

  const suitability = getEventSuitability();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Event Info Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-500/90 to-indigo-500/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{eventData.eventType}</h2>
              <p className="text-white/80 text-lg">Etkinlik Analizi</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/70 mb-1">Tarih & Saat</div>
            <div className="font-semibold text-white text-lg">{new Date(eventData.date).toLocaleDateString('tr-TR')}</div>
            <div className="text-sm text-white/80">{eventData.time}</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white/80">
            <MapPin className="w-5 h-5" />
            <span className="font-medium text-lg">{eventData.location}</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/70 mb-1">Uygunluk Skoru</div>
            <div className="text-4xl font-bold text-white">{suitability.score}/100</div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Card */}
      <div className="overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-sm p-6 text-white rounded-t-2xl">
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

        <div className="p-8 bg-white/5 backdrop-blur-sm">
          {/* Recommendation Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold backdrop-blur-sm ${
              suitability.color === 'red' ? 'bg-red-500/20 text-red-200 border border-red-400/30' :
              suitability.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30' :
              suitability.color === 'blue' ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30' :
              'bg-green-500/20 text-green-200 border border-green-400/30'
            }`}>
              {suitability.suitability} ({suitability.score}/100)
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70">Uygunluk</div>
              <div className="text-2xl font-bold text-white">{suitability.suitability}</div>
            </div>
          </div>
          
          {/* Summary Message */}
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-6 mb-8 border border-blue-400/30">
            <p className="text-white text-lg font-medium text-center">
              {suitability.friendlyMessage}
            </p>
          </div>

          {/* AI Details */}
          {weatherData.aiRecommendation && (
            <div className="bg-gray-500/20 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-400/30">
              <h4 className="font-bold text-white mb-3 text-lg">AI Detayları: {eventData.eventType} için Hava Durumu Analizi</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span className="font-medium text-white">Uygunluk: {suitability.suitability}</span>
                </div>
                <div className="text-white/90">
                  <span className="font-medium">Sıcaklık:</span> {weatherData.weather.temperature.max}°C (maks) / {weatherData.weather.temperature.min}°C (min)
                </div>
                <div className="text-white/90">
                  <span className="font-medium">Rüzgar:</span> {weatherData.weather.windSpeed} km/h
                </div>
                <div className="text-white/90">
                  <span className="font-medium">Nem:</span> %{weatherData.weather.humidity}
                </div>
                <div className="text-white/90">
                  <span className="font-medium">Yağış:</span> {weatherData.weather.precipitation}mm
                </div>
                <div className="text-white/90">
                  <span className="font-medium">UV İndeksi:</span> {weatherData.weather.uvIndex}
                </div>
                <div className="text-white/90">
                  <span className="font-medium">Konfor Skoru:</span> {suitability.score}/100 ({suitability.suitability})
                </div>
              </div>
            </div>
          )}

          {/* Time Recommendations */}
          {suitability.timeRecommendations.length > 0 && (
            <div className="mb-8">
              <h4 className="font-bold text-white mb-4 text-lg flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-blue-400" />
                Zaman Önerileri
              </h4>
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30">
                <ul className="space-y-2">
                  {suitability.timeRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start text-blue-200">
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
              <h4 className="font-bold text-white mb-4 text-lg flex items-center">
                <Sun className="w-5 h-5 mr-2 text-orange-400" />
                Giyim Önerileri
              </h4>
              <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-orange-400/30">
                <ul className="space-y-2">
                  {suitability.clothingRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start text-orange-200">
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
              <h4 className="font-bold text-white mb-4 text-lg flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                Etkinlik İpuçları
              </h4>
              <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
                <ul className="space-y-2">
                  {suitability.eventTips.map((tip, index) => (
                    <li key={index} className="flex items-start text-green-200">
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
              <h4 className="font-bold text-white mb-4 text-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                Güvenlik Uyarıları
              </h4>
              <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-400/30">
                <ul className="space-y-2">
                  {suitability.safetyWarnings.map((warning, index) => (
                    <li key={index} className="flex items-start text-red-200">
                      <AlertTriangle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Detailed Analysis */}
          {suitability.detailedAnalysis.length > 0 && (
            <div className="mb-8">
              <h4 className="font-bold text-white mb-4 text-lg flex items-center">
                <Eye className="w-5 h-5 mr-2 text-indigo-400" />
                Detaylı Hava Durumu Analizi
              </h4>
              <div className="bg-indigo-500/20 backdrop-blur-sm rounded-xl p-4 border border-indigo-400/30">
                <ul className="space-y-2">
                  {suitability.detailedAnalysis.map((analysis, index) => (
                    <li key={index} className="flex items-start text-indigo-200">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{analysis}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Equipment Recommendations */}
          {suitability.equipmentRecommendations.length > 0 && (
            <div className="mb-8">
              <h4 className="font-bold text-white mb-4 text-lg flex items-center">
                <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                Ekipman Önerileri
              </h4>
              <div className="bg-cyan-500/20 backdrop-blur-sm rounded-xl p-4 border border-cyan-400/30">
                <ul className="space-y-2">
                  {suitability.equipmentRecommendations.map((equipment, index) => (
                    <li key={index} className="flex items-start text-cyan-200">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{equipment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Health Tips */}
          {suitability.healthTips.length > 0 && (
            <div className="mb-8">
              <h4 className="font-bold text-white mb-4 text-lg flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" />
                Sağlık İpuçları
              </h4>
              <div className="bg-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-emerald-400/30">
                <ul className="space-y-2">
                  {suitability.healthTips.map((tip, index) => (
                    <li key={index} className="flex items-start text-emerald-200">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* General Advice */}
          <div className="mb-8">
            <h4 className="font-bold text-white mb-4 text-lg flex items-center">
              <Gauge className="w-5 h-5 mr-2 text-purple-400" />
              Genel Tavsiyeler
            </h4>
            <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30">
              <ul className="space-y-2">
                {suitability.generalAdvice.map((advice, index) => (
                  <li key={index} className="flex items-start text-purple-200">
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
              <h4 className="font-bold text-white mb-4 text-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                Dikkat Edilmesi Gerekenler
              </h4>
              <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-400/30">
                <ul className="space-y-2">
                  {suitability.issues.map((issue, index) => (
                    <li key={index} className="flex items-start text-red-200">
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
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="text-3xl mr-3">{getWeatherIcon(weatherData.weather.weatherCode)}</span>
          Hava Durumu Koşulları
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl text-center p-6 border border-blue-400/30">
            <Thermometer className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {weatherData.weather.temperature.max}°
            </div>
            <div className="text-sm text-white/80 font-medium">Maksimum Sıcaklık</div>
            <div className="text-xs text-white/70 mt-1">
              Min: {weatherData.weather.temperature.min}°C
            </div>
          </div>

          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl text-center p-6 border border-green-400/30">
            <Wind className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {weatherData.weather.windSpeed}
            </div>
            <div className="text-sm text-white/80 font-medium">Rüzgar Hızı</div>
            <div className="text-xs text-white/70 mt-1">
              {getWindDirection(weatherData.weather.windDirection)} yönünde
            </div>
          </div>

          <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl text-center p-6 border border-blue-400/30">
            <Droplets className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {weatherData.weather.precipitation}
            </div>
            <div className="text-sm text-white/80 font-medium">Yağış Miktarı</div>
          </div>

          <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl text-center p-6 border border-purple-400/30">
            <Eye className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {weatherData.weather.humidity}%
            </div>
            <div className="text-sm text-white/80 font-medium">Nem Oranı</div>
          </div>
        </div>

        {/* Additional Weather Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl text-center p-6 border border-yellow-400/30">
            <Sun className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {weatherData.weather.uvIndex}
            </div>
            <div className="text-sm text-white/80 font-medium">UV İndeksi</div>
            <div className="text-xs text-white/70 mt-1">
              {weatherData.weather.uvIndex <= 2 ? 'Düşük' : 
               weatherData.weather.uvIndex <= 5 ? 'Orta' :
               weatherData.weather.uvIndex <= 7 ? 'Yüksek' :
               weatherData.weather.uvIndex <= 10 ? 'Çok Yüksek' : 'Aşırı'}
            </div>
          </div>

          <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl text-center p-6 border border-orange-400/30">
            <Sunset className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {new Date(weatherData.weather.sunset).toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="text-sm text-white/80 font-medium">Gün Batımı</div>
            <div className="text-xs text-white/70 mt-1">
              Gün Doğumu: {new Date(weatherData.weather.sunrise).toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>

          <div className="bg-indigo-500/20 backdrop-blur-sm rounded-xl text-center p-6 border border-indigo-400/30">
            <EyeIcon className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {weatherData.weather.visibility > 100 ? (weatherData.weather.visibility / 1000).toFixed(1) : weatherData.weather.visibility}
            </div>
            <div className="text-sm text-white/80 font-medium">km Görüş Mesafesi</div>
          </div>

          <div className="bg-gray-500/20 backdrop-blur-sm rounded-xl text-center p-6 border border-gray-400/30">
            <Gauge className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {Math.round(weatherData.weather.pressure)}
            </div>
            <div className="text-sm text-white/80 font-medium">Hava Basıncı</div>
          </div>
        </div>

        {/* NASA Data Section */}
        {weatherData.nasaData && (
          <div className="mt-8 pt-8 border-t border-white/20">
            <h4 className="font-bold text-white mb-4 text-lg flex items-center">
              <span className="text-2xl mr-3">🚀</span>
              NASA POWER Verileri
            </h4>
            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-400/30">
              <div className="mb-4">
                <p className="text-sm text-white/90 mb-4">
                  Bu analiz NASA POWER (Prediction of Worldwide Energy Resources) veritabanından gelen 
                  güneş radyasyonu ve atmosferik veriler kullanılarak oluşturulmuştur.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weatherData.nasaData.solarRadiation && weatherData.nasaData.solarRadiation > 0 && (
                  <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl text-center p-4 border border-blue-400/30">
                    <div className="text-2xl font-bold text-blue-300 mb-1">
                      {weatherData.nasaData.solarRadiation.toFixed(1)}
                    </div>
                    <div className="text-sm text-white/80">MJ/m² Güneş Radyasyonu</div>
                  </div>
                )}
                {weatherData.nasaData.temperature && weatherData.nasaData.temperature.max && weatherData.nasaData.temperature.max > -50 && (
                  <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl text-center p-4 border border-blue-400/30">
                    <div className="text-2xl font-bold text-blue-300 mb-1">
                      {weatherData.nasaData.temperature.max.toFixed(1)}°
                    </div>
                    <div className="text-sm text-white/80">NASA Max Sıcaklık</div>
                  </div>
                )}
                {weatherData.nasaData.humidity && weatherData.nasaData.humidity > 0 && (
                  <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl text-center p-4 border border-blue-400/30">
                    <div className="text-2xl font-bold text-blue-300 mb-1">
                      {weatherData.nasaData.humidity.toFixed(1)}%
                    </div>
                    <div className="text-sm text-white/80">NASA Nem Oranı</div>
                  </div>
                )}
              </div>
              
              {/* Show message if no NASA data available */}
              {(!weatherData.nasaData.solarRadiation || 
                !weatherData.nasaData.temperature?.max || 
                !weatherData.nasaData.humidity) && (
                <div className="text-center p-6 bg-yellow-500/20 backdrop-blur-sm rounded-lg border border-yellow-400/30">
                  <div className="text-yellow-400 mb-2">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-yellow-200 font-medium">NASA verileri şu anda mevcut değil</p>
                  <p className="text-sm text-yellow-300 mt-1">
                    Hava durumu analizi Open-Meteo API verileri ile yapılmaktadır
                  </p>
                </div>
              )}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30">
                  <span className="text-sm font-medium text-blue-200">
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