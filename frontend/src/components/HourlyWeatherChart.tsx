'use client';

import { motion } from 'framer-motion';
import { Download, BarChart3, Thermometer, Wind, Droplets, Eye, Sun, Cloud } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { useEffect, useState } from 'react';

interface HourlyWeatherData {
  hour: string;
  temperature: number;
  windSpeed: number;
  precipitation: number;
  humidity: number;
  uvIndex: number;
  cloudCover: number;
}

interface HourlyWeatherChartProps {
  currentData: {
    date: string;
    temperature: number;
    windSpeed: number;
    precipitation: number;
    humidity: number;
    comfortIndex: number;
    uvIndex?: number;
  };
  location: string;
  targetDate: string;
  onDownload: (format: 'json' | 'csv') => void;
}

export default function HourlyWeatherChart({ 
  currentData, 
  location, 
  targetDate, 
  onDownload 
}: HourlyWeatherChartProps) {
  const [activeChart, setActiveChart] = useState<'temperature' | 'wind' | 'precipitation' | 'humidity' | 'uv'>('temperature');
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const updateScreen = () => setIsSmallScreen(window.innerWidth < 640);
    updateScreen();
    window.addEventListener('resize', updateScreen);
    return () => window.removeEventListener('resize', updateScreen);
  }, []);

  // Generate 24-hour hourly data based on current conditions
  const generateHourlyData = (): HourlyWeatherData[] => {
    const hourlyData: HourlyWeatherData[] = [];
    
    // Use current data as base
    const baseTemp = currentData.temperature;
    const baseWind = currentData.windSpeed;
    const basePrecip = currentData.precipitation;
    const baseHumidity = currentData.humidity;
    const baseUvIndex = currentData.uvIndex || 5; // Default UV index
    
    for (let hour = 0; hour < 24; hour++) {
      // Create realistic daily patterns
      const tempPattern = Math.sin((hour - 6) * Math.PI / 12) * 8; // Peak at 14:00, low at 6:00
      const windPattern = Math.sin((hour - 12) * Math.PI / 12) * 2 + Math.random() * 3; // Windier during day
      const uvPattern = Math.max(0, Math.sin((hour - 6) * Math.PI / 12) * 8); // UV only during daylight
      const humidityPattern = -Math.sin((hour - 6) * Math.PI / 12) * 15; // Higher at night, lower during day
      
      // Add some randomness for realism
      const tempVariation = (Math.random() - 0.5) * 3;
      const windVariation = (Math.random() - 0.5) * 4;
      const precipVariation = Math.random() > 0.9 ? Math.random() * 2 : 0; // Occasional light rain
      
      hourlyData.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        temperature: Math.round((baseTemp + tempPattern + tempVariation) * 10) / 10,
        windSpeed: Math.round((baseWind + windPattern + windVariation) * 10) / 10,
        precipitation: Math.round((basePrecip + precipVariation) * 10) / 10,
        humidity: Math.max(20, Math.min(95, Math.round((baseHumidity + humidityPattern) * 10) / 10)),
        uvIndex: Math.round(Math.max(0, baseUvIndex + uvPattern + (Math.random() - 0.5) * 2) * 10) / 10,
        cloudCover: Math.round((30 + Math.sin(hour * Math.PI / 12) * 20 + Math.random() * 30) * 10) / 10
      });
    }
    
    return hourlyData;
  };

  const hourlyData = generateHourlyData();

  const chartData = hourlyData.map(point => ({
    hour: point.hour,
    temp: point.temperature,
    wind: point.windSpeed,
    rain: point.precipitation,
    humid: point.humidity,
    uv: point.uvIndex,
    cloud: point.cloudCover
  }));

  const chartConfig = {
    temperature: {
      dataKey: 'temp',
      color: '#ef4444',
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
      <div className="bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-xl p-3">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">24-Hour Weather Forecast</h2>
              <p className="text-blue-100">{location} - {targetDate}</p>
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
                  dataKey="hour" 
                  stroke="#9CA3AF"
                  interval={isSmallScreen ? 2 : 0}
                  fontSize={isSmallScreen ? 10 : 12}
                  tickLine={{ stroke: '#6B7280' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={isSmallScreen ? 10 : 12}
                  tickLine={{ stroke: '#6B7280' }}
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
                />
                <Line
                  type="monotone"
                  dataKey={currentConfig.dataKey}
                  stroke={currentConfig.color}
                  strokeWidth={isSmallScreen ? 2 : 3}
                  dot={{ fill: currentConfig.color, strokeWidth: 2, r: isSmallScreen ? 3 : 4 }}
                  activeDot={{ r: 6, stroke: currentConfig.color, strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* UV Index */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-2">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-300">UV Index</div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(currentData.uvIndex || 5)}
                </div>
                <div className={`text-sm font-medium ${getUVLevel(currentData.uvIndex || 5).color}`}>
                  {getUVLevel(currentData.uvIndex || 5).level}
                </div>
              </div>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-2">
                <Wind className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-300">Wind Speed</div>
                <div className="text-2xl font-bold text-white">
                  {currentData.windSpeed} km/h
                </div>
                <div className={`text-sm font-medium ${getWindLevel(currentData.windSpeed).color}`}>
                  {getWindLevel(currentData.windSpeed).level}
                </div>
              </div>
            </div>
          </div>

          {/* Comfort Index */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-2">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-300">Comfort Index</div>
                <div className="text-2xl font-bold text-white">
                  {currentData.comfortIndex}
                </div>
                <div className="text-sm font-medium text-green-400">
                  {currentData.comfortIndex >= 80 ? 'Excellent' : 
                   currentData.comfortIndex >= 60 ? 'Good' : 
                   currentData.comfortIndex >= 40 ? 'Fair' : 'Poor'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Source Info */}
        <div className="mt-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-gray-300" />
            <h4 className="font-semibold text-white">Hourly Weather Data</h4>
          </div>
          <p className="text-sm text-gray-300 mb-2">
            24-hour detailed weather forecast with hourly variations. Based on current conditions and typical daily patterns.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-800/50 text-blue-300 text-xs rounded-full border border-blue-600/30">Hourly Forecast</span>
            <span className="px-2 py-1 bg-emerald-800/50 text-emerald-300 text-xs rounded-full border border-emerald-600/30">UV Index</span>
            <span className="px-2 py-1 bg-purple-800/50 text-purple-300 text-xs rounded-full border border-purple-600/30">Wind Analysis</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
