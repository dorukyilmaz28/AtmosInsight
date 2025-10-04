'use client';

import { motion } from 'framer-motion';

interface DecisionBarProps {
  score: number; // 0-100, where 100 means "definitely go"
  recommendation: string;
  risks: Array<{
    type: string;
    probability: number;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

export default function DecisionBar({ score, recommendation, risks }: DecisionBarProps) {
  // Calculate color based on score
  const getColor = (score: number) => {
    if (score >= 90) return 'from-green-400 to-green-600'; // Excellent
    if (score >= 75) return 'from-blue-400 to-blue-600';   // Good
    if (score >= 60) return 'from-yellow-400 to-yellow-600'; // Fair
    if (score >= 40) return 'from-orange-400 to-orange-600'; // Poor
    return 'from-red-400 to-red-600'; // Not Recommended
  };

  const getIcon = (score: number) => {
    if (score >= 90) return '✅'; // Excellent
    if (score >= 75) return '✅'; // Good
    if (score >= 60) return '⚠️'; // Fair
    if (score >= 40) return '⚠️'; // Poor
    return '❌'; // Not Recommended
  };

  const getDecision = (score: number) => {
    if (score >= 90) return 'GO'; // Excellent
    if (score >= 75) return 'GO'; // Good
    if (score >= 60) return 'GO WITH CAUTION'; // Fair
    if (score >= 40) return 'GO WITH CAUTION'; // Poor
    return 'DON\'T GO'; // Not Recommended
  };

  const getDecisionColor = (score: number) => {
    if (score >= 90) return 'text-green-400'; // Excellent
    if (score >= 75) return 'text-blue-400'; // Good
    if (score >= 60) return 'text-yellow-400'; // Fair
    if (score >= 40) return 'text-orange-400'; // Poor
    return 'text-red-400'; // Not Recommended
  };

  const getExplanation = (score: number) => {
    if (score >= 90) {
      return 'Excellent weather conditions! Perfect day for your event.';
    }
    if (score >= 75) {
      return 'Good weather conditions! Suitable day for your event.';
    }
    if (score >= 60) {
      return 'Moderate weather conditions. You can go with some precautions.';
    }
    if (score >= 40) {
      return 'Challenging weather conditions. Be careful and take precautions.';
    }
    return 'Very challenging weather conditions. We recommend postponing the event.';
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 sm:p-6 border border-white/10 shadow-lg">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
          🤖 AI Decision Recommendation
        </h3>
        <p className="text-gray-300 text-xs sm:text-sm px-2">
          Based on AI analysis, here's the recommendation for your event
        </p>
      </div>

      {/* Decision Score */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
          <span className="text-3xl sm:text-4xl">{getIcon(score)}</span>
          <span className={`text-xl sm:text-2xl lg:text-3xl font-bold ${getDecisionColor(score)}`}>
            {getDecision(score)}
          </span>
          <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
            {score}%
          </span>
        </div>
        
        <p className="text-gray-300 mb-4 text-sm sm:text-base px-2">
          {getExplanation(score)}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="w-full bg-gray-700 rounded-full h-3 sm:h-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${getColor(score)} rounded-full shadow-lg`}
          />
        </div>
        
        {/* Progress Labels */}
        <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
          <span className="text-center">Don't Go</span>
          <span className="text-center">Go with Caution</span>
          <span className="text-center">Go</span>
        </div>
      </div>

      {/* Risk Summary */}
      {risks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white font-medium text-sm">Risk Analysis:</h4>
          {risks.slice(0, 3).map((risk, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                risk.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                risk.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-green-500/20 text-green-300'
              }`}>
                %{risk.probability}
              </span>
              <span className="text-gray-300 text-sm">{risk.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommendation Text */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <p className="text-gray-200 text-sm leading-relaxed">
          {recommendation}
        </p>
      </div>
    </div>
  );
}
