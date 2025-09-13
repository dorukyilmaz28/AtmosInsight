import { NextRequest, NextResponse } from 'next/server';

// Open-Meteo API configuration
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// NASA POWER API configuration
const NASA_POWER_BASE_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';

/**
 * Get coordinates for a location using Open-Meteo geocoding
 */
async function getCoordinates(location: string) {
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error(`Location "${location}" not found`);
    }
    
    const result = data.results[0];
    return {
      latitude: result.latitude,
      longitude: result.longitude,
      name: result.name,
      country: result.country
    };
  } catch (error) {
    throw new Error(`Error getting coordinates for "${location}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get NASA POWER data for additional scientific insights
 */
async function getNASAPowerData(latitude: number, longitude: number, date: string) {
  try {
    // NASA POWER API requires YYYYMMDD format
    const nasaDate = date.replace(/-/g, '');
    
    const response = await fetch(`${NASA_POWER_BASE_URL}?parameters=T2M_MAX,T2M_MIN,PRECTOT,WS2M,RH2M,ALLSKY_SFC_SW_DWN&community=RE&longitude=${longitude}&latitude=${latitude}&start=${nasaDate}&end=${nasaDate}&format=JSON`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      console.warn('NASA POWER API failed, continuing without NASA data');
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Error fetching NASA POWER data:', error);
    return null;
  }
}

/**
 * Get weather data from Open-Meteo API
 */
async function getWeatherData(latitude: number, longitude: number, date: string) {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      start_date: date,
      end_date: date,
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,winddirection_10m_dominant,relative_humidity_2m_max,weathercode,uv_index_max,sunset,sunrise',
      timezone: 'auto'
    });

    const response = await fetch(`${OPEN_METEO_BASE_URL}?${params}`, {
      next: { revalidate: 1800 } // Cache for 30 minutes
    });

    if (!response.ok) {
      throw new Error('Weather data API request failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Error fetching weather data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate comfort index based on weather conditions
 */
function calculateComfortIndex(weather: {
  temperature: { max: number; min: number };
  precipitation: number;
  windSpeed: number;
  humidity: number;
}) {
  let score = 100;
  
  // Temperature factor (optimal range: 18-25°C)
  const avgTemp = (weather.temperature.max + weather.temperature.min) / 2;
  if (avgTemp < 5 || avgTemp > 35) score -= 30;
  else if (avgTemp < 10 || avgTemp > 30) score -= 20;
  else if (avgTemp < 15 || avgTemp > 25) score -= 10;
  
  // Precipitation factor
  if (weather.precipitation > 10) score -= 25;
  else if (weather.precipitation > 5) score -= 15;
  else if (weather.precipitation > 1) score -= 10;
  
  // Wind factor
  if (weather.windSpeed > 25) score -= 20;
  else if (weather.windSpeed > 15) score -= 10;
  
  // Humidity factor (optimal range: 40-70%)
  if (weather.humidity > 80 || weather.humidity < 30) score -= 15;
  else if (weather.humidity > 70 || weather.humidity < 40) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate AI recommendation based on weather data
 */
function generateAIRecommendation(weather: {
  temperature: { max: number; min: number };
  precipitation: number;
  windSpeed: number;
  humidity: number;
}, location: string, date: string, eventType?: string) {
  const temp = (weather.temperature.max + weather.temperature.min) / 2;
  const comfortIndex = calculateComfortIndex(weather);
  
  let recommendation = '';
  
  if (eventType) {
    recommendation += `🎯 ${eventType} için ${location} hava durumu analizi:\n\n`;
  }
  
  if (comfortIndex >= 80) {
    recommendation += `✨ Mükemmel hava! Dışarıda vakit geçirmek için ideal koşullar.`;
  } else if (comfortIndex >= 60) {
    recommendation += `👍 İyi hava koşulları. Dışarıda aktiviteler yapabilirsiniz.`;
  } else if (comfortIndex >= 40) {
    recommendation += `⚠️ Hava koşulları orta. Dikkatli olmanız gerekebilir.`;
  } else {
    recommendation += `❌ Zorlu hava koşulları. Dışarıda dikkatli olun.`;
  }
  
  if (weather.precipitation > 5) {
    recommendation += `\n🌧️ Şiddetli yağış bekleniyor. Şemsiye almayı unutmayın.`;
  } else if (weather.precipitation > 1) {
    recommendation += `\n🌦️ Hafif yağış olabilir. Hazırlıklı olun.`;
  }
  
  if (weather.windSpeed > 20) {
    recommendation += `\n💨 Güçlü rüzgar var. Dikkatli olun.`;
  }
  
  if (temp > 30) {
    recommendation += `\n☀️ Sıcak hava. Bol su içmeyi unutmayın.`;
  } else if (temp < 5) {
    recommendation += `\n🧥 Soğuk hava. Sıcak giysiler giyin.`;
  }
  
  return recommendation;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const date = searchParams.get('date');
    const eventType = searchParams.get('eventType');

    if (!location || !date) {
      return NextResponse.json(
        { error: 'Location and date parameters are required' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Date format must be YYYY-MM-DD' },
        { status: 400 }
      );
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

    // Generate AI recommendation
    const aiRecommendation = generateAIRecommendation(weather, coordinates.name, date, eventType || undefined);

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
        visibility: 10, // Default visibility
        pressure: 1013 // Default pressure
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

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
