'use client';

import React from 'react';

interface WeatherCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon, 
  color, 
  description,
  trend,
  trendValue 
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl border border-white/20 hover:bg-white/15">
      <div className={`absolute inset-0 bg-gradient-to-br ${color}/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`bg-gradient-to-br ${color} rounded-2xl p-4 shadow-lg`}>
            {icon}
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-white/90">{title}</span>
            {trend && trendValue && (
              <div className={`text-xs mt-1 ${getTrendColor()}`}>
                {getTrendIcon()} {trendValue}
              </div>
            )}
          </div>
        </div>
        <div className="text-4xl font-bold text-white mb-2">
          {value}
          {unit && <span className="text-lg text-white/70 ml-1">{unit}</span>}
        </div>
        {description && (
          <div className="text-sm text-white/70 leading-relaxed">
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherCard;