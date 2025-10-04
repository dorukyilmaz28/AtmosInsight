'use client';

import { motion } from 'framer-motion';
import { Brain, CheckCircle, XCircle, AlertTriangle, Sun, Cloud, Wind, Droplets, Thermometer, Zap } from 'lucide-react';

interface ActivityAssessmentProps {
  weatherData: {
    temperature: {
      max: number;
      min: number;
    };
    precipitation: number;
    windSpeed: number;
    humidity: number;
    uvIndex: number;
    weatherCode: number;
  };
  eventType: string;
  location: string;
  date: string;
}

interface ActivityScore {
  score: number;
  level: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Not Recommended';
  color: string;
  factors: {
    temperature: { score: number; reason: string };
    precipitation: { score: number; reason: string };
    wind: { score: number; reason: string };
    uv: { score: number; reason: string };
    overall: { score: number; reason: string };
  };
  recommendations: string[];
  warnings: string[];
}

export default function AIActivityAssessment({ weatherData, eventType, location, date }: ActivityAssessmentProps) {
  
  const assessActivity = (): ActivityScore => {
    const temp = (weatherData.temperature.max + weatherData.temperature.min) / 2;
    const precip = weatherData.precipitation;
    const wind = weatherData.windSpeed;
    const uv = weatherData.uvIndex;
    const humidity = weatherData.humidity;

    // Temperature assessment
    let tempScore = 100;
    let tempReason = '';
    
    if (temp < 0) {
      tempScore = 10;
      tempReason = 'Extremely cold conditions';
    } else if (temp < 5) {
      tempScore = 30;
      tempReason = 'Very cold, dress warmly';
    } else if (temp < 10) {
      tempScore = 50;
      tempReason = 'Cold weather, bring layers';
    } else if (temp < 15) {
      tempScore = 70;
      tempReason = 'Cool weather, comfortable with proper clothing';
    } else if (temp >= 15 && temp <= 25) {
      tempScore = 100;
      tempReason = 'Perfect temperature range';
    } else if (temp <= 30) {
      tempScore = 80;
      tempReason = 'Warm weather, stay hydrated';
    } else if (temp <= 35) {
      tempScore = 50;
      tempReason = 'Hot weather, seek shade frequently';
    } else {
      tempScore = 20;
      tempReason = 'Extremely hot, avoid prolonged exposure';
    }

    // Precipitation assessment
    let precipScore = 100;
    let precipReason = '';
    
    if (precip >= 10) {
      precipScore = 20;
      precipReason = 'Heavy rain expected';
    } else if (precip >= 5) {
      precipScore = 40;
      precipReason = 'Moderate rainfall likely';
    } else if (precip >= 2) {
      precipScore = 60;
      precipReason = 'Light rain possible';
    } else if (precip > 0) {
      precipScore = 80;
      precipReason = 'Minimal precipitation risk';
    } else {
      precipScore = 100;
      precipReason = 'No precipitation expected';
    }

    // Wind assessment
    let windScore = 100;
    let windReason = '';
    
    if (wind >= 30) {
      windScore = 20;
      windReason = 'Very strong winds, dangerous conditions';
    } else if (wind >= 20) {
      windScore = 40;
      windReason = 'Strong winds, challenging conditions';
    } else if (wind >= 15) {
      windScore = 60;
      windReason = 'Moderate winds, some inconvenience';
    } else if (wind >= 8) {
      windScore = 80;
      windReason = 'Light winds, generally pleasant';
    } else {
      windScore = 100;
      windReason = 'Calm conditions, perfect';
    }

    // UV assessment
    let uvScore = 100;
    let uvReason = '';
    
    if (uv >= 11) {
      uvScore = 30;
      uvReason = 'Extreme UV exposure, avoid outdoor activities';
    } else if (uv >= 8) {
      uvScore = 50;
      uvReason = 'Very high UV, limit sun exposure';
    } else if (uv >= 6) {
      uvScore = 70;
      uvReason = 'High UV, use sun protection';
    } else if (uv >= 3) {
      uvScore = 90;
      uvReason = 'Moderate UV, some protection needed';
    } else {
      uvScore = 100;
      uvReason = 'Low UV exposure, safe conditions';
    }

    // Calculate overall score with realistic logic
    let overallScore = Math.round((tempScore + precipScore + windScore + uvScore) / 4);
    
    // Override score for dangerous conditions - be more realistic
    if (precip >= 10 || wind >= 30 || temp >= 35 || temp <= -10) {
      // Dangerous conditions - strongly recommend against going
      overallScore = Math.min(overallScore, 25);
    } else if (precip >= 5 || wind >= 20 || temp >= 30 || temp <= 0) {
      // Challenging conditions - caution advised
      overallScore = Math.min(overallScore, 45);
    }
    
    let level: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Not Recommended';
    let color: string;
    
    if (overallScore >= 90) {
      level = 'Excellent';
      color = 'text-green-400 bg-green-900/30 border-green-600/50';
    } else if (overallScore >= 75) {
      level = 'Good';
      color = 'text-blue-400 bg-blue-900/30 border-blue-600/50';
    } else if (overallScore >= 60) {
      level = 'Fair';
      color = 'text-yellow-400 bg-yellow-900/30 border-yellow-600/50';
    } else if (overallScore >= 40) {
      level = 'Poor';
      color = 'text-orange-400 bg-orange-900/30 border-orange-600/50';
    } else {
      level = 'Not Recommended';
      color = 'text-red-400 bg-red-900/30 border-red-600/50';
    }

    // Generate recommendations and warnings
    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Temperature recommendations
    if (temp >= 35 || temp <= -10) {
      recommendations.push('Consider postponing outdoor event');
      recommendations.push('Extreme temperature conditions - indoor backup essential');
      warnings.push('Extreme temperature conditions may be dangerous');
      warnings.push('Consider rescheduling for safer weather conditions');
    } else if (temp < 10) {
      recommendations.push('Wear warm, layered clothing');
      recommendations.push('Bring hot beverages');
      warnings.push('Risk of hypothermia with prolonged exposure');
    } else if (temp > 30) {
      recommendations.push('Wear light, breathable clothing');
      recommendations.push('Stay hydrated - drink water frequently');
      recommendations.push('Seek shade during peak hours (12-16)');
      warnings.push('Risk of heat exhaustion or heatstroke');
    }

    // Precipitation recommendations
    if (precip >= 10) {
      recommendations.push('Consider postponing outdoor event');
      recommendations.push('Heavy rain expected - indoor backup essential');
      warnings.push('Heavy rain may make outdoor activities unsafe');
      warnings.push('Consider rescheduling for better weather');
    } else if (precip > 5) {
      recommendations.push('Bring waterproof gear and umbrella');
      recommendations.push('Consider indoor backup plan');
      warnings.push('Wet conditions may affect event quality');
    } else if (precip > 0) {
      recommendations.push('Have umbrella ready');
    }

    // Wind recommendations
    if (wind >= 30) {
      recommendations.push('Consider postponing outdoor event');
      recommendations.push('Very strong winds - indoor backup essential');
      warnings.push('Very strong winds may be dangerous for outdoor activities');
      warnings.push('Consider rescheduling for safer conditions');
    } else if (wind > 20) {
      recommendations.push('Secure loose objects and decorations');
      recommendations.push('Consider wind barriers or sheltered areas');
      warnings.push('Strong winds may pose safety risks');
    } else if (wind > 15) {
      recommendations.push('Bring wind-resistant accessories');
    }

    // UV recommendations
    if (uv > 6) {
      recommendations.push('Apply SPF 30+ sunscreen');
      recommendations.push('Wear hat and sunglasses');
      recommendations.push('Seek shade during peak UV hours');
      warnings.push('High UV exposure risk');
    } else if (uv > 3) {
      recommendations.push('Apply sunscreen');
    }

    // Event-specific recommendations
    const eventLower = eventType.toLowerCase();
    if (eventLower.includes('wedding') || eventLower.includes('düğün')) {
      if (wind > 15) {
        recommendations.push('Secure hair and veil accessories');
        recommendations.push('Consider sheltered photo locations');
      }
      if (precip > 2) {
        recommendations.push('Prepare indoor ceremony backup');
        warnings.push('Rain may affect outdoor ceremony plans');
      }
    } else if (eventLower.includes('picnic') || eventLower.includes('piknik')) {
      if (precip > 1) {
        recommendations.push('Bring waterproof picnic blanket');
        recommendations.push('Pack food in waterproof containers');
      }
      if (wind > 10) {
        recommendations.push('Choose sheltered picnic spot');
      }
    } else if (eventLower.includes('sport') || eventLower.includes('spor')) {
      if (wind > 20) {
        recommendations.push('Adjust game strategy for wind conditions');
        warnings.push('Wind may significantly affect gameplay');
      }
      if (temp > 30) {
        recommendations.push('Schedule regular hydration breaks');
        recommendations.push('Consider playing during cooler hours');
      }
    }

    return {
      score: overallScore,
      level,
      color,
      factors: {
        temperature: { score: tempScore, reason: tempReason },
        precipitation: { score: precipScore, reason: precipReason },
        wind: { score: windScore, reason: windReason },
        uv: { score: uvScore, reason: uvReason },
        overall: { score: overallScore, reason: `${level} conditions for ${eventType}` }
      },
      recommendations,
      warnings
    };
  };

  const assessment = assessActivity();

  const getIcon = (level: string) => {
    switch (level) {
      case 'Excellent':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'Good':
        return <CheckCircle className="w-6 h-6 text-blue-400" />;
      case 'Fair':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case 'Poor':
        return <AlertTriangle className="w-6 h-6 text-orange-400" />;
      case 'Not Recommended':
        return <XCircle className="w-6 h-6 text-red-400" />;
      default:
        return <Brain className="w-6 h-6 text-gray-400" />;
    }
  };

  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case 'temperature':
        return <Thermometer className="w-4 h-4" />;
      case 'precipitation':
        return <Droplets className="w-4 h-4" />;
      case 'wind':
        return <Wind className="w-4 h-4" />;
      case 'uv':
        return <Sun className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gradient-to-r from-purple-800/50 via-blue-800/50 to-indigo-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-purple-600/30 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/90 via-blue-600/90 to-indigo-600/90 backdrop-blur-sm p-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="bg-white/20 rounded-xl p-2 sm:p-3">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">AI Activity Assessment</h2>
            <p className="text-purple-100 text-sm sm:text-base">{eventType} - {location} - {date}</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-white/5 backdrop-blur-sm">
        {/* Overall Assessment */}
        <div className="mb-6 sm:mb-8">
          <div className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl border backdrop-blur-sm ${assessment.color}`}>
            {getIcon(assessment.level)}
            <div className="ml-2 sm:ml-3">
              <div className="text-base sm:text-lg font-bold">{assessment.level}</div>
              <div className="text-xs sm:text-sm opacity-90">Overall Score: {assessment.score}/100</div>
            </div>
          </div>
        </div>

        {/* Detailed Factors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {Object.entries(assessment.factors).map(([factor, data]) => (
            <div key={factor} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                {getFactorIcon(factor)}
                <span className="font-semibold text-white capitalize text-sm sm:text-base">{factor}</span>
                <div className="ml-auto">
                  <span className="text-base sm:text-lg font-bold text-white">{data.score}</span>
                  <span className="text-xs sm:text-sm text-gray-400">/100</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-300">{data.reason}</p>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {assessment.recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {assessment.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 bg-green-900/20 backdrop-blur-sm rounded-lg p-3 border border-green-600/30">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-green-200 text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {assessment.warnings.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-400 mr-2" />
              Important Warnings
            </h3>
            <div className="space-y-2">
              {assessment.warnings.map((warning, index) => (
                <div key={index} className="flex items-start space-x-3 bg-orange-900/20 backdrop-blur-sm rounded-lg p-3 border border-orange-600/30">
                  <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span className="text-orange-200 text-sm">{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
