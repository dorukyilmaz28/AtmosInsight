const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { spawn } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Open-Meteo API configuration
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// NASA POWER API configuration
const NASA_POWER_BASE_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';

// AI Recommendation configuration
const AI_SCRIPT_PATH = './ai_recommendation.py';

/**
 * Get NASA POWER data for additional scientific insights
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {string} date - Target date in YYYY-MM-DD format
 * @returns {Object} NASA POWER data
 */
async function getNASAPowerData(latitude, longitude, date) {
  try {
    console.log('Fetching NASA POWER data for:', { latitude, longitude, date });
    
    // NASA POWER API requires YYYYMMDD format
    const nasaDate = date.replace(/-/g, '');
    
    const response = await axios.get(NASA_POWER_BASE_URL, {
      params: {
        parameters: 'T2M_MAX,T2M_MIN,PRECTOT,WS2M,RH2M,ALLSKY_SFC_SW_DWN',
        community: 'RE',
        longitude,
        latitude,
        start: nasaDate,
        end: nasaDate,
        format: 'JSON'
      },
      timeout: 15000
    });

    console.log('NASA POWER data received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching NASA POWER data:', error.message);
    console.error('Full error:', error.response?.data || error);
    // Return null if NASA data fails, don't break the app
    return null;
  }
}

/**
 * Get weather data from Open-Meteo API
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {string} date - Target date in YYYY-MM-DD format
 * @returns {Object} Weather data
 */
async function getWeatherData(latitude, longitude, date) {
  try {
    console.log('Fetching weather data for:', { latitude, longitude, date });
    
    const response = await axios.get(OPEN_METEO_BASE_URL, {
      params: {
        latitude,
        longitude,
        start_date: date,
        end_date: date,
        daily: [
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'windspeed_10m_max',
          'winddirection_10m_dominant',
          'relative_humidity_2m_max',
          'weathercode',
          'uv_index_max',
          'sunset',
          'sunrise'
        ],
        timezone: 'auto'
      },
      timeout: 15000, // 15 saniye timeout
      retry: 2 // 2 kez deneme
    });

    console.log('Weather data received:', response.data);
    
    // Get visibility and pressure data from hourly API
    let visibility = 10; // Default visibility in km
    let pressure = 1013; // Default pressure
    try {
      const hourlyResponse = await axios.get(OPEN_METEO_BASE_URL, {
        params: {
          latitude,
          longitude,
          start_date: date,
          end_date: date,
          hourly: ['visibility', 'pressure_msl'],
          timezone: 'auto'
        },
        timeout: 10000
      });
      
      if (hourlyResponse.data.hourly) {
        // Get average visibility for the day
        if (hourlyResponse.data.hourly.visibility) {
          const visibilities = hourlyResponse.data.hourly.visibility.filter(v => v !== null);
          if (visibilities.length > 0) {
            // Convert from meters to kilometers and round to 1 decimal place
            visibility = Math.round((visibilities.reduce((a, b) => a + b, 0) / visibilities.length) / 1000 * 10) / 10;
          }
        }
        
        // Get average pressure for the day
        if (hourlyResponse.data.hourly.pressure_msl) {
          const pressures = hourlyResponse.data.hourly.pressure_msl.filter(p => p !== null);
          if (pressures.length > 0) {
            pressure = Math.round(pressures.reduce((a, b) => a + b, 0) / pressures.length);
          }
        }
      }
    } catch (error) {
      console.log('Hourly data not available, using defaults:', { visibility, pressure });
    }
    
    // Add visibility and pressure to daily data
    response.data.daily.visibility = [visibility];
    response.data.daily.pressure_msl = [pressure];
    
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    console.error('Full error:', error.response?.data || error);
    console.error('Request URL:', `${OPEN_METEO_BASE_URL}?latitude=${latitude}&longitude=${longitude}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,relativehumidity_2m_max,weathercode&timezone=auto`);
    throw new Error(`Weather data could not be retrieved: ${error.message}`);
  }
}

/**
 * Calculate comfort index based on weather conditions
 * @param {Object} weather - Weather data object
 * @returns {Object} Comfort index and analysis
 */
