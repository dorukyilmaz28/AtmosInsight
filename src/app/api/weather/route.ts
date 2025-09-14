import { NextRequest, NextResponse } from 'next/server';

// Open-Meteo API configuration
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// NASA POWER API configuration
const NASA_POWER_BASE_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';

/**
 * Get coordinates for a location with multiple fallback sources
 */
async function getCoordinates(location: string) {
  try {
    // Primary: Open-Meteo Geocoding API
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    console.log('Geocoding URL:', geocodingUrl);
    
    const response = await fetch(geocodingUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Geocoding API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: geocodingUrl,
        error: errorText
      });
      throw new Error(`Geocoding API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error(`Location "${location}" not found`);
    }
    
    const result = data.results[0];
    
    // Validate coordinates
    if (typeof result.latitude !== 'number' || typeof result.longitude !== 'number') {
      throw new Error('Invalid coordinates received');
    }
    
    return {
      latitude: result.latitude,
      longitude: result.longitude,
      name: result.name || location,
      country: result.country || 'Unknown'
    };
  } catch (error) {
    console.error('Primary Geocoding Error:', error);
    
    // Fallback: Try with different search terms
    try {
      const parts = location.split(',').map(p => p.trim());
      const cityOnly = parts[0];
      const countryOnly = parts[parts.length - 1];
      
      if (cityOnly !== location) {
        console.log(`Trying geocoding with city only: ${cityOnly}`);
        const cityResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityOnly)}&count=1&language=en&format=json`);
        const cityData = await cityResponse.json();
        
        if (cityData.results && cityData.results.length > 0) {
          const result = cityData.results[0];
          return {
            latitude: result.latitude,
            longitude: result.longitude,
            name: result.name,
            country: result.country
          };
        }
      }
      
      // Try with country only if city fails
      if (countryOnly && countryOnly !== cityOnly) {
        console.log(`Trying geocoding with country only: ${countryOnly}`);
        const countryResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(countryOnly)}&count=1&language=en&format=json`);
        const countryData = await countryResponse.json();
        
        if (countryData.results && countryData.results.length > 0) {
          const result = countryData.results[0];
          return {
            latitude: result.latitude,
            longitude: result.longitude,
            name: result.name,
            country: result.country
          };
        }
      }
      
      // Try with Turkish language for Turkish locations
      if (location.toLowerCase().includes('türkiye') || location.toLowerCase().includes('turkey')) {
        console.log(`Trying geocoding with Turkish language: ${location}`);
        const turkishResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=tr&format=json`);
        const turkishData = await turkishResponse.json();
        
        if (turkishData.results && turkishData.results.length > 0) {
          const result = turkishData.results[0];
          return {
            latitude: result.latitude,
            longitude: result.longitude,
            name: result.name,
            country: result.country
          };
        }
      }
      
    } catch (fallbackError) {
      console.error('Fallback geocoding error:', fallbackError);
    }
    
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
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: AbortSignal.timeout(15000) // 15 second timeout
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
 * Get weather data from Open-Meteo API with fallback
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
      next: { revalidate: 1800 }, // Cache for 30 minutes
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Open-Meteo API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: `${OPEN_METEO_BASE_URL}?${params}`,
        error: errorText
      });
      throw new Error(`Weather API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Validate the data structure
    if (!data.daily || !data.daily.temperature_2m_max || data.daily.temperature_2m_max.length === 0) {
      throw new Error('Invalid weather data structure from Open-Meteo');
    }
    
    return data;
  } catch (error) {
    console.error('Primary Weather API Error:', error);
    
    // No fallback API needed - Open-Meteo is reliable and free
    
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
  const issues: string[] = [];
  
  // Temperature factor (optimal range: 18-25°C)
  const avgTemp = (weather.temperature.max + weather.temperature.min) / 2;
  if (avgTemp < 5 || avgTemp > 35) {
    score -= 30;
    issues.push(avgTemp < 5 ? 'Aşırı soğuk' : 'Aşırı sıcak');
  } else if (avgTemp < 10 || avgTemp > 30) {
    score -= 20;
    issues.push(avgTemp < 10 ? 'Soğuk' : 'Sıcak');
  } else if (avgTemp < 15 || avgTemp > 25) {
    score -= 10;
    issues.push(avgTemp < 15 ? 'Serin' : 'Ilık');
  }
  
  // Precipitation factor
  if (weather.precipitation > 10) {
    score -= 25;
    issues.push('Yoğun yağış');
  } else if (weather.precipitation > 5) {
    score -= 15;
    issues.push('Orta yağış');
  } else if (weather.precipitation > 1) {
    score -= 10;
    issues.push('Hafif yağış');
  }
  
  // Wind factor
  if (weather.windSpeed > 25) {
    score -= 20;
    issues.push('Güçlü rüzgar');
  } else if (weather.windSpeed > 15) {
    score -= 10;
    issues.push('Orta rüzgar');
  }
  
  // Humidity factor (optimal range: 40-70%)
  if (weather.humidity > 80 || weather.humidity < 30) {
    score -= 15;
    issues.push(weather.humidity > 80 ? 'Yüksek nem' : 'Düşük nem');
  } else if (weather.humidity > 70 || weather.humidity < 40) {
    score -= 10;
    issues.push(weather.humidity > 70 ? 'Nemli' : 'Kuru');
  }
  
  const finalScore = Math.max(0, Math.min(100, score));
  
  // Determine comfort level and color
  let level: string;
  let color: string;
  
  if (finalScore >= 80) {
    level = 'Mükemmel';
    color = 'green';
  } else if (finalScore >= 60) {
    level = 'İyi';
    color = 'green';
  } else if (finalScore >= 40) {
    level = 'Orta';
    color = 'yellow';
  } else {
    level = 'Zorlu';
    color = 'red';
  }
  
  return {
    score: finalScore,
    level,
    issues,
    color
  };
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
    recommendation += `🎯 ${eventType} Event Weather Analysis for ${location}:\n\n`;
  } else {
    recommendation += `🌤️ Weather Forecast for ${location} on ${date}:\n\n`;
  }
  
  // Comfort level analysis
  if (comfortIndex.score >= 85) {
    recommendation += `✨ Excellent weather conditions! Perfect for outdoor activities and events.`;
  } else if (comfortIndex.score >= 70) {
    recommendation += `👍 Great weather! Ideal conditions for most outdoor activities.`;
  } else if (comfortIndex.score >= 55) {
    recommendation += `⚠️ Moderate weather conditions. Some activities may require extra preparation.`;
  } else if (comfortIndex.score >= 40) {
    recommendation += `⚠️ Challenging weather conditions. Consider indoor alternatives.`;
  } else {
    recommendation += `❌ Difficult weather conditions. Outdoor activities not recommended.`;
  }
  
  // Detailed recommendations
  recommendation += `\n\n📊 Detailed Analysis:`;
  
  // Temperature recommendations
  if (temp > 35) {
    recommendation += `\n🌡️ Very hot conditions (${temp.toFixed(1)}°C). Stay hydrated, seek shade, and avoid prolonged sun exposure.`;
  } else if (temp > 30) {
    recommendation += `\n☀️ Warm weather (${temp.toFixed(1)}°C). Perfect for beach activities, but stay hydrated.`;
  } else if (temp > 20) {
    recommendation += `\n😊 Pleasant temperature (${temp.toFixed(1)}°C). Ideal for most outdoor activities.`;
  } else if (temp > 10) {
    recommendation += `\n🧥 Cool weather (${temp.toFixed(1)}°C). Dress in layers for comfort.`;
  } else {
    recommendation += `\n🥶 Cold conditions (${temp.toFixed(1)}°C). Bundle up and limit outdoor time.`;
  }
  
  // Precipitation recommendations
  if (weather.precipitation > 10) {
    recommendation += `\n🌧️ Heavy rain expected (${weather.precipitation}mm). Indoor activities strongly recommended.`;
  } else if (weather.precipitation > 5) {
    recommendation += `\n🌦️ Significant rainfall (${weather.precipitation}mm). Bring waterproof gear.`;
  } else if (weather.precipitation > 1) {
    recommendation += `\n🌧️ Light rain possible (${weather.precipitation}mm). Have an umbrella ready.`;
  } else if (weather.precipitation > 0) {
    recommendation += `\n🌤️ Minimal precipitation (${weather.precipitation}mm). Generally dry conditions.`;
  } else {
    recommendation += `\n☀️ No precipitation expected. Perfect for outdoor activities.`;
  }
  
  // Wind recommendations
  if (weather.windSpeed > 25) {
    recommendation += `\n💨 Strong winds (${weather.windSpeed} km/h). Avoid outdoor activities and secure loose objects.`;
  } else if (weather.windSpeed > 15) {
    recommendation += `\n🌬️ Moderate winds (${weather.windSpeed} km/h). Good for wind sports, but be cautious.`;
  } else if (weather.windSpeed > 5) {
    recommendation += `\n🍃 Light breeze (${weather.windSpeed} km/h). Pleasant for most activities.`;
  } else {
    recommendation += `\n🌫️ Calm conditions (${weather.windSpeed} km/h). No wind concerns.`;
  }
  
  // Humidity recommendations
  if (weather.humidity > 80) {
    recommendation += `\n💧 High humidity (${weather.humidity}%). Can feel muggy and uncomfortable.`;
  } else if (weather.humidity > 60) {
    recommendation += `\n💧 Moderate humidity (${weather.humidity}%). Generally comfortable conditions.`;
  } else if (weather.humidity < 30) {
    recommendation += `\n🏜️ Low humidity (${weather.humidity}%). Dry conditions - stay hydrated.`;
  } else {
    recommendation += `\n💧 Normal humidity (${weather.humidity}%). Comfortable conditions.`;
  }
  
  // Event-specific recommendations
  if (eventType) {
    recommendation += `\n\n🎉 Event-Specific Tips:`;
    
    switch (eventType.toLowerCase()) {
      case 'wedding':
        recommendation += `\n💒 For your special day, consider indoor backup plans if rain is expected.`;
        break;
      case 'outdoor party':
        recommendation += `\n🎊 Perfect for outdoor celebrations! Consider tents for shade or rain protection.`;
        break;
      case 'sports event':
        recommendation += `\n⚽ Great conditions for sports! Ensure proper hydration and sun protection.`;
        break;
      case 'picnic':
        recommendation += `\n🧺 Ideal picnic weather! Don't forget sunscreen and plenty of water.`;
        break;
      case 'hiking':
        recommendation += `\n🥾 Excellent hiking conditions! Check trail conditions and bring appropriate gear.`;
        break;
      default:
        recommendation += `\n🎯 Weather conditions are suitable for your ${eventType.toLowerCase()} event.`;
    }
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

    // Validate location format (basic check)
    if (location.length < 2 || location.length > 100) {
      return NextResponse.json(
        { error: 'Location must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Validate date format and range
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Date format must be YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const requestDate = new Date(date + 'T00:00:00.000Z'); // Ensure UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Reset time to start of day UTC
    const maxDate = new Date();
    maxDate.setUTCDate(today.getUTCDate() + 16); // 16 days in the future

    console.log('Date validation:', {
      requestDate: requestDate.toISOString(),
      today: today.toISOString(),
      maxDate: maxDate.toISOString(),
      isValid: requestDate >= today && requestDate <= maxDate
    });

    if (requestDate < today || requestDate > maxDate) {
      return NextResponse.json(
        { error: `Date must be between ${today.toISOString().split('T')[0]} and ${maxDate.toISOString().split('T')[0]}` },
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

    // Generate AI recommendation using JavaScript-based system
    const aiRecommendation = generateAIRecommendation(weather, coordinates.name, date, eventType || undefined);

    // Get weather description based on weather code
    const getWeatherDescription = (code: number) => {
      const weatherCodes: { [key: number]: string } = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Light freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snow fall",
        73: "Moderate snow fall",
        75: "Heavy snow fall",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
      };
      return weatherCodes[code] || "Unknown";
    };

    // Get weather icon based on weather code
    const getWeatherIcon = (code: number) => {
      if (code === 0 || code === 1) return "☀️";
      if (code === 2 || code === 3) return "⛅";
      if (code >= 45 && code <= 48) return "🌫️";
      if (code >= 51 && code <= 67) return "🌧️";
      if (code >= 71 && code <= 86) return "❄️";
      if (code >= 80 && code <= 82) return "🌦️";
      if (code >= 95 && code <= 99) return "⛈️";
      return "🌤️";
    };

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
        weatherDescription: getWeatherDescription(weatherData.daily.weathercode[0]),
        weatherIcon: getWeatherIcon(weatherData.daily.weathercode[0]),
        uvIndex: weatherData.daily.uv_index_max[0],
        sunset: weatherData.daily.sunset[0],
        sunrise: weatherData.daily.sunrise[0],
        visibility: 10, // Default visibility
        pressure: 1013.25 // Default pressure in hPa
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
    console.error('Weather API Error:', error);
    
    // Return specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Location not found. Please check the spelling and try again.' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('Invalid weather data')) {
        return NextResponse.json(
          { error: 'Weather data temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
      
      if (error.message.includes('API error')) {
        return NextResponse.json(
          { error: 'Weather service temporarily unavailable. Please try again in a few minutes.' },
          { status: 503 }
        );
      }
      
      // Return the original error message for debugging
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Unable to fetch weather data. Please try again later.' },
      { status: 500 }
    );
  }
}
