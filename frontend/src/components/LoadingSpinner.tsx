'use client';

import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  showWeatherIcons?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...',
  showWeatherIcons = true 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-8 h-8',
          text: 'text-sm',
          icon: 'w-4 h-4'
        };
      case 'lg':
        return {
          container: 'w-16 h-16',
          text: 'text-xl',
          icon: 'w-8 h-8'
        };
      default: // md
        return {
          container: 'w-12 h-12',
          text: 'text-base',
          icon: 'w-6 h-6'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const weatherIcons = [
    { icon: Sun, color: 'text-yellow-500', delay: '0s' },
    { icon: Cloud, color: 'text-gray-500', delay: '0.2s' },
    { icon: CloudRain, color: 'text-blue-500', delay: '0.4s' },
    { icon: CloudSnow, color: 'text-blue-300', delay: '0.6s' },
    { icon: CloudLightning, color: 'text-purple-500', delay: '0.8s' }
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-4 animate-fadeIn">
      {/* Main Spinner */}
      <div className="relative">
        <div className={`${sizeClasses.container} border-4 border-white/20 border-t-blue-500 rounded-full animate-spin`}></div>
        {showWeatherIcons && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse">
              <Cloud className={`${sizeClasses.icon} text-blue-400`} />
            </div>
          </div>
        )}
      </div>

      {/* Weather Icons Animation */}
      {showWeatherIcons && (
        <div className="flex space-x-2">
          {weatherIcons.map((weather, index) => {
            const IconComponent = weather.icon;
            return (
              <div
                key={index}
                className={`${weather.color} animate-bounce`}
                style={{ 
                  animationDelay: weather.delay,
                  animationDuration: '2s'
                }}
              >
                <IconComponent className="w-4 h-4" />
              </div>
            );
          })}
        </div>
      )}

      {/* Loading Message */}
      <div className="text-center">
        <p className={`${sizeClasses.text} text-white/90 font-medium mb-2`}>
          {message}
        </p>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-center max-w-md">
        <p className="text-sm text-white/70 leading-relaxed">
          Analyzing weather data and preparing AI recommendations...
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;