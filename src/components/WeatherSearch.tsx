'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Cloud, Clock } from 'lucide-react';
import { WeatherSearchProps } from '@/types/weather';
import { useLanguage } from '@/contexts/LanguageContext';

const WeatherSearch: React.FC<WeatherSearchProps> = ({ onSearch }) => {
  const { t } = useLanguage();
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (country && city && date) {
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
      
      // Add time to date if provided
      let fullDate = formattedDate;
      if (time) {
        fullDate = `${formattedDate}T${time}`;
      }
      
      onSearch(fullLocation, fullDate);
    }
  };

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 flex justify-center">
      <div className="clean-card p-4 md:p-8 animate-scaleIn w-full">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full mb-3 md:mb-4 animate-glow">
            <Cloud className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
            {t('weather_search')}
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            {t('detailed_weather_info')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="09/15/2025 or 2025-09-15"
                className="clean-input w-full px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <Clock size={16} />
                {t('time_range')}
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="16:00-17:00 or 14:30-16:30"
                className="clean-input w-full px-4 py-3"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('format')}: {t('start_end_format')}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!country || !city || !date}
            className="clean-button w-full py-4 px-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={20} />
            {t('get_weather_info')}
          </button>
        </form>

        {/* Quick Examples */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-700 mb-4 flex items-center gap-2 font-medium">
            <Cloud size={14} />
            {t('quick_examples')}
          </p>
          <div className="flex flex-wrap gap-2 quick-examples">
            {[
              { country: 'Türkiye', city: 'İstanbul', district: 'Maltepe' },
              { country: 'Türkiye', city: 'Ankara', district: 'Çankaya' },
              { country: 'Türkiye', city: 'İzmir', district: 'Konak' },
              { country: 'Türkiye', city: 'Antalya', district: 'Muratpaşa' },
              { country: 'Türkiye', city: 'Bursa', district: 'Osmangazi' }
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  setCountry(example.country);
                  setCity(example.city);
                  setDistrict(example.district);
                }}
                className="px-4 py-2 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 border border-gray-200 hover:border-blue-300 transition-all duration-300 animate-float"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {example.city}-{example.district}, {example.country}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherSearch;
