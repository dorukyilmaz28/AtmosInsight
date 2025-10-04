'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import EnhancedWeatherSearch from '@/components/EnhancedWeatherSearch';
import AIRecommendationCard from '@/components/AIRecommendationCard';               
import HourlyWeatherChart from '@/components/HourlyWeatherChart';
import MultiDayWeatherChart from '@/components/MultiDayWeatherChart';
import AIActivityAssessment from '@/components/AIActivityAssessment';
import AdvancedNASAData from '@/components/AdvancedNASAData';
import LoadingSpinner from '@/components/LoadingSpinner';
import DecisionBar from '@/components/DecisionBar';
import { WeatherData } from '@/types/weather';
import { useLanguage } from '@/contexts/LanguageContext';

interface EventData {
  location: string;
  country: string;
  district: string;
  date: string;
  endDate?: string;
  eventType: string;
  thresholds?: {
    veryHot: number;
    veryCold: number;
    veryWindy: number;
    veryWet: number;
    veryUncomfortable: number;
  };
}

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
  decisionScore: number;
}

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMainContent, setShowMainContent] = useState(false);


  const handleWeatherSearch = async (location: string, date: string) => {
    setLoading(true);
    setError(null);
    setWeatherData(null);
    setEventData(null);

    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}&date=${date}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Weather data could not be retrieved');
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSearch = async (eventData: EventData) => {
    setLoading(true);
    setError(null);
    setWeatherData(null);
    setEventData(eventData);
    setAiRecommendation(null);

    try {
      // Build API URL with optional endDate parameter
      let apiUrl = `/api/weather?location=${encodeURIComponent(eventData.location)}&date=${eventData.date}&eventType=${encodeURIComponent(eventData.eventType)}`;
      
      if (eventData.endDate) {
        apiUrl += `&endDate=${eventData.endDate}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Weather data could not be retrieved');
      }

      const data = await response.json();
      setWeatherData(data);
      
      // Generate detailed AI recommendation based on NASA data analysis
      const temp = data.weather.temperature.max;
      const wind = data.weather.windSpeed;
      const precip = data.weather.precipitation;
      const humidity = data.weather.humidity;
      
      // Calculate weather risk probabilities - more realistic approach
      const hotRisk = temp > 40 ? 60 : temp > 35 ? 40 : temp > 30 ? 20 : temp > 25 ? 10 : 5;
      const coldRisk = temp < -5 ? 70 : temp < 0 ? 50 : temp < 5 ? 30 : temp < 10 ? 15 : 5;
      const windyRisk = wind > 40 ? 50 : wind > 30 ? 30 : wind > 20 ? 20 : wind > 15 ? 10 : 5;
      const wetRisk = precip > 20 ? 80 : precip > 15 ? 70 : precip > 10 ? 60 : precip > 5 ? 40 : 5;
      const uncomfortableRisk = humidity > 90 && temp > 30 ? 40 : humidity > 80 && temp > 25 ? 25 : 10;
      
      // Calculate overall risk - more balanced
      const riskFactors = [hotRisk, coldRisk, windyRisk, wetRisk, uncomfortableRisk];
      const overallRisk = riskFactors.reduce((sum, risk) => sum + risk, 0) / riskFactors.length;
      
      const confidence = Math.max(70, 90 - overallRisk);
      
      // Calculate decision score based on AI Activity Assessment logic
      // Use the same scoring system as AIActivityAssessment component
      const avgTemp = (data.weather.temperature.max + data.weather.temperature.min) / 2;
      const precipAmount = data.weather.precipitation;
      const windSpeed = data.weather.windSpeed;
      const uvIndex = data.weather.uvIndex;
      
      // Temperature score (same as AIActivityAssessment)
      let tempScore = 100;
      if (avgTemp < 0) tempScore = 10;
      else if (avgTemp < 5) tempScore = 30;
      else if (avgTemp < 10) tempScore = 50;
      else if (avgTemp < 15) tempScore = 70;
      else if (avgTemp >= 15 && avgTemp <= 25) tempScore = 100;
      else if (avgTemp <= 30) tempScore = 80;
      else if (avgTemp <= 35) tempScore = 50;
      else tempScore = 20;
      
      // Precipitation score (same as AIActivityAssessment)
      let precipScore = 100;
      if (precipAmount >= 10) precipScore = 20;
      else if (precipAmount >= 5) precipScore = 40;
      else if (precipAmount >= 2) precipScore = 60;
      else if (precipAmount > 0) precipScore = 80;
      else precipScore = 100;
      
      // Wind score (same as AIActivityAssessment)
      let windScore = 100;
      if (windSpeed >= 30) windScore = 20;
      else if (windSpeed >= 20) windScore = 40;
      else if (windSpeed >= 15) windScore = 60;
      else if (windSpeed >= 8) windScore = 80;
      else windScore = 100;
      
      // UV score (same as AIActivityAssessment)
      let uvScore = 100;
      if (uvIndex >= 11) uvScore = 30;
      else if (uvIndex >= 8) uvScore = 50;
      else if (uvIndex >= 6) uvScore = 70;
      else if (uvIndex >= 3) uvScore = 90;
      else uvScore = 100;
      
      // Calculate overall score with more realistic logic
      let decisionScore = Math.round((tempScore + precipScore + windScore + uvScore) / 4);
      
      // Override score for dangerous conditions - be more realistic
      if (precipAmount >= 10 || windSpeed >= 30 || avgTemp >= 35 || avgTemp <= -10) {
        // Dangerous conditions - strongly recommend against going
        decisionScore = Math.min(decisionScore, 25);
      } else if (precipAmount >= 5 || windSpeed >= 20 || avgTemp >= 30 || avgTemp <= 0) {
        // Challenging conditions - caution advised
        decisionScore = Math.min(decisionScore, 45);
      }
      
      // Generate optimal time suggestions based on weather conditions
      const getOptimalTimes = () => {
        const times = [];
        
        // Don't suggest optimal times for dangerous conditions
        if (precipAmount >= 10 || windSpeed >= 30 || avgTemp >= 35 || avgTemp <= -10) {
          return ["Weather conditions are too challenging for optimal timing recommendations"];
        } else if (precipAmount >= 5 || windSpeed >= 20 || avgTemp >= 30 || avgTemp <= 0) {
          return ["Consider postponing or choosing indoor alternatives"];
        }
        
        // Only suggest optimal times for good conditions
        if (temp < 25 && temp > 15) {
          times.push("09:00-12:00 (morning hours - warm sun)");
          times.push("15:00-18:00 (afternoon - ideal temperature)");
        } else if (temp > 25) {
          times.push("08:00-11:00 (early hours - not too hot yet)");
          times.push("17:00-19:00 (evening hours - sunset)");
        } else {
          times.push("11:00-15:00 (daytime hours - warmest time)");
          times.push("16:00-18:00 (afternoon)");
        }
        return times;
      };

      const getWeatherMood = () => {
        if (decisionScore >= 80) return "good";
        if (decisionScore >= 65) return "moderate";
        if (decisionScore >= 50) return "challenging";
        return "poor";
      };

      const getActivityAdvice = () => {
        // First check for dangerous conditions - be realistic
        if (precipAmount >= 10 || windSpeed >= 30 || avgTemp >= 35 || avgTemp <= -10) {
          return "Weather conditions are challenging and may not be suitable for outdoor activities.";
        } else if (precipAmount >= 5 || windSpeed >= 20 || avgTemp >= 30 || avgTemp <= 0) {
          return "Weather conditions require extra precautions and careful planning.";
        }
        
        // Only give positive advice for good conditions
        if (eventData.eventType.toLowerCase().includes('picnic') || eventData.eventType.toLowerCase().includes('piknik')) {
          if (temp > 25) return "Choose a shaded area and bring plenty of water. Don't forget to wear a sun hat.";
          if (temp < 10) return "Don't forget to bring hot beverages and blankets.";
          return "Perfect weather for a picnic! You'll have a wonderful day.";
        } else if (eventData.eventType.toLowerCase().includes('wedding') || eventData.eventType.toLowerCase().includes('düğün')) {
          if (wind > 15) return "Don't forget to protect your hairstyle from the wind.";
          if (precip > 5) return "Have an alternative indoor venue plan ready.";
          return "Wonderful weather for your wedding! You can take amazing photos.";
        } else if (eventData.eventType.toLowerCase().includes('sport') || eventData.eventType.toLowerCase().includes('spor')) {
          if (temp > 30) return "Play during early hours and take regular breaks.";
          if (wind > 20) return "Wind may affect the ball game, be careful.";
          return "Perfect weather conditions for sports!";
        }
        return "It will be a beautiful day for your event!";
      };

      const optimalTimes = getOptimalTimes();
      const weatherMood = getWeatherMood();
      const activityAdvice = getActivityAdvice();

      // Generate recommendation text based on date range
      const dateRangeText = eventData.endDate && eventData.endDate !== eventData.date 
        ? `${eventData.date} - ${eventData.endDate}`
        : `${eventData.date}`;
      
      const isMultiDay = eventData.endDate && eventData.endDate !== eventData.date;
      
      // More realistic greeting based on decision score
      const getGreeting = () => {
        if (decisionScore >= 80) {
          return `Hello! The weather for ${eventData.location}${eventData.district ? `, ${eventData.district}` : ''} on ${dateRangeText} looks ${weatherMood}. `;
        } else if (decisionScore >= 65) {
          return `Hello! The weather for ${eventData.location}${eventData.district ? `, ${eventData.district}` : ''} on ${dateRangeText} looks ${weatherMood}. `;
        } else if (decisionScore >= 50) {
          return `Hello! The weather for ${eventData.location}${eventData.district ? `, ${eventData.district}` : ''} on ${dateRangeText} looks ${weatherMood}. `;
        } else {
          return `Hello! The weather for ${eventData.location}${eventData.district ? `, ${eventData.district}` : ''} on ${dateRangeText} looks ${weatherMood}. `;
        }
      };
      
      let recommendationText = getGreeting();
      
      if (isMultiDay && weatherData?.dailyData) {
        const dailyData = weatherData.dailyData;
        const tempRange = {
          max: Math.max(...dailyData.temperature_2m_max),
          min: Math.min(...dailyData.temperature_2m_min)
        };
        const totalPrecip = dailyData.precipitation_sum.reduce((a: number, b: number) => a + b, 0);
        const maxWind = Math.max(...dailyData.windspeed_10m_max);
        
        recommendationText += `\n\n📊 ${eventData.endDate && new Date(eventData.endDate).getTime() - new Date(eventData.date).getTime() > 0 ? 
          Math.ceil((new Date(eventData.endDate).getTime() - new Date(eventData.date).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 1}-day weather forecast:
• Temperature: ${tempRange.min}°C - ${tempRange.max}°C
• Total precipitation: ${totalPrecip.toFixed(1)}mm
• Highest wind: ${maxWind.toFixed(1)} km/h

${activityAdvice}`;
      } else {
        recommendationText += `\n\nToday's temperature will be ${temp}°C. ${activityAdvice}`;
      }
      
      recommendationText += `\n\nOptimal times:
${optimalTimes.map(time => `• ${time}`).join('\n')}`;

      // More realistic conclusion based on decision score
      if (decisionScore >= 80) {
        recommendationText += `\n\nGood news! It's a suitable day for your event. According to NASA data, there's a ${Math.round(100 - decisionScore)}% risk but it's manageable.`;
      } else if (decisionScore >= 65) {
        recommendationText += `\n\nBe careful: ${Math.round(100 - decisionScore)}% risk exists. You can go by taking precautions.`;
      } else {
        recommendationText += `\n\nOur recommendation: Due to ${Math.round(100 - decisionScore)}% risk, it might be better to postpone the event.`;
      }

      // Realistic weather warnings
      if (precipAmount >= 10) {
        recommendationText += `\n\n⚠️ HEAVY RAIN WARNING: ${precipAmount.toFixed(1)}mm expected. Consider postponing outdoor activities.`;
      } else if (precipAmount > 5) {
        recommendationText += `\n\nHigh chance of rain, bring umbrella and raincoat.`;
      } else if (precipAmount > 0) {
        recommendationText += `\n\nLight rain possible, don't forget your umbrella.`;
      }
      
      if (windSpeed >= 30) {
        recommendationText += `\n\n⚠️ VERY STRONG WINDS: ${windSpeed.toFixed(1)} km/h expected. Dangerous conditions - consider postponing.`;
      } else if (windSpeed >= 20) {
        recommendationText += `\n\nStrong winds expected (${windSpeed.toFixed(1)} km/h), be careful.`;
      } else if (windSpeed >= 15) {
        recommendationText += `\n\nWindy weather, protect your hairstyle.`;
      }
      
      if (avgTemp >= 35) {
        recommendationText += `\n\n⚠️ EXTREME HEAT: ${avgTemp.toFixed(1)}°C expected. Dangerous conditions - avoid outdoor activities.`;
      } else if (avgTemp <= -10) {
        recommendationText += `\n\n⚠️ EXTREME COLD: ${avgTemp.toFixed(1)}°C expected. Dangerous conditions - avoid outdoor activities.`;
      } else if (avgTemp >= 30) {
        recommendationText += `\n\nVery hot weather expected (${avgTemp.toFixed(1)}°C), don't forget to drink plenty of water.`;
      } else if (avgTemp <= 0) {
        recommendationText += `\n\nCold weather (${avgTemp.toFixed(1)}°C), wear warm clothes.`;
      }

      const mockRecommendation: AIRecommendation = {
        recommendation: recommendationText,
        confidence: Math.floor(confidence),
        decisionScore: Math.floor(decisionScore),
        risks: [
          {
            type: 'hot' as const,
            probability: hotRisk,
            severity: (hotRisk > 70 ? 'high' : hotRisk > 40 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
            description: hotRisk > 70 ? `Very hot! ${hotRisk}% chance of temperature above 30°C expected. Don't forget to drink plenty of water and stay in the shade.` : 
                       hotRisk > 40 ? `Hot weather warning: ${hotRisk}% chance of high temperature. Bring hat and sunscreen.` :
                       `Temperature at normal level. You can be comfortable.`
          },
          {
            type: 'cold' as const,
            probability: coldRisk,
            severity: (coldRisk > 70 ? 'high' : coldRisk > 40 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
            description: coldRisk > 70 ? `Cold weather! ${coldRisk}% chance of temperature below 10°C. Wear warm clothes.` :
                       coldRisk > 40 ? `Cool weather: ${coldRisk}% chance it might be cold. Bring jacket or sweater.` :
                       `Temperature at comfortable level.`
          },
          {
            type: 'windy' as const,
            probability: windyRisk,
            severity: (windyRisk > 70 ? 'high' : windyRisk > 40 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
            description: windyRisk > 70 ? `Strong wind! ${windyRisk}% chance of wind above 15 km/h. Protect your hair and belongings.` :
                       windyRisk > 40 ? `Windy weather: ${windyRisk}% chance of wind.` :
                       `Wind is light, you can be comfortable.`
          },
          {
            type: 'wet' as const,
            probability: wetRisk,
            severity: (wetRisk > 70 ? 'high' : wetRisk > 40 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
            description: wetRisk > 70 ? `Rain risk! ${wetRisk}% chance of rain. Bring umbrella and raincoat.` :
                       wetRisk > 40 ? `Light rain: ${wetRisk}% chance of precipitation. Consider bringing umbrella.` :
                       `Low rain risk.`
          },
          {
            type: 'uncomfortable' as const,
            probability: uncomfortableRisk,
            severity: (uncomfortableRisk > 70 ? 'high' : uncomfortableRisk > 40 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
            description: uncomfortableRisk > 70 ? `Uncomfortable weather: ${uncomfortableRisk}% chance that humidity and temperature combination might be challenging.` :
                       uncomfortableRisk > 40 ? `Mild discomfort: ${uncomfortableRisk}% chance of humid weather.` :
                       `Weather conditions are comfortable.`
          }
        ].filter(risk => risk.probability > 15),
        alternativeDays: ['2024-06-15', '2024-06-20', '2024-06-25', '2024-06-30'],
        summary: isMultiDay && weatherData?.dailyData ? 
          `${Math.ceil((new Date(eventData.endDate!).getTime() - new Date(eventData.date).getTime()) / (1000 * 60 * 60 * 24)) + 1}-Day Weather Summary: Temperature ${Math.min(...weatherData.dailyData.temperature_2m_min)}°C - ${Math.max(...weatherData.dailyData.temperature_2m_max)}°C | Total Precipitation ${weatherData.dailyData.precipitation_sum.reduce((a: number, b: number) => a + b, 0).toFixed(1)}mm | Highest Wind ${Math.max(...weatherData.dailyData.windspeed_10m_max).toFixed(1)} km/h` :
          `Weather Summary: ${temp}°C (${temp > 25 ? 'Hot' : temp < 10 ? 'Cold' : 'Mild'}) | Wind ${wind} km/h (${wind > 20 ? 'Strong' : wind > 10 ? 'Moderate' : 'Light'}) | Precipitation ${precip}mm (${precip > 10 ? 'Heavy' : precip > 5 ? 'Moderate' : 'Light'}) | Humidity ${humidity}% (${humidity > 80 ? 'High' : humidity > 60 ? 'Moderate' : 'Low'})`
      };
      
      setAiRecommendation(mockRecommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };


  const handleDownload = (format: 'json' | 'csv') => {
    if (!weatherData || !eventData) return;
    
    const metadata = {
      generatedAt: new Date().toISOString(),
      dataSource: "NASA Earth Observation Data",
      analysisTool: "Outdoor Event Weather Assistant",
      version: "1.0.0",
      dataSources: [
        "NASA GES DISC (Global Earth Science Data and Information System)",
        "MERRA-2 (Modern-Era Retrospective Analysis for Research and Applications)",
        "GPM (Global Precipitation Measurement)",
        "MODIS (Moderate Resolution Imaging Spectroradiometer)",
        "AI Analysis Model"
      ],
      units: {
        temperature: "Celsius (°C)",
        windSpeed: "kilometers per hour (km/h)",
        precipitation: "millimeters (mm)",
        humidity: "percentage (%)",
        probability: "percentage (%)"
      },
      location: {
        city: eventData.location,
        district: eventData.district,
        country: eventData.country,
        coordinates: weatherData.location?.coordinates
      }
    };

    const data = {
      metadata,
      query: {
        location: `${eventData.location}${eventData.district ? `, ${eventData.district}` : ''}, ${eventData.country}`,
        date: eventData.date,
        eventType: eventData.eventType,
        thresholds: eventData.thresholds
      },
      weather: weatherData,
      aiRecommendation: aiRecommendation,
      sourceLinks: [
        "https://disc.gsfc.nasa.gov/",
        "https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/",
        "https://gpm.nasa.gov/",
        "https://modis.gsfc.nasa.gov/"
      ]
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nasa-weather-analysis-${eventData.location.replace(/\s+/g, '-')}-${eventData.date}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const csv = `Location,Date,Event Type,Temperature (C),Wind Speed (km/h),Precipitation (mm),Humidity (%),Hot Risk (%),Cold Risk (%),Windy Risk (%),Wet Risk (%),Uncomfortable Risk (%),Overall Risk (%),Confidence (%)\n"${eventData.location},${eventData.district},${eventData.country}",${eventData.date},${eventData.eventType},${weatherData.weather.temperature.max},${weatherData.weather.windSpeed},${weatherData.weather.precipitation},${weatherData.weather.humidity},${aiRecommendation?.risks.find(r => r.type === 'hot')?.probability || 0},${aiRecommendation?.risks.find(r => r.type === 'cold')?.probability || 0},${aiRecommendation?.risks.find(r => r.type === 'windy')?.probability || 0},${aiRecommendation?.risks.find(r => r.type === 'wet')?.probability || 0},${aiRecommendation?.risks.find(r => r.type === 'uncomfortable')?.probability || 0},${Math.max(...(aiRecommendation?.risks.map(r => r.probability) || [0]))},${aiRecommendation?.confidence || 0}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nasa-weather-analysis-${eventData.location.replace(/\s+/g, '-')}-${eventData.date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <Header />

      {!showMainContent ? (
        /* Landing Page */
        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Hero Section */}
            <div className="mb-12">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white mb-4 sm:mb-6 tracking-tight px-2"
              >
                Outdoor Event
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-medium">
                  Weather Assistant
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4"
              >
                Advanced NASA data analysis for intelligent outdoor event planning
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="inline-flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-white/20 shadow-lg text-sm sm:text-base"
              >
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
                <span className="text-white font-medium">Powered by NASA Data & AI</span>
              </motion.div>
            </div>


            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              onClick={() => setShowMainContent(true)}
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-medium hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-500/25 border border-cyan-400/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                Start Analysis
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </motion.button>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-8"
          >
                {/* Search Form */}
                <div className="max-w-4xl mx-auto px-2">
                  <EnhancedWeatherSearch onSearch={handleEventSearch} loading={loading} />
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="flex justify-center">
                    <LoadingSpinner />
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                  >
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                      <div className="text-red-600 text-lg font-medium mb-2">⚠️ Error</div>
                      <p className="text-red-700 mb-4">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Decision Bar */}
                {aiRecommendation && eventData && (
                  <div className="max-w-4xl mx-auto mb-4 sm:mb-8 px-2">
                    <DecisionBar
                      score={aiRecommendation.decisionScore}
                      recommendation={aiRecommendation.recommendation}
                      risks={aiRecommendation.risks}
                    />
                  </div>
                )}

                {/* AI Recommendation */}
                {aiRecommendation && eventData && (
                  <div className="max-w-4xl mx-auto px-2">
                    <AIRecommendationCard
                      recommendation={aiRecommendation}
                      location={`${eventData.location}${eventData.district ? `, ${eventData.district}` : ''}, ${eventData.country}`}
                      date={eventData.date}
                      eventType={eventData.eventType}
                      onDownload={handleDownload}
                    />
                  </div>
                )}

                {/* AI Activity Assessment */}
                {weatherData && eventData && (
                  <div className="max-w-4xl mx-auto">
                    <AIActivityAssessment
                      weatherData={{
                        temperature: weatherData.weather.temperature,
                        precipitation: weatherData.weather.precipitation,
                        windSpeed: weatherData.weather.windSpeed,
                        humidity: weatherData.weather.humidity,
                        uvIndex: weatherData.weather.uvIndex,
                        weatherCode: weatherData.weather.weatherCode
                      }}
                      eventType={eventData.eventType}
                      location={eventData.location}
                      date={eventData.date}
                    />
                  </div>
                )}

                {/* Dynamic Weather Chart */}
                {weatherData && eventData && (
                  <div className="max-w-6xl mx-auto space-y-8">
                    {eventData.endDate ? (
                      // Multi-day chart for date ranges
                      <MultiDayWeatherChart
                        startDate={eventData.date}
                        endDate={eventData.endDate}
                        location={eventData.location}
                        weatherData={weatherData}
                        onDownload={handleDownload}
                      />
                    ) : (
                      // Hourly chart for single day
                      <HourlyWeatherChart
                        currentData={{
                          date: eventData.date,
                          temperature: (weatherData.weather.temperature.max + weatherData.weather.temperature.min) / 2,
                          windSpeed: weatherData.weather.windSpeed,
                          precipitation: weatherData.weather.precipitation,
                          humidity: weatherData.weather.humidity,
                          comfortIndex: weatherData.comfortIndex.score,
                          uvIndex: weatherData.weather.uvIndex
                        }}
                        location={eventData.location}
                        targetDate={eventData.date}
                        onDownload={handleDownload}
                      />
                    )}


                    {/* Advanced NASA Data Sources */}
                    <AdvancedNASAData
                      location={eventData.location}
                      coordinates={{
                        lat: weatherData.location.coordinates.latitude,
                        lon: weatherData.location.coordinates.longitude
                      }}
                      date={eventData.date}
                      endDate={eventData.endDate}
                    />
                  </div>
                )}
          </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
