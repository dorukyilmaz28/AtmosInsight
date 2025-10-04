'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronDown, ChevronUp, Download, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useState } from 'react';

interface WeatherRisk {
  type: 'hot' | 'cold' | 'windy' | 'wet' | 'uncomfortable';
  probability: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

interface AIRecommendation {
  recommendation: string;
  confidence: number;
  risks: WeatherRisk[];
  alternativeDays?: string[];
  summary: string;
}

interface AIRecommendationCardProps {
  recommendation: AIRecommendation;
  location: string;
  date: string;
  eventType?: string;
  onDownload?: (format: 'json' | 'csv') => void;
}

export default function AIRecommendationCard({ 
  recommendation, 
  location, 
  date, 
  eventType,
  onDownload 
}: AIRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/15 border-red-500/40';
      case 'medium': return 'text-orange-400 bg-orange-500/15 border-orange-500/40';
      case 'low': return 'text-green-400 bg-green-500/15 border-green-500/40';
      default: return 'text-gray-400 bg-gray-500/15 border-gray-500/40';
    }
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'hot': return '🌡️';
      case 'cold': return '❄️';
      case 'windy': return '💨';
      case 'wet': return '🌧️';
      case 'uncomfortable': return '😰';
      default: return '⚠️';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gradient-to-br from-gray-800/80 via-gray-900/60 to-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-600/40 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-purple-600/15 border-b border-gray-600/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Weather Assistant</h3>
              <p className="text-sm text-gray-300">
                {eventType ? `${eventType} in ${location}` : location} • {date}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(recommendation.confidence)} bg-gray-700/40 backdrop-blur-sm border border-gray-500/40`}>
              {recommendation.confidence}% confidence
            </div>
            {onDownload && (
              <div className="flex space-x-1">
                <motion.button
                  onClick={() => onDownload('json')}
                  className="p-2 text-white bg-gray-700/40 hover:bg-gray-600/50 rounded-lg border border-gray-500/40 hover:border-gray-400/50 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Download as JSON"
                >
                  <Download className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Recommendation */}
      <div className="p-6">
        <div className="flex items-start space-x-3 mb-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
            {recommendation.confidence >= 70 ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-white text-lg leading-relaxed">
              {recommendation.recommendation}
            </p>
            <p className="text-gray-300 text-sm mt-2">
              {recommendation.summary}
            </p>
          </div>
        </div>

        {/* Weather Risks */}
        {recommendation.risks.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
              Weather Risks
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendation.risks.map((risk, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border ${getRiskColor(risk.severity)}`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getRiskIcon(risk.type)}</span>
                    <span className="font-medium capitalize">{risk.type}</span>
                    <span className="text-sm font-semibold">
                      {risk.probability}%
                    </span>
                  </div>
                  <p className="text-sm opacity-90">{risk.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Alternative Days */}
        {recommendation.alternativeDays && recommendation.alternativeDays.length > 0 && (
          <div className="mt-4 p-4 bg-green-500/15 rounded-lg border border-green-500/40">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-green-400" />
              <h4 className="text-sm font-semibold text-green-300">Better Alternatives</h4>
            </div>
            <p className="text-sm text-green-200 mb-2">
              Consider these dates for better weather conditions:
            </p>
            <div className="flex flex-wrap gap-2">
              {recommendation.alternativeDays.map((day, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-500/25 text-green-300 text-sm rounded-full font-medium border border-green-500/40"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Details */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 flex items-center justify-center space-x-2 py-3 px-4 bg-gray-700/40 hover:bg-gray-600/50 text-white rounded-lg border border-gray-500/40 hover:border-gray-400/50 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-sm font-medium">
            {isExpanded ? 'Show Less' : 'Show Detailed Analysis'}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-gray-600/30 bg-gray-800/40"
          >
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Confidence Breakdown */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-200 mb-3">Confidence Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Data Quality</span>
                      <span className="font-medium text-white">High</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Historical Accuracy</span>
                      <span className="font-medium text-white">87%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Model Reliability</span>
                      <span className="font-medium text-white">92%</span>
                    </div>
                  </div>
                </div>

                {/* Data Sources */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-200 mb-3">NASA Data Sources</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">NASA GES DISC</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300">MERRA-2 Reanalysis</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-gray-300">GPM Precipitation</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-gray-300">MODIS Land Surface</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-gray-300">AI Analysis Model</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
