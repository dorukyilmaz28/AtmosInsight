'use client';

import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Activity, 
  Loader2, 
  Settings,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface EventData {
  location: string;
  country: string;
  district: string;
  date: string;
  endDate?: string; // Optional end date for date range
  eventType: string;
}

interface WeatherThresholds {
  veryHot: number;      // Temperature threshold for "very hot"
  veryCold: number;     // Temperature threshold for "very cold"
  veryWindy: number;    // Wind speed threshold for "very windy"
  veryWet: number;      // Precipitation threshold for "very wet"
  veryUncomfortable: number; // Combined threshold for "very uncomfortable"
}

interface EnhancedWeatherSearchProps {
  onSearch: (data: EventData & { thresholds: WeatherThresholds }) => void;
  loading?: boolean;
}

const eventTypes = [
  { value: 'hiking', label: 'Hiking', icon: '🥾', description: 'Trail walking and nature exploration' },
  { value: 'picnic', label: 'Picnic', icon: '🧺', description: 'Outdoor dining and relaxation' },
  { value: 'fishing', label: 'Fishing', icon: '🎣', description: 'Angling and water activities' },
  { value: 'camping', label: 'Camping', icon: '⛺', description: 'Overnight outdoor stays' },
  { value: 'outdoor-event', label: 'Outdoor Event', icon: '🎪', description: 'Festivals, concerts, gatherings' },
  { value: 'sports', label: 'Sports', icon: '⚽', description: 'Athletic activities and games' },
  { value: 'photography', label: 'Photography', icon: '📸', description: 'Outdoor photo sessions' },
  { value: 'wedding', label: 'Wedding', icon: '💒', description: 'Outdoor ceremonies and receptions' },
  { value: 'festival', label: 'Festival', icon: '🎭', description: 'Cultural and music festivals' },
  { value: 'beach', label: 'Beach', icon: '🏖️', description: 'Coastal and water activities' },
  { value: 'other', label: 'Other', icon: '🌤️', description: 'Custom outdoor activity' }
];

const defaultThresholds: WeatherThresholds = {
  veryHot: 35,
  veryCold: 0,
  veryWindy: 25,
  veryWet: 10,
  veryUncomfortable: 70
};

