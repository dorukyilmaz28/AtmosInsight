'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LanguageContextType {
  language: 'tr' | 'en';
  setLanguage: (lang: 'tr' | 'en') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys
const translations = {
  tr: {
    // Header
    'weather_assistant': 'Hava Durumu Asistanı',
    'subtitle': 'AI destekli hava durumu analizi ve NASA verileri ile açık hava etkinliklerinizi planlayın',
    
    // Navigation
    'event_planning': 'Etkinlik Planlama',
    'weather_search': 'Hava Durumu Arama',
    'map_view': 'Harita Görünümü',
    
    // Event Search
    'event_type': 'Etkinlik Türü',
    'location': 'Konum',
    'date': 'Tarih',
    'search_weather': 'Hava Durumunu Ara',
    'select_event_type': 'Etkinlik türünü seçin',
    'enter_location': 'Konum girin',
    'select_date': 'Tarih seçin',
    'plan_your_event': 'Etkinliğinizi Planlayın',
    'ai_weather_recommendations': 'Açık hava etkinlikleriniz için AI destekli hava durumu önerileri alın',
    'what_are_you_planning': 'Ne planlıyorsunuz?',
    'event_placeholder': 'Örn: Doğa yürüyüşü, Piknik, Düğün, Açık hava konseri, İş toplantısı...',
    'location_placeholder': 'Şehir veya bölge adı',
    'get_weather_analysis': 'Hava Durumu Analizi Al',
    'analyzing': 'Analiz ediliyor...',
    'quick_examples': 'Hızlı örnekler:',
    'fill_all_fields': 'Lütfen tüm alanları doldurun',
    'location_not_found': 'Konum bulunamadı. Lütfen farklı bir konum adı deneyin.',
    'location_not_found_detailed': 'Konum bulunamadı. Lütfen şehir adını doğru yazdığınızdan emin olun ve farklı bir konum deneyin.',
    'geocoding_error': 'Konum arama hatası. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.',
    'business_meeting': 'İş Toplantısı',
    'outdoor_concert': 'Açık Hava Konseri',
    'location_info': 'Konum Bilgileri',
    'country': 'Ülke',
    'city': 'Şehir',
    'district': 'İlçe/Bölge (İsteğe bağlı)',
    'selected_location': 'Seçilen konum',
    'time_range': 'Zaman Aralığı (İsteğe bağlı)',
    'time_range_required': 'Zaman Aralığı',
    'format': 'Format',
    'start_end_format': 'Başlangıç-Bitiş (örn: 16:00-17:00)',
    'start_end_format_detailed': 'Başlangıç-Bitiş (örn: 16:00-17:00, 14:30-16:30)',
    'optional': 'İsteğe bağlı',
    'required': 'Gerekli',
    
    // Weather Search
    'search_location': 'Arama Konumu',
    'search_date': 'Arama Tarihi',
    'search': 'Ara',
    'detailed_weather_info': 'Herhangi bir şehir için detaylı hava durumu bilgisi alın',
    'city_placeholder': 'Şehir adı girin (örn: İstanbul, Ankara, İzmir)',
    'get_weather_info': 'Hava Durumu Bilgisi Al',
    
    // Weather Data
    'temperature': 'Sıcaklık',
    'humidity': 'Nem',
    'wind_speed': 'Rüzgar Hızı',
    'pressure': 'Basınç',
    'uv_index': 'UV İndeksi',
    'visibility': 'Görüş Mesafesi',
    'feels_like': 'Hissedilen',
    'min_temp': 'Min. Sıcaklık',
    'max_temp': 'Max. Sıcaklık',
    'sunrise': 'Gün Doğumu',
    'sunset': 'Gün Batımı',
    'moon_phase': 'Ay Fazı',
    
    // Event Types
    'outdoor_sports': 'Açık Hava Sporları',
    'picnic': 'Piknik',
    'hiking': 'Doğa Yürüyüşü',
    'beach_activity': 'Plaj Etkinliği',
    'camping': 'Kamp',
    'festival': 'Festival',
    'wedding': 'Düğün',
    'photography': 'Fotoğrafçılık',
    'cycling': 'Bisiklet',
    'running': 'Koşu',
    
    // Comfort Index
    'comfort_index': 'Konfor İndeksi',
    'excellent': 'Mükemmel',
    'good': 'İyi',
    'fair': 'Orta',
    'poor': 'Kötü',
    'very_poor': 'Çok Kötü',
    
    // AI Recommendations
    'ai_recommendations': 'AI Önerileri',
    'weather_forecast': 'Hava Durumu Tahmini',
    'recommended_activities': 'Önerilen Aktiviteler',
    'clothing_suggestions': 'Giyim Önerileri',
    'safety_tips': 'Güvenlik İpuçları',
    
    // Map
    'select_location': 'Konum Seç',
    'click_marker': 'Hava durumu için işaretçiye tıklayın',
    
    // Common
    'loading': 'Yükleniyor...',
    'error': 'Hata',
    'try_again': 'Tekrar Dene',
    'no_data': 'Veri bulunamadı',
    'footer': 'NASA Space Apps Challenge - Hava Durumu Tahmin Uygulaması',
    'analyzing_weather_data': 'Hava durumu verileri analiz ediliyor...',
    'ai_processing_request': 'AI asistanı isteğinizi işliyor',
    'get_started': 'Başla',
    'powered_by': 'Desteklenen Teknolojiler',
    'plan_events_description': 'Etkinlikleriniz için AI destekli hava durumu önerileri alın',
    'search_weather_description': 'Herhangi bir şehir için detaylı hava durumu bilgisi',
    'map_description': 'Harita üzerinden konum seçin ve hava durumunu görün',
    
    // Hero section
    'hero.title': 'Hava Durumu Asistanı',
    'hero.subtitle': 'AI destekli hava durumu analizi ve NASA verileri ile açık hava etkinliklerinizi planlayın',
    'hero.getStarted': 'Başlayın',
    'hero.viewMap': 'Haritayı Görüntüle',
    
    // Tabs
    'tabs.weather': 'Hava Durumu',
    'tabs.event': 'Etkinlik',
    'tabs.map': 'Harita',
    
    // Weather Conditions
    'clear_sky': 'Açık',
    'few_clouds': 'Az Bulutlu',
    'scattered_clouds': 'Parçalı Bulutlu',
    'broken_clouds': 'Çok Bulutlu',
    'shower_rain': 'Sağanak Yağmur',
    'rain': 'Yağmur',
    'thunderstorm': 'Fırtına',
    'snow': 'Kar',
    'mist': 'Sis',
    'fog': 'Sis',
    'haze': 'Pus',
    'dust': 'Toz',
    'sand': 'Kum',
    'ash': 'Kül',
    'squall': 'Squall',
    'tornado': 'Tornado'
  },
  en: {
    // Header
    'weather_assistant': 'Weather Assistant',
    'subtitle': 'Plan your outdoor activities with AI-powered weather insights and NASA data analysis',
    
    // Navigation
    'event_planning': 'Event Planning',
    'weather_search': 'Weather Search',
    'map_view': 'Map View',
    
    // Event Search
    'event_type': 'Event Type',
    'location': 'Location',
    'date': 'Date',
    'search_weather': 'Search Weather',
    'select_event_type': 'Select event type',
    'enter_location': 'Enter location',
    'select_date': 'Select date',
    'plan_your_event': 'Plan Your Event',
    'ai_weather_recommendations': 'Get AI-powered weather recommendations for your outdoor activities',
    'what_are_you_planning': 'What are you planning?',
    'event_placeholder': 'e.g., Hiking, Picnic, Wedding, Outdoor Concert, Business Meeting...',
    'location_placeholder': 'City or region name',
    'get_weather_analysis': 'Get Weather Analysis',
    'analyzing': 'Analyzing...',
    'quick_examples': 'Quick examples:',
    'fill_all_fields': 'Please fill in all fields',
    'location_not_found': 'Location not found. Please try a different location name.',
    'location_not_found_detailed': 'Location not found. Please make sure you spelled the city name correctly and try a different location.',
    'geocoding_error': 'Location search error. Please check your internet connection and try again.',
    'business_meeting': 'Business Meeting',
    'outdoor_concert': 'Outdoor Concert',
    'location_info': 'Location Information',
    'country': 'Country',
    'city': 'City',
    'district': 'District/Region (Optional)',
    'selected_location': 'Selected location',
    'time_range': 'Time Range (Optional)',
    'time_range_required': 'Time Range',
    'format': 'Format',
    'start_end_format': 'Start-End (e.g., 16:00-17:00)',
    'start_end_format_detailed': 'Start-End (e.g., 16:00-17:00, 14:30-16:30)',
    'optional': 'Optional',
    'required': 'Required',
    
    // Weather Search
    'search_location': 'Search Location',
    'search_date': 'Search Date',
    'search': 'Search',
    'detailed_weather_info': 'Get detailed weather information for any city',
    'city_placeholder': 'Enter city name (e.g., Istanbul, Ankara, Izmir)',
    'get_weather_info': 'Get Weather Information',
    
    // Weather Data
    'temperature': 'Temperature',
    'humidity': 'Humidity',
    'wind_speed': 'Wind Speed',
    'pressure': 'Pressure',
    'uv_index': 'UV Index',
    'visibility': 'Visibility',
    'feels_like': 'Feels Like',
    'min_temp': 'Min. Temperature',
    'max_temp': 'Max. Temperature',
    'sunrise': 'Sunrise',
    'sunset': 'Sunset',
    'moon_phase': 'Moon Phase',
    
    // Event Types
    'outdoor_sports': 'Outdoor Sports',
    'picnic': 'Picnic',
    'hiking': 'Hiking',
    'beach_activity': 'Beach Activity',
    'camping': 'Camping',
    'festival': 'Festival',
    'wedding': 'Wedding',
    'photography': 'Photography',
    'cycling': 'Cycling',
    'running': 'Running',
    
    // Comfort Index
    'comfort_index': 'Comfort Index',
    'excellent': 'Excellent',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor',
    'very_poor': 'Very Poor',
    
    // AI Recommendations
    'ai_recommendations': 'AI Recommendations',
    'weather_forecast': 'Weather Forecast',
    'recommended_activities': 'Recommended Activities',
    'clothing_suggestions': 'Clothing Suggestions',
    'safety_tips': 'Safety Tips',
    
    // Map
    'select_location': 'Select Location',
    'click_marker': 'Click marker for weather',
    
    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'try_again': 'Try Again',
    'no_data': 'No data found',
    'footer': 'NASA Space Apps Challenge - Weather Forecast App',
    'analyzing_weather_data': 'Analyzing weather data...',
    'ai_processing_request': 'AI assistant is processing your request',
    'get_started': 'Get Started',
    'powered_by': 'Powered by',
    'plan_events_description': 'Get AI-powered weather recommendations for your events',
    'search_weather_description': 'Detailed weather information for any city',
    'map_description': 'Select locations on map and view weather conditions',
    
    // Hero section
    'hero.title': 'Weather Assistant',
    'hero.subtitle': 'Plan your outdoor activities with AI-powered weather insights and NASA data analysis',
    'hero.getStarted': 'Get Started',
    'hero.viewMap': 'View Map',
    
    // Tabs
    'tabs.weather': 'Weather',
    'tabs.event': 'Event',
    'tabs.map': 'Map',
    
    // Weather Conditions
    'clear_sky': 'Clear Sky',
    'few_clouds': 'Few Clouds',
    'scattered_clouds': 'Scattered Clouds',
    'broken_clouds': 'Broken Clouds',
    'shower_rain': 'Shower Rain',
    'rain': 'Rain',
    'thunderstorm': 'Thunderstorm',
    'snow': 'Snow',
    'mist': 'Mist',
    'fog': 'Fog',
    'haze': 'Haze',
    'dust': 'Dust',
    'sand': 'Sand',
    'ash': 'Ash',
    'squall': 'Squall',
    'tornado': 'Tornado'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'tr' | 'en'>('en');

  useEffect(() => {
    // Load language from localStorage or default to Turkish
    const savedLanguage = localStorage.getItem('language') as 'tr' | 'en';
    if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: 'tr' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
