'use client';

import { Sun, Thermometer, Droplets, Satellite } from 'lucide-react';

interface NASADataProps {
  nasaData: {
    solarRadiation: number | null;
    temperature: {
      max: number | null;
      min: number | null;
    };
    humidity: number | null;
  } | null;
}

const NASAData: React.FC<NASADataProps> = ({ nasaData }) => {
  if (!nasaData) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center mb-4">
          <Satellite className="w-6 h-6 mr-2 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800">NASA Verileri</h3>
        </div>
        <p className="text-gray-600 text-center py-4">
          NASA Earth Observation verileri şu anda mevcut değil.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-100">
      <div className="flex items-center mb-6">
        <Satellite className="w-6 h-6 mr-2 text-blue-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-800">NASA Earth Observation</h3>
          <p className="text-sm text-gray-600">Bilimsel veriler</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Solar Radiation */}
        {nasaData.solarRadiation && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <Sun className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Güneş Radyasyonu</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {nasaData.solarRadiation.toFixed(1)}
              <span className="text-sm text-gray-500 ml-1">W/m²</span>
            </div>
          </div>
        )}

        {/* NASA Temperature */}
        {(nasaData.temperature.max || nasaData.temperature.min) && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <Thermometer className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">NASA Sıcaklık</span>
            </div>
            <div className="text-lg font-bold text-gray-800">
              {nasaData.temperature.max && `${nasaData.temperature.max.toFixed(1)}°C`}
              {nasaData.temperature.max && nasaData.temperature.min && ' / '}
              {nasaData.temperature.min && `${nasaData.temperature.min.toFixed(1)}°C`}
            </div>
          </div>
        )}

        {/* NASA Humidity */}
        {nasaData.humidity && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <Droplets className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">NASA Nem</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {nasaData.humidity.toFixed(0)}
              <span className="text-sm text-gray-500 ml-1">%</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          <Satellite className="w-4 h-4 mr-1" />
          NASA POWER API
        </div>
      </div>
    </div>
  );
};

export default NASAData;
