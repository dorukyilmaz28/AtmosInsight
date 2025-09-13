'use client';

import { WeatherCardProps } from '@/types/weather';

const WeatherCard: React.FC<WeatherCardProps> = ({ title, value, unit, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color}`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-800">
            {value}
            {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
          </div>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 text-center">
        {title}
      </h3>
    </div>
  );
};

export default WeatherCard;
