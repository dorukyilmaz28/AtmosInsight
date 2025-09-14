import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';

export default function Home() {
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location || !date) return;

    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const response = await axios.get(`/api/weather?location=${encodeURIComponent(location)}&date=${date}`);
      setWeatherData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      <Head>
        <title>AtmosInsight - Weather Forecast App</title>
        <meta name="description" content="AI-powered weather forecasting and event planning" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🌤️ AtmosInsight
          </h1>
          <p className="text-xl text-white/90">
            AI-Powered Weather Forecasting & Event Planning
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Weather Forecast Search
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city name (e.g., Istanbul, London)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Searching...' : 'Get Weather Forecast'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Weather Results */}
        {weatherData && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Weather Forecast for {weatherData.location.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Temperature */}
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">🌡️</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Temperature</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {weatherData.weather.temperature.max}°C
                  </div>
                  <div className="text-sm text-gray-600">
                    Max: {weatherData.weather.temperature.max}°C<br />
                    Min: {weatherData.weather.temperature.min}°C
                  </div>
                </div>

                {/* Precipitation */}
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">🌧️</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Precipitation</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {weatherData.weather.precipitation}mm
                  </div>
                </div>

                {/* Wind */}
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">💨</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Wind Speed</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {weatherData.weather.windSpeed} km/h
                  </div>
                </div>

                {/* Humidity */}
                <div className="bg-orange-50 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">💧</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Humidity</h4>
                  <div className="text-2xl font-bold text-orange-600">
                    {weatherData.weather.humidity}%
                  </div>
                </div>

                {/* Comfort Index */}
                <div className="bg-pink-50 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">😊</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Comfort Index</h4>
                  <div className="text-2xl font-bold text-pink-600">
                    {weatherData.comfortIndex}/100
                  </div>
                </div>

                {/* UV Index */}
                <div className="bg-yellow-50 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">☀️</div>
                  <h4 className="font-semibold text-gray-800 mb-2">UV Index</h4>
                  <div className="text-2xl font-bold text-yellow-600">
                    {weatherData.weather.uvIndex}
                  </div>
                </div>
              </div>

              {/* AI Recommendation */}
              {weatherData.aiRecommendation && (
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    🤖 AI Recommendation
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line">
                    {weatherData.aiRecommendation}
                  </p>
                </div>
              )}

              {/* NASA Data */}
              {weatherData.nasaData && (
                <div className="mt-6 bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    🚀 NASA Data
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {weatherData.nasaData.solarRadiation && (
                      <div>
                        <span className="font-medium">Solar Radiation:</span> {weatherData.nasaData.solarRadiation} MJ/m²
                      </div>
                    )}
                    {weatherData.nasaData.temperature?.max && (
                      <div>
                        <span className="font-medium">NASA Max Temp:</span> {weatherData.nasaData.temperature.max}°C
                      </div>
                    )}
                    {weatherData.nasaData.temperature?.min && (
                      <div>
                        <span className="font-medium">NASA Min Temp:</span> {weatherData.nasaData.temperature.min}°C
                      </div>
                    )}
                    {weatherData.nasaData.humidity && (
                      <div>
                        <span className="font-medium">NASA Humidity:</span> {weatherData.nasaData.humidity}%
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-white/80">
          <p>Powered by Open-Meteo API & NASA POWER Data</p>
          <p className="text-sm mt-2">Built with Next.js, Express, and AI</p>
        </div>
      </div>
    </div>
  );
}
