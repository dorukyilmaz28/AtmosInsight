'use client';

import { Thermometer, Droplets, Wind, CloudRain, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ComfortIndexProps {
  comfortIndex: {
    score: number;
    level: string;
    issues: string[];
    color: string;
  };
}

const ComfortIndex: React.FC<ComfortIndexProps> = ({ comfortIndex }) => {
  const getIcon = () => {
    if (comfortIndex.score >= 80) return <CheckCircle className="w-8 h-8 text-green-500" />;
    if (comfortIndex.score >= 60) return <CheckCircle className="w-8 h-8 text-green-400" />;
    if (comfortIndex.score >= 40) return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    return <XCircle className="w-8 h-8 text-red-500" />;
  };

  const getColorClass = () => {
    switch (comfortIndex.color) {
      case 'green': return 'from-green-400 to-green-600';
      case 'yellow': return 'from-yellow-400 to-yellow-600';
      case 'red': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <Thermometer className="w-6 h-6 mr-2 text-blue-500" />
          Konfor Değerlendirmesi
        </h3>
        <div className="flex items-center">
          {getIcon()}
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Score Display */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r ${getColorClass()} text-white font-bold text-2xl`}>
            {comfortIndex.score}
          </div>
          <p className="text-lg font-semibold text-gray-700 mt-2">
            {comfortIndex.level}
          </p>
        </div>

        {/* Issues */}
        {comfortIndex.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">Dikkat Edilmesi Gerekenler:</h4>
            <div className="flex flex-wrap gap-2">
              {comfortIndex.issues.map((issue, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                >
                  {issue}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comfort Level Description */}
        <div className="text-center text-sm text-gray-600">
          {comfortIndex.score >= 80 && "Mükemmel hava koşulları! Dışarı çıkmak için ideal."}
          {comfortIndex.score >= 60 && comfortIndex.score < 80 && "İyi hava koşulları. Dışarı çıkabilirsiniz."}
          {comfortIndex.score >= 40 && comfortIndex.score < 60 && "Orta seviye. Dikkatli olun."}
          {comfortIndex.score < 40 && "Zorlu hava koşulları. Dışarı çıkmadan önce düşünün."}
        </div>
      </div>
    </div>
  );
};

export default ComfortIndex;
