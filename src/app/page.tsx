'use client';

import { useState } from 'react';
import WeatherSearch from '@/components/WeatherSearch';
import WeatherResults from '@/components/WeatherResults';
import EventWeatherSearch, { EventData } from '@/components/EventWeatherSearch';
import EventWeatherResults from '@/components/EventWeatherResults';
import WeatherMap from '@/components/WeatherMap';
import LoadingSpinner from '@/components/LoadingSpinner';
import { WeatherData } from '@/types/weather';
import { Map, Search, Activity } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'event' | 'map'>('event');
  const [showMainContent, setShowMainContent] = useState(false);

  // Predefined locations for the map - Global popular cities
  const mapLocations = [
    // Europe
    { name: 'İstanbul', lat: 41.0082, lng: 28.9784, country: 'Türkiye' },
    { name: 'London', lat: 51.5074, lng: -0.1278, country: 'United Kingdom' },
    { name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'France' },
    { name: 'Berlin', lat: 52.5200, lng: 13.4050, country: 'Germany' },
    { name: 'Rome', lat: 41.9028, lng: 12.4964, country: 'Italy' },
    { name: 'Madrid', lat: 40.4168, lng: -3.7038, country: 'Spain' },
    { name: 'Amsterdam', lat: 52.3676, lng: 4.9041, country: 'Netherlands' },
    { name: 'Vienna', lat: 48.2082, lng: 16.3738, country: 'Austria' },
    
    // North America
    { name: 'New York', lat: 40.7128, lng: -74.0060, country: 'United States' },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, country: 'United States' },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298, country: 'United States' },
    { name: 'Toronto', lat: 43.6532, lng: -79.3832, country: 'Canada' },
    { name: 'Vancouver', lat: 49.2827, lng: -123.1207, country: 'Canada' },
    { name: 'Mexico City', lat: 19.4326, lng: -99.1332, country: 'Mexico' },
    
    // Asia
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan' },
    { name: 'Seoul', lat: 37.5665, lng: 126.9780, country: 'South Korea' },
    { name: 'Shanghai', lat: 31.2304, lng: 121.4737, country: 'China' },
    { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, country: 'Hong Kong' },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'Singapore' },
    { name: 'Bangkok', lat: 13.7563, lng: 100.5018, country: 'Thailand' },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, country: 'India' },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'UAE' },
    
    // Oceania
    { name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia' },
    { name: 'Melbourne', lat: -37.8136, lng: 144.9631, country: 'Australia' },
    { name: 'Auckland', lat: -36.8485, lng: 174.7633, country: 'New Zealand' },
    
    // South America
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333, country: 'Brazil' },
    { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, country: 'Brazil' },
    { name: 'Buenos Aires', lat: -34.6118, lng: -58.3960, country: 'Argentina' },
    { name: 'Lima', lat: -12.0464, lng: -77.0428, country: 'Peru' },
    
    // Africa
    { name: 'Cairo', lat: 30.0444, lng: 31.2357, country: 'Egypt' },
    { name: 'Cape Town', lat: -33.9249, lng: 18.4241, country: 'South Africa' },
    { name: 'Lagos', lat: 6.5244, lng: 3.3792, country: 'Nigeria' },
    { name: 'Nairobi', lat: -1.2921, lng: 36.8219, country: 'Kenya' },
  ];

  const handleWeatherSearch = async (location: string, date: string) => {
    setLoading(true);
    setError(null);
    setWeatherData(null);
    setEventData(null);

    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}&date=${date}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Hava durumu verisi alınamadı');
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSearch = async (eventData: EventData) => {
    setLoading(true);
    setError(null);
    setWeatherData(null);
    setEventData(eventData);

    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(eventData.location)}&date=${eventData.date}&eventType=${encodeURIComponent(eventData.eventType)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Hava durumu verisi alınamadı');
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleMapLocationSelect = (location: string, date: string) => {
    handleWeatherSearch(location, date);
    setActiveTab('search');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-indigo-800/15 to-purple-700/10"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Language Toggle */}
        <div className="flex justify-end mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('tr')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                language === 'tr' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🇹🇷 TR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                language === 'en' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🇺🇸 EN
            </button>
          </div>
        </div>

        {!showMainContent ? (
          /* Landing Page */
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center max-w-4xl mx-auto animate-fadeIn">
              {/* Main Title */}
              <div className="mb-8 md:mb-12">
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 md:mb-8 animate-slideUp">
                  {t('weather_assistant')}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 leading-relaxed animate-slideUp px-4" style={{ animationDelay: '0.2s' }}>
                  {t('subtitle')}
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16 animate-scaleIn px-4" style={{ animationDelay: '0.4s' }}>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full mb-3 md:mb-4 animate-glow">
                    <Activity className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2 md:mb-3">{t('event_planning')}</h3>
                  <p className="text-sm md:text-base text-white/80">{t('plan_events_description')}</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full mb-3 md:mb-4 animate-glow" style={{ animationDelay: '0.2s' }}>
                    <Search className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2 md:mb-3">{t('weather_search')}</h3>
                  <p className="text-sm md:text-base text-white/80">{t('search_weather_description')}</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full mb-3 md:mb-4 animate-glow" style={{ animationDelay: '0.4s' }}>
                    <Map className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2 md:mb-3">{t('map_view')}</h3>
                  <p className="text-sm md:text-base text-white/80">{t('map_description')}</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="animate-scaleIn px-4" style={{ animationDelay: '0.6s' }}>
                <button
                  onClick={() => setShowMainContent(true)}
                  className="clean-button text-lg md:text-xl px-8 md:px-12 py-3 md:py-4 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-2xl w-full sm:w-auto"
                >
                  {t('get_started')} →
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-16 text-center animate-fadeIn" style={{ animationDelay: '0.8s' }}>
                <p className="text-white/70 text-lg mb-4">{t('powered_by')}</p>
                <div className="flex justify-center items-center gap-8 text-white/60">
                  <span className="text-sm">🌍 NASA Data</span>
                  <span className="text-sm">🤖 AI Powered</span>
                  <span className="text-sm">⚡ Real-time</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Main Content */
          <>
            {/* Header */}
            <div className="text-center mb-8 md:mb-16 animate-fadeIn px-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 animate-slideUp">
                {t('weather_assistant')}
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed animate-slideUp" style={{ animationDelay: '0.2s' }}>
                {t('subtitle')}
              </p>
            </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 md:mb-16 animate-scaleIn px-4" style={{ animationDelay: '0.4s' }}>
          <div className="flex gap-1 md:gap-2 max-w-md md:max-w-none mobile-nav justify-center">
            <button
              onClick={() => setActiveTab('event')}
              className={`px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base ${
                activeTab === 'event'
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Activity size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">{t('event_planning')}</span>
              <span className="sm:hidden">Event</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base ${
                activeTab === 'search'
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Search size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">{t('weather_search')}</span>
              <span className="sm:hidden">Search</span>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base ${
                activeTab === 'map'
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Map size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">{t('map_view')}</span>
              <span className="sm:hidden">Map</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          {activeTab === 'event' ? (
            <>
              {/* Event Search Component */}
              <div className="max-w-2xl mx-auto mb-8">
                <EventWeatherSearch onSearch={handleEventSearch} />
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center mb-8">
                  <LoadingSpinner />
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="clean-card p-6 text-center animate-bounce border-red-200 bg-red-50">
                    <div className="text-red-600 text-lg font-medium mb-2">
                      ⚠️ {t('error')}
                    </div>
                    <p className="text-red-700 mb-4">{error}</p>
                    <div className="text-sm text-red-600">
                      <p className="mb-2">💡 <strong>Öneriler:</strong></p>
                      <ul className="text-left space-y-1">
                        <li>• Konum adını doğru yazdığınızdan emin olun</li>
                        <li>• Farklı bir konum adı deneyin</li>
                        <li>• İnternet bağlantınızı kontrol edin</li>
                        <li>• Sayfayı yenileyin ve tekrar deneyin</li>
                      </ul>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-blue-800 font-medium mb-2">🌍 Önerilen Konumlar:</p>
                        <div className="flex flex-wrap gap-2">
                          {['İstanbul', 'Ankara', 'İzmir', 'New York', 'London', 'Berlin', 'Paris', 'Tokyo'].map((city, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {city}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Event Results */}
              {weatherData && eventData && !loading && (
                <div className="max-w-6xl mx-auto">
                  <EventWeatherResults eventData={eventData} weatherData={weatherData} />
                </div>
              )}
            </>
          ) : activeTab === 'search' ? (
            <>
              {/* Search Component */}
              <div className="max-w-2xl mx-auto mb-8">
                <WeatherSearch onSearch={handleWeatherSearch} />
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center mb-8">
                  <LoadingSpinner />
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="clean-card p-6 text-center animate-bounce border-red-200 bg-red-50">
                    <div className="text-red-600 text-lg font-medium mb-2">
                      ⚠️ {t('error')}
                    </div>
                    <p className="text-red-700 mb-4">{error}</p>
                    <div className="text-sm text-red-600">
                      <p className="mb-2">💡 <strong>Öneriler:</strong></p>
                      <ul className="text-left space-y-1">
                        <li>• Konum adını doğru yazdığınızdan emin olun</li>
                        <li>• Farklı bir konum adı deneyin</li>
                        <li>• İnternet bağlantınızı kontrol edin</li>
                        <li>• Sayfayı yenileyin ve tekrar deneyin</li>
                      </ul>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-blue-800 font-medium mb-2">🌍 Önerilen Konumlar:</p>
                        <div className="flex flex-wrap gap-2">
                          {['İstanbul', 'Ankara', 'İzmir', 'New York', 'London', 'Berlin', 'Paris', 'Tokyo'].map((city, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {city}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              {weatherData && !loading && (
                <div className="max-w-6xl mx-auto">
                  <WeatherResults data={weatherData} />
                </div>
              )}
            </>
          ) : (
            /* Map Component */
            <div className="max-w-7xl mx-auto">
              <WeatherMap 
                locations={mapLocations} 
                onLocationSelect={handleMapLocationSelect}
              />
            </div>
          )}
        </div>

            {/* Footer */}
            <footer className="text-center mt-16 text-white/60 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
              <p>{t('footer')}</p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}