function calculateComfortIndex(weather) {
  const { temperature, humidity, windSpeed, precipitation } = weather;
  const temp = temperature.max;
  const hum = humidity;
  const wind = windSpeed;
  const rain = precipitation;

  let comfortScore = 100; // Start with perfect comfort
  let issues = [];

  // Temperature comfort (optimal: 20-25°C)
  if (temp < 10) {
    comfortScore -= 30;
    issues.push('Çok soğuk');
  } else if (temp < 15) {
    comfortScore -= 15;
    issues.push('Soğuk');
  } else if (temp > 35) {
    comfortScore -= 40;
    issues.push('Çok sıcak');
  } else if (temp > 30) {
    comfortScore -= 20;
    issues.push('Sıcak');
  }

  // Humidity comfort (optimal: 40-60%)
  if (hum > 80) {
    comfortScore -= 20;
    issues.push('Çok nemli');
  } else if (hum < 30) {
    comfortScore -= 10;
    issues.push('Kuru hava');
  }

  // Wind comfort (optimal: 5-15 km/h)
  if (wind > 30) {
    comfortScore -= 25;
    issues.push('Çok rüzgarlı');
  } else if (wind > 20) {
    comfortScore -= 10;
    issues.push('Rüzgarlı');
  }

  // Precipitation
  if (rain > 10) {
    comfortScore -= 30;
    issues.push('Çok yağışlı');
  } else if (rain > 1) {
    comfortScore -= 15;
    issues.push('Yağışlı');
  }

  // Determine comfort level
  let comfortLevel;
  if (comfortScore >= 80) comfortLevel = 'Mükemmel';
  else if (comfortScore >= 60) comfortLevel = 'İyi';
  else if (comfortScore >= 40) comfortLevel = 'Orta';
  else if (comfortScore >= 20) comfortLevel = 'Kötü';
  else comfortLevel = 'Çok Kötü';

  return {
    score: Math.max(0, Math.min(100, comfortScore)),
    level: comfortLevel,
    issues: issues,
    color: comfortScore >= 60 ? 'green' : comfortScore >= 40 ? 'yellow' : 'red'
  };
}

/**
 * Get AI recommendation using Hugging Face transformers
 * @param {Object} weatherData - Weather data from Open-Meteo
 * @param {Object} nasaData - NASA POWER data
 * @param {Object} comfortIndex - Comfort index data
 * @param {string} location - Location name
 * @param {string} date - Target date
 * @param {string} eventType - Event type
 * @returns {string} AI recommendation in Turkish
 */
async function getAIRecommendation(weatherData, nasaData, comfortIndex, location, date, eventType = 'outdoor activity') {
  return new Promise((resolve, reject) => {
    console.log('Getting AI recommendation for:', { location, date });
    
    // Prepare input data for Python script
    const inputData = {
      weather_data: weatherData,
      nasa_data: nasaData,
      comfort_index: comfortIndex,
      location: location,
      date: date,
      event_type: eventType
    };
    
    // Spawn Python process
    const pythonProcess = spawn('python', [AI_SCRIPT_PATH], {
      cwd: __dirname,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });
    
    let output = '';
    let errorOutput = '';
    
    // Handle stdout
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    // Handle stderr
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          console.log('AI response received:', result);
          resolve(result.recommendation);
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          reject(new Error(`AI yanıtı işlenemedi: ${parseError.message}`));
        }
      } else {
        console.error('Python script error:', errorOutput);
        reject(new Error(`AI önerisi alınamadı: Python script hatası (kod ${code})`));
      }
    });
    
    // Handle process errors
    pythonProcess.on('error', (error) => {
      console.error('Error spawning Python process:', error);
      reject(new Error(`AI önerisi alınamadı: ${error.message}`));
    });
    
    // Send input data to Python script
    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();
  });
}

/**
 * Get coordinates for a location using Open-Meteo geocoding
 * @param {string} location - Location name
 * @returns {Object} Coordinates {latitude, longitude}
 */
async function getCoordinates(location) {
  try {
    console.log(`🔍 Searching for location: "${location}"`);
    
    // First try with Turkish language
    let response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: {
        name: location,
        count: 5, // Get more results for better matching
        language: 'tr',
        format: 'json'
      }
    });

    console.log(`🇹🇷 Turkish search results: ${response.data.results ? response.data.results.length : 0} found`);

    // If no results with Turkish, try English
    if (!response.data.results || response.data.results.length === 0) {
      console.log('🔄 No results with Turkish, trying English...');
      response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: {
          name: location,
          count: 5,
          language: 'en',
          format: 'json'
        }
      });
      console.log(`🇺🇸 English search results: ${response.data.results ? response.data.results.length : 0} found`);
    }

    // If still no results, try without language parameter
    if (!response.data.results || response.data.results.length === 0) {
      console.log('🌍 No results with English, trying without language...');
      response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: {
          name: location,
          count: 5,
          format: 'json'
        }
      });
      console.log(`🌐 No language search results: ${response.data.results ? response.data.results.length : 0} found`);
    }

    // Try with just the city name if full location fails
    if (!response.data.results || response.data.results.length === 0) {
      const cityName = location.split(',')[0].trim();
      console.log(`🏙️ Trying with just city name: "${cityName}"`);
      response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: {
          name: cityName,
          count: 5,
          format: 'json'
        }
      });
      console.log(`🏙️ City-only search results: ${response.data.results ? response.data.results.length : 0} found`);
    }

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      console.log(`✅ Found location: ${result.name}, ${result.country} (${result.latitude}, ${result.longitude})`);
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        name: result.name,
        country: result.country
      };
    } else {
      console.log('❌ No results found for any search method');
      throw new Error('Location not found. Please make sure you spelled the city name correctly and try a different location. Suggested locations: Istanbul, Ankara, Izmir, New York, London, Berlin, Paris, Tokyo');
    }
  } catch (error) {
    console.error('❌ Error getting coordinates:', error.message);
    if (error.message.includes('Location not found')) {
      throw error;
    }
    throw new Error('Location search error. Please check your internet connection and try again.');
  }
}

