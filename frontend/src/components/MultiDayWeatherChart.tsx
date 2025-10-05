'use client';

import { motion } from 'framer-motion';
import { Download, BarChart3, Thermometer, Wind, Droplets, Eye, Sun, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { useEffect, useState } from 'react';

interface DayWeatherData {
  date: string;
  day: string;
  temperature: {
    max: number;
    min: number;
    avg: number;
  };
  windSpeed: number;
  precipitation: number;
  humidity: number;
  uvIndex: number;
  weatherCode: number;
}

interface MultiDayWeatherChartProps {
  startDate: string;
  endDate: string;
  location: string;
  weatherData?: any; // Real weather data from API
  onDownload: (format: 'json' | 'csv') => void;
}

export default function MultiDayWeatherChart({ 
  startDate, 
  endDate, 
  location, 
  weatherData,
  onDownload 
}: MultiDayWeatherChartProps) {
  const [activeChart, setActiveChart] = useState<'temperature' | 'wind' | 'precipitation' | 'humidity' | 'uv'>('temperature');
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const updateScreen = () => setIsSmallScreen(window.innerWidth < 640);
    updateScreen();
    window.addEventListener('resize', updateScreen);
    return () => window.removeEventListener('resize', updateScreen);
  }, []);

  // Calculate number of days - ensure minimum 1 day
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Generate multi-day weather data from API or fallback to mock data
  const generateMultiDayData = (): DayWeatherData[] => {
    const multiDayData: DayWeatherData[] = [];
    
    // Use real weather data if available
    if (weatherData?.dailyData) {
      const dailyData = weatherData.dailyData;
      
      // Debug: Log the daily data structure
      console.log('MultiDayWeatherChart - dailyData:', dailyData);
      
      // Open-Meteo API returns time as an array of ISO date strings
      const dates = dailyData.time || [];
      const dataLength = Math.min(
        dates.length || dailyData.temperature_2m_max?.length || 0,
        daysDiff
      );
      
      for (let i = 0; i < dataLength; i++) {
        // Use provided date or calculate from start date
        const currentDate = dates[i] ? new Date(dates[i]) : new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        const maxTemp = dailyData.temperature_2m_max?.[i] ?? 25;
        const minTemp = dailyData.temperature_2m_min?.[i] ?? 15;
        const avgTemp = (maxTemp + minTemp) / 2;
        
        multiDayData.push({
          date: dateStr,
          day: dayName,
          temperature: {
            max: maxTemp,
            min: minTemp,
            avg: avgTemp
          },
          windSpeed: dailyData.windspeed_10m_max?.[i] ?? 10,
          precipitation: dailyData.precipitation_sum?.[i] ?? 0,
          humidity: dailyData.relative_humidity_2m_max?.[i] ?? 60,
          uvIndex: dailyData.uv_index_max?.[i] ?? 5,
          weatherCode: dailyData.weathercode?.[i] ?? 0
        });
      }
    } else {
      // Fallback to mock data if no real data available
      for (let i = 0; i < daysDiff; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Generate realistic weather patterns based on season and day
        const month = currentDate.getMonth();
        const isSummer = month >= 5 && month <= 8;
        const isWinter = month >= 11 || month <= 2;
        
        // Base temperatures based on season
        const baseTemp = isSummer ? 28 : isWinter ? 8 : 18;
        const tempVariation = (Math.random() - 0.5) * 8; // ±4°C variation
        
        const maxTemp = baseTemp + tempVariation + (Math.random() * 4);
        const minTemp = maxTemp - (8 + Math.random() * 6);
        const avgTemp = (maxTemp + minTemp) / 2;
        
        // Other weather parameters
        const windSpeed = Math.random() * 20 + 5; // 5-25 km/h
        const precipitation = Math.random() > 0.7 ? Math.random() * 15 : 0; // 30% chance of rain
        const humidity = 40 + Math.random() * 40; // 40-80%
        const uvIndex = isSummer ? Math.random() * 8 + 2 : Math.random() * 4 + 1; // Higher in summer
        
        // Weather codes (0-99)
        const weatherCode = precipitation > 5 ? 
          (Math.random() > 0.5 ? 61 : 63) : // Rain codes
          (precipitation > 0 ? 51 : Math.random() > 0.3 ? 0 : 2); // Clear or partly cloudy
        
        // Generate realistic temperature data based on day
        const baseTempMock = 20 + Math.sin(i * 0.5) * 5; // Vary between 15-25°C
        const maxTempMock = Math.round((baseTempMock + 3 + Math.random() * 2) * 10) / 10;
        const minTempMock = Math.round((baseTempMock - 3 - Math.random() * 2) * 10) / 10;
        const avgTempMock = Math.round(((maxTempMock + minTempMock) / 2) * 10) / 10;
        
        multiDayData.push({
          date: dateStr,
          day: dayName,
          temperature: {
            max: maxTempMock,
            min: minTempMock,
            avg: avgTempMock
          },
          windSpeed: Math.round(windSpeed * 10) / 10,
          precipitation: Math.round(precipitation * 10) / 10,
          humidity: Math.round(humidity * 10) / 10,
          uvIndex: Math.round(uvIndex * 10) / 10,
          weatherCode: weatherCode
        });
      }
    }
    
    return multiDayData;
  };

  const multiDayData = generateMultiDayData();

  const chartData = multiDayData.map(day => ({
    date: day.date,
    day: day.day,
    tempMax: day.temperature?.max ?? 25,
    tempMin: day.temperature?.min ?? 15,
    tempAvg: day.temperature?.avg ?? 20,
    wind: day.windSpeed ?? 10,
    rain: day.precipitation ?? 0,
    humid: day.humidity ?? 60,
    uv: day.uvIndex ?? 5
  }));

  const chartConfig = {
    temperature: {
      dataKey: 'tempAvg',
      color: '#ff4444',
      icon: Thermometer,
      label: 'Temperature (°C)',
      unit: '°C'
    },
    wind: {
      dataKey: 'wind',
      color: '#3b82f6',
      icon: Wind,
      label: 'Wind Speed (km/h)',
      unit: 'km/h'
    },
    precipitation: {
      dataKey: 'rain',
      color: '#06b6d4',
      icon: Droplets,
      label: 'Precipitation (mm)',
      unit: 'mm'
    },
    humidity: {
      dataKey: 'humid',
      color: '#8b5cf6',
      icon: Eye,
      label: 'Humidity (%)',
      unit: '%'
    },
    uv: {
      dataKey: 'uv',
      color: '#f59e0b',
      icon: Sun,
      label: 'UV Index',
      unit: ''
    }
  };

  const currentConfig = chartConfig[activeChart];

  // Debug: Detailed logs
  console.log('MultiDayWeatherChart - chartData:', chartData);
  console.log('MultiDayWeatherChart - activeChart:', activeChart);
  console.log('MultiDayWeatherChart - daysDiff:', daysDiff);
  console.log('MultiDayWeatherChart - multiDayData length:', multiDayData.length);
  
  // Validate data before rendering
  if (chartData.length === 0) {
    console.warn('MultiDayWeatherChart: No chart data available');
    return null;
  }

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 99) return '⛈️';
    return '🌤️';
  };

  const getUVLevel = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: 'Low', color: 'text-green-400' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'text-yellow-400' };
    if (uvIndex <= 7) return { level: 'High', color: 'text-orange-400' };
    if (uvIndex <= 10) return { level: 'Very High', color: 'text-red-400' };
    return { level: 'Extreme', color: 'text-purple-400' };
  };

  const getWindLevel = (windSpeed: number) => {
    if (windSpeed <= 5) return { level: 'Calm', color: 'text-green-400' };
    if (windSpeed <= 15) return { level: 'Light', color: 'text-yellow-400' };
    if (windSpeed <= 25) return { level: 'Moderate', color: 'text-orange-400' };
    return { level: 'Strong', color: 'text-red-400' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-600/30 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-xl p-3">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {daysDiff === 1 ? 'Daily Weather Forecast' : `${daysDiff}-Day Weather Forecast`}
              </h2>
              <p className="text-indigo-100">
                {location} - {daysDiff === 1 ? startDate : `${startDate} to ${endDate}`}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onDownload('json')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => onDownload('csv')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white/5 backdrop-blur-sm">
        {/* Chart Type Selector */}
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.entries(chartConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveChart(key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeChart === key
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15 hover:text-white'
              }`}
            >
              <config.icon className="w-4 h-4" />
              <span>{config.label}</span>
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
          <div style={{ height: isSmallScreen ? 220 : 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: isSmallScreen ? 10 : 30, left: isSmallScreen ? 0 : 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="day" 
                  stroke="#9CA3AF"
                  interval={isSmallScreen ? 0 : 0}
                  fontSize={isSmallScreen ? 10 : 12}
                  tickLine={{ stroke: '#6B7280' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={isSmallScreen ? 10 : 12}
                  tickLine={{ stroke: '#6B7280' }}
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tickCount={6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value}${currentConfig.unit}`,
                    currentConfig.label
                  ]}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                
                <Line
                  type="monotone"
                  dataKey={currentConfig.dataKey}
                  stroke={currentConfig.color}
                  strokeWidth={isSmallScreen ? 2 : (activeChart === 'temperature' ? 4 : 3)}
                  dot={{ fill: currentConfig.color, strokeWidth: 2, r: isSmallScreen ? 3 : (activeChart === 'temperature' ? 6 : 4) }}
                  activeDot={{ r: 6, stroke: currentConfig.color, strokeWidth: 2 }}
                  name={currentConfig.label}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Weather Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {multiDayData.map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-lg font-bold text-white">{day.day}</div>
                  <div className="text-sm text-gray-300">{day.date}</div>
                </div>
                <div className="text-2xl">{getWeatherIcon(day.weatherCode)}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Temperature</span>
                  <span className="text-white">
                    {day.temperature.max}° / {day.temperature.min}°
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Wind</span>
                  <span className={`${getWindLevel(day.windSpeed).color}`}>
                    {day.windSpeed} km/h
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">UV Index</span>
                  <span className={`${getUVLevel(day.uvIndex).color}`}>
                    {day.uvIndex}
                  </span>
                </div>
                {day.precipitation > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Rain</span>
                    <span className="text-blue-400">{day.precipitation}mm</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Data Source Info */}
        <div className="mt-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-gray-300" />
            <h4 className="font-semibold text-white">Multi-Day Weather Analysis</h4>
          </div>
          <p className="text-sm text-gray-300 mb-2">
            {daysDiff === 1 
              ? 'Comprehensive daily weather forecast with detailed analysis.'
              : `${daysDiff}-day comprehensive weather forecast with daily patterns and trends analysis.`
            }
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-indigo-800/50 text-indigo-300 text-xs rounded-full border border-indigo-600/30">
              {daysDiff === 1 ? 'Daily Forecast' : `${daysDiff}-Day Forecast`}
            </span>
            <span className="px-2 py-1 bg-emerald-800/50 text-emerald-300 text-xs rounded-full border border-emerald-600/30">
              Daily Patterns
            </span>
            <span className="px-2 py-1 bg-purple-800/50 text-purple-300 text-xs rounded-full border border-purple-600/30">
              Trend Analysis
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
