'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Activity, Search, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface EventWeatherSearchProps {
  onSearch: (eventData: EventData) => void;
}

export interface EventData {
  eventType: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
}


export default function EventWeatherSearch({ onSearch }: EventWeatherSearchProps) {
  const { t } = useLanguage();
  const [eventType, setEventType] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventType || !date || !time || !country || !city) {
      alert(t('fill_all_fields') || 'Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    
    try {
      // Create location string from country, city and district
      let fullLocation = `${city}, ${country}`;
      if (district) {
        fullLocation = `${district}, ${city}, ${country}`;
      }
      
      // Convert date format if needed (DD.MM.YYYY to YYYY-MM-DD)
      let formattedDate = date;
      if (date.includes('.')) {
        const parts = date.split('.');
        if (parts.length === 3) {
          formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      
      // Try multiple geocoding approaches
      let response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(fullLocation)}&count=1&language=tr&format=json`);
      let data = await response.json();
      
      // If no results with Turkish, try English
      if (!data.results || data.results.length === 0) {
        response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(fullLocation)}&count=1&language=en&format=json`);
        data = await response.json();
      }
      
      // If still no results, try without language parameter
      if (!data.results || data.results.length === 0) {
        response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(fullLocation)}&count=1&format=json`);
        data = await response.json();
      }
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        onSearch({
          eventType: eventType,
          date: formattedDate,
          time,
          location: fullLocation,
          latitude: result.latitude,
          longitude: result.longitude
        });
      } else {
        // Fallback to city only if full location not found
        let cityResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(`${city}, ${country}`)}&count=1&language=tr&format=json`);
        let cityData = await cityResponse.json();
        
        // Try English if Turkish fails
        if (!cityData.results || cityData.results.length === 0) {
          cityResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(`${city}, ${country}`)}&count=1&language=en&format=json`);
          cityData = await cityResponse.json();
        }
        
        // Try without language if still no results
        if (!cityData.results || cityData.results.length === 0) {
          cityResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(`${city}, ${country}`)}&count=1&format=json`);
          cityData = await cityResponse.json();
        }
        
        if (cityData.results && cityData.results.length > 0) {
          const cityResult = cityData.results[0];
          onSearch({
            eventType: eventType,
            date: formattedDate,
            time,
            location: `${city}, ${country}`,
            latitude: cityResult.latitude,
            longitude: cityResult.longitude
          });
        } else {
          // Try with just city name
          const cityOnlyResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&format=json`);
          const cityOnlyData = await cityOnlyResponse.json();
          
          if (cityOnlyData.results && cityOnlyData.results.length > 0) {
            const cityOnlyResult = cityOnlyData.results[0];
            onSearch({
              eventType: eventType,
              date: formattedDate,
              time,
              location: city,
              latitude: cityOnlyResult.latitude,
              longitude: cityOnlyResult.longitude
            });
          } else {
            // Show suggestions for common cities
            const suggestions = [
              'İstanbul, Türkiye',
              'Ankara, Türkiye', 
              'İzmir, Türkiye',
              'New York, USA',
              'London, UK',
              'Berlin, Germany',
              'Paris, France',
              'Tokyo, Japan'
            ];
            
            const suggestionText = suggestions.join('\n• ');
            alert(`${t('location_not_found_detailed') || 'Konum bulunamadı. Lütfen şehir adını doğru yazdığınızdan emin olun ve farklı bir konum deneyin.'}\n\n💡 Önerilen konumlar:\n• ${suggestionText}`);
          }
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert(t('geocoding_error') || 'Konum arama hatası. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 flex justify-center">
      <div className="clean-card p-4 md:p-8 animate-scaleIn w-full">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full mb-3 md:mb-4 animate-glow">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
            {t('plan_your_event')}
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            {t('ai_weather_recommendations')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              <Activity size={16} />
              {t('what_are_you_planning')}
            </label>
            <input
              type="text"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder={t('event_placeholder')}
              className="clean-input w-full px-4 py-3"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <Calendar size={16} />
                {t('date')}
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="15.09.2025 veya 2025-09-15"
                className="clean-input w-full px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <Clock size={16} />
                {t('time_range_required')}
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="16:00-17:00 or 14:30-16:30"
                className="clean-input w-full px-4 py-3"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('format')}: {t('start_end_format_detailed')}
              </p>
            </div>
          </div>

          {/* Location Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              <MapPin size={16} />
              {t('location_info')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {/* Country */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  {t('country')} *
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Turkey, USA, Germany..."
                  className="clean-input w-full px-4 py-3"
                  required
                />
              </div>
              
              {/* City */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  {t('city')} *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Istanbul, New York, Berlin..."
                  className="clean-input w-full px-4 py-3"
                  required
                />
              </div>
              
              {/* District */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  {t('district')}
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Maltepe, Manhattan, Mitte..."
                  className="clean-input w-full px-4 py-3"
                />
              </div>
            </div>
            {country && city && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">{t('selected_location')}:</span> {district ? `${district}, ${city}, ${country}` : `${city}, ${country}`}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="clean-button w-full py-4 px-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {t('analyzing')}
              </>
            ) : (
              <>
                <Search size={20} />
                {t('get_weather_analysis')}
              </>
            )}
          </button>
        </form>

        {/* Quick Examples */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-700 mb-4 flex items-center gap-2 font-medium">
            <Sparkles size={14} />
            {t('quick_examples')}
          </p>
          <div className="flex flex-wrap gap-2 quick-examples">
            {[
              { event: 'Doğa Yürüyüşü', time: '08:00-10:00', country: 'Türkiye', city: 'İstanbul', district: 'Maltepe' },
              { event: 'İş Toplantısı', time: '14:00-15:30', country: 'Türkiye', city: 'Ankara', district: 'Çankaya' },
              { event: 'Açık Hava Konseri', time: '20:00-23:00', country: 'Türkiye', city: 'İzmir', district: 'Konak' },
              { event: 'Düğün', time: '16:00-18:00', country: 'Türkiye', city: 'Bursa', district: 'Osmangazi' },
              { event: 'Piknik', time: '12:00-15:00', country: 'Türkiye', city: 'Antalya', district: 'Muratpaşa' },
              { event: 'Fotoğraf Çekimi', time: '17:00-19:00', country: 'Türkiye', city: 'Trabzon', district: 'Ortahisar' }
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  setEventType(example.event);
                  setTime(example.time);
                  setCountry(example.country);
                  setCity(example.city);
                  setDistrict(example.district);
                  setDate(new Date().toISOString().split('T')[0]);
                }}
                className="px-4 py-2 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 border border-gray-200 hover:border-blue-300 transition-all duration-300 animate-float"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="hidden sm:inline">{example.event} - {example.time} - {example.city}, {example.country}</span>
                <span className="sm:hidden">{example.event}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