// API Routes

/**
 * GET /api/weather - Get weather forecast and AI recommendation
 * Query params: location, date
 */
app.get('/api/weather', async (req, res) => {
  try {
    const { location, date, eventType } = req.query;

    if (!location || !date) {
      return res.status(400).json({
        error: 'Location and date parameters are required'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: 'Date format must be YYYY-MM-DD'
      });
    }

    // Get coordinates for the location
    const coordinates = await getCoordinates(location);
    
    // Get weather data from Open-Meteo
    const weatherData = await getWeatherData(
      coordinates.latitude, 
      coordinates.longitude, 
      date
    );

    // Get NASA POWER data
    const nasaData = await getNASAPowerData(
      coordinates.latitude, 
      coordinates.longitude, 
      date
    );

    // Calculate comfort index
    const weather = {
      temperature: {
        max: weatherData.daily.temperature_2m_max[0],
        min: weatherData.daily.temperature_2m_min[0]
      },
      precipitation: weatherData.daily.precipitation_sum[0],
      windSpeed: weatherData.daily.windspeed_10m_max[0],
      humidity: weatherData.daily.relative_humidity_2m_max[0]
    };
    
    const comfortIndex = calculateComfortIndex(weather);

    // Get AI recommendation with NASA data and comfort index
    let aiRecommendation = '';
    try {
      aiRecommendation = await getAIRecommendation(
        weatherData, 
        nasaData,
        comfortIndex,
        coordinates.name, 
        date,
        eventType || 'outdoor activity'
      );
    } catch (error) {
      console.log('AI recommendation failed, using fallback');
      // Fallback recommendation based on comfort index
      aiRecommendation = `Hava durumu analizi: ${comfortIndex.level} seviyede rahatsızlık (${comfortIndex.score}/100). ${comfortIndex.issues.length > 0 ? 'Dikkat edilmesi gerekenler: ' + comfortIndex.issues.join(', ') + '.' : 'Genel olarak uygun hava koşulları.'} Sıcaklık ${weatherData.daily.temperature_2m_max[0]}°C, nem %${weatherData.daily.relative_humidity_2m_max[0]}. ${weatherData.daily.precipitation_sum[0] > 0 ? 'Yağış bekleniyor, şemsiye almayı unutmayın.' : 'Yağış beklenmiyor.'}`;
    }

    // Format response
    const response = {
      location: {
        name: coordinates.name,
        country: coordinates.country,
        coordinates: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        }
      },
      date,
      weather: {
        temperature: {
          max: weatherData.daily.temperature_2m_max[0],
          min: weatherData.daily.temperature_2m_min[0]
        },
        precipitation: weatherData.daily.precipitation_sum[0],
        windSpeed: weatherData.daily.windspeed_10m_max[0],
        windDirection: weatherData.daily.winddirection_10m_dominant[0],
        humidity: weatherData.daily.relative_humidity_2m_max[0],
        weatherCode: weatherData.daily.weathercode[0],
        uvIndex: weatherData.daily.uv_index_max[0],
        sunset: weatherData.daily.sunset[0],
        sunrise: weatherData.daily.sunrise[0],
        visibility: weatherData.daily.visibility[0],
        pressure: weatherData.daily.pressure_msl[0]
      },
      comfortIndex,
      nasaData: nasaData && nasaData.properties && nasaData.properties.parameter ? {
        solarRadiation: nasaData.properties.parameter.ALLSKY_SFC_SW_DWN ? 
          Object.values(nasaData.properties.parameter.ALLSKY_SFC_SW_DWN)[0] : null,
        temperature: {
          max: nasaData.properties.parameter.T2M_MAX ? 
            Object.values(nasaData.properties.parameter.T2M_MAX)[0] : null,
          min: nasaData.properties.parameter.T2M_MIN ? 
            Object.values(nasaData.properties.parameter.T2M_MIN)[0] : null
        },
        humidity: nasaData.properties.parameter.RH2M ? 
          Object.values(nasaData.properties.parameter.RH2M)[0] : null
      } : null,
      aiRecommendation
    };

    res.json(response);
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({
      error: error.message || 'Sunucu hatası'
    });
  }
});

/**
 * GET /api/health - Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Weather API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Sunucu hatası'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint bulunamadı'
  });
});

// Export for Vercel serverless
module.exports = app;

// Only start server if not in Vercel environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🌤️  Weather API server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  });
}