export default function EnhancedWeatherSearch({ onSearch, loading = false }: EnhancedWeatherSearchProps) {
  const [formData, setFormData] = useState<EventData>({
    location: '',
    country: 'Turkey', // Default to Turkey
    district: '',
    date: '',
    endDate: '',
    eventType: 'hiking'
  });

  const [thresholds, setThresholds] = useState<WeatherThresholds>(defaultThresholds);
  const [errors, setErrors] = useState<Partial<EventData>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useDateRange, setUseDateRange] = useState(false);

  // Auto-detect user's country
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_name) {
          setFormData(prev => ({ ...prev, country: data.country_name }));
        }
      } catch (error) {
        console.log('Could not detect country, using default');
      }
    };
    detectCountry();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Partial<EventData> = {};
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.date) newErrors.date = 'Date is required';
    
    // Validate end date if using date range
    if (useDateRange) {
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required for date range';
      } else {
        const startDate = new Date(formData.date);
        const endDate = new Date(formData.endDate);
        
        if (endDate <= startDate) {
          newErrors.endDate = 'End date must be after start date';
        }
        
        // Limit to 7 days max
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 7) {
          newErrors.endDate = 'Date range cannot exceed 7 days';
        }
      }
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSearch({ ...formData, thresholds });
    }
  };

  const handleInputChange = (field: keyof EventData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleThresholdChange = (field: keyof WeatherThresholds, value: number) => {
    setThresholds(prev => ({ ...prev, [field]: value }));
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    const year = maxDate.getFullYear();
    const month = String(maxDate.getMonth() + 1).padStart(2, '0');
    const day = String(maxDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const resetThresholds = () => {
    setThresholds(defaultThresholds);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-4 sm:p-6 lg:p-8"
    >
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-white mb-2 sm:mb-3 tracking-tight px-2">Enhanced Weather Analysis</h2>
        <p className="text-gray-300 text-sm sm:text-base lg:text-lg px-4">Advanced NASA data analysis for intelligent outdoor event planning</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Location Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              <MapPin className="w-4 h-4 inline mr-2 text-cyan-400" />
              City/Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter city, address, or landmark..."
                className={`w-full px-4 py-3 pl-12 bg-white/5 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 text-white placeholder-gray-400 ${
                  errors.location ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:border-cyan-400/50'
                }`}
              />
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            </div>
            {errors.location && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm mt-1"
              >
                {errors.location}
              </motion.p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Country"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200 hover:border-cyan-400/50 text-white placeholder-gray-400"
              />
            </div>

            {/* District (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                District <span className="text-gray-400 text-sm">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                placeholder="District (Optional)"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200 hover:border-cyan-400/50 text-white placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Date Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              <Calendar className="w-4 h-4 inline mr-2 text-cyan-400" />
              Date Selection
            </label>
            
            {/* Date Range Toggle */}
            <div className="flex items-center space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setUseDateRange(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !useDateRange
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                Single Day
              </button>
              <button
                type="button"
                onClick={() => setUseDateRange(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  useDateRange
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                Date Range
              </button>
            </div>

            {/* Date Inputs */}
            <div className={`grid gap-4 ${useDateRange ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Start Date */}
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={getCurrentDate()}
                  max={getMaxDate()}
                  className={`w-full px-4 py-3 pl-12 bg-gray-800/50 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200 text-white ${
                    errors.date ? 'border-red-400 bg-red-500/10' : 'border-gray-600/30 hover:border-cyan-400/50'
                  }`}
                />
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                <label className="absolute -top-2 left-3 px-2 bg-gray-900 text-xs text-gray-300">
                  {useDateRange ? 'Start Date' : 'Event Date'}
                </label>
                {errors.date && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm mt-1"
                  >
                    {errors.date}
                  </motion.p>
                )}
              </div>

              {/* End Date (only show if using date range) */}
              {useDateRange && (
                <div className="relative">
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={formData.date || getCurrentDate()}
                    max={getMaxDate()}
                    className={`w-full px-4 py-3 pl-12 bg-gray-800/50 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200 text-white ${
                      errors.endDate ? 'border-red-400 bg-red-500/10' : 'border-gray-600/30 hover:border-cyan-400/50'
                    }`}
                  />
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                  <label className="absolute -top-2 left-3 px-2 bg-gray-900 text-xs text-gray-300">
                    End Date
                  </label>
                  {errors.endDate && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm mt-1"
                    >
                      {errors.endDate}
                    </motion.p>
                  )}
                </div>
              )}
            </div>

            {/* Date Range Info */}
            {useDateRange && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg"
              >
                <p className="text-blue-200 text-sm">
                  📅 Date range analysis will show multi-day weather patterns and trends
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Event Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            <Activity className="w-4 h-4 inline mr-2 text-cyan-400" />
            Event Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {eventTypes.map((event) => (
              <motion.button
                key={event.value}
                type="button"
                onClick={() => handleInputChange('eventType', event.value)}
                className={`p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 text-center group ${
                  formData.eventType === event.value
                    ? 'border-cyan-500 bg-cyan-500/20 text-white shadow-lg shadow-cyan-500/25'
                    : 'border-gray-600/30 bg-gray-800/50 hover:border-cyan-400/50 hover:bg-cyan-500/20 text-gray-300 hover:text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title={event.description}
              >
                <div className="text-xl sm:text-2xl mb-1">{event.icon}</div>
                <div className="text-xs font-medium">{event.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Event Type Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            <Activity className="w-4 h-4 inline mr-2 text-cyan-400" />
            Custom Event Type
          </label>
          <input
            type="text"
            value={formData.eventType}
            onChange={(e) => handleInputChange('eventType', e.target.value)}
            placeholder="Enter your custom event type..."
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200 hover:border-cyan-400/50 text-white placeholder-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            Type your own event type or select from the options above
          </p>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700/50 border border-gray-600/30"
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium">
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </span>
          </button>
        </div>

        {/* Advanced Weather Thresholds */}
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Weather Thresholds</h3>
              <button
                type="button"
                onClick={resetThresholds}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset to Defaults
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Configure what constitutes &quot;very&quot; adverse weather conditions for your analysis.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Very Hot Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Thermometer className="w-4 h-4 inline mr-2" />
                  Very Hot Temperature (°C)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={thresholds.veryHot}
                    onChange={(e) => handleThresholdChange('veryHot', Number(e.target.value))}
                    min="20"
                    max="50"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">°C</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Temperature above this value is considered &quot;very hot&quot;
                </p>
              </div>

              {/* Very Cold Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Thermometer className="w-4 h-4 inline mr-2" />
                  Very Cold Temperature (°C)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={thresholds.veryCold}
                    onChange={(e) => handleThresholdChange('veryCold', Number(e.target.value))}
                    min="-20"
                    max="20"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">°C</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Temperature below this value is considered &quot;very cold&quot;
                </p>
              </div>

              {/* Very Windy Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Wind className="w-4 h-4 inline mr-2" />
                  Very Windy Speed (km/h)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={thresholds.veryWindy}
                    onChange={(e) => handleThresholdChange('veryWindy', Number(e.target.value))}
                    min="10"
                    max="100"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">km/h</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Wind speed above this value is considered &quot;very windy&quot;
                </p>
              </div>

              {/* Very Wet Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Droplets className="w-4 h-4 inline mr-2" />
                  Very Wet Precipitation (mm)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={thresholds.veryWet}
                    onChange={(e) => handleThresholdChange('veryWet', Number(e.target.value))}
                    min="1"
                    max="50"
                    step="0.1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">mm</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Precipitation above this value is considered &quot;very wet&quot;
                </p>
              </div>
            </div>

            {/* Very Uncomfortable Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Very Uncomfortable Risk Score (%)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={thresholds.veryUncomfortable}
                  onChange={(e) => handleThresholdChange('veryUncomfortable', Number(e.target.value))}
                  min="0"
                  max="100"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Combined risk score above this percentage is considered &quot;very uncomfortable&quot;
              </p>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-medium text-white transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base ${
            loading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 shadow-lg hover:shadow-xl hover:shadow-cyan-500/25 border border-cyan-400/30'
          }`}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Weather Data...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Get Probability Analysis</span>
            </>
          )}
        </motion.button>
      </form>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Analysis Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use specific locations for more accurate historical data</li>
          <li>• Adjust thresholds based on your activity&apos;s weather sensitivity</li>
          <li>• Consider checking multiple dates for better planning flexibility</li>
          <li>• NASA data provides 10+ years of historical analysis</li>
        </ul>
      </div>
    </motion.div>
  );
}
