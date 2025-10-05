import { NextRequest, NextResponse } from 'next/server';
import { getAIWeatherAnalysis } from '@/services/aiService';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

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
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      throw new Error('Invalid response format from geocoding API');
    }
    
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
async function getNASAPowerData(latitude: number, longitude: number, date: string, endDate?: string) {
  try {
    // NASA POWER API requires YYYYMMDD format
    const nasaStartDate = date.replace(/-/g, '');
    const nasaEndDate = (endDate || date).replace(/-/g, '');
    
    // Enhanced parameters for more comprehensive data
    const parameters = [
      'T2M_MAX',      // Maximum temperature
      'T2M_MIN',      // Minimum temperature
      'T2M',          // Mean temperature
      'PRECTOT',      // Precipitation
      'WS2M',         // Wind speed at 2m
      'WS10M',        // Wind speed at 10m (more standard)
      'RH2M',         // Relative humidity at 2m
      'ALLSKY_SFC_SW_DWN', // All-sky surface shortwave downward irradiance
      'PS',           // Surface pressure
      'TOA_SW_DWN'    // Top-of-atmosphere shortwave downward irradiance
    ].join(',');
    
    const nasaUrl = `${NASA_POWER_BASE_URL}?parameters=${parameters}&community=RE&longitude=${longitude}&latitude=${latitude}&start=${nasaStartDate}&end=${nasaEndDate}&format=JSON`;
    
    console.log('Fetching NASA POWER data:', {
      url: nasaUrl,
      startDate: nasaStartDate,
      endDate: nasaEndDate,
      coordinates: { latitude, longitude }
    });
    
    const response = await fetch(nasaUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: AbortSignal.timeout(20000) // 20 second timeout
    });
    
    if (!response.ok) {
      console.warn(`NASA POWER API failed with status ${response.status}: ${response.statusText}`);
      return null;
    }
    
    try {
      const data = await response.json();
      console.log('NASA POWER API response received:', {
        hasProperties: !!data.properties,
        hasParameter: !!data.properties?.parameter,
        parameters: data.properties?.parameter ? Object.keys(data.properties.parameter) : []
      });
      return data;
    } catch (jsonError) {
      console.error('NASA API JSON parsing error:', jsonError);
      return null;
    }
  } catch (error) {
    console.warn('Error fetching NASA POWER data:', error);
    return null;
  }
}

/**
 * Get weather data from Open-Meteo API with fallback
 */
async function getWeatherData(latitude: number, longitude: number, date: string, endDate?: string) {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      start_date: date,
      end_date: endDate || date,
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

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      throw new Error('Invalid response format from weather API');
    }
    
    // Validate the data structure
    if (!data.daily || !data.daily.temperature_2m_max || data.daily.temperature_2m_max.length === 0) {
      throw new Error('Invalid weather data structure from Open-Meteo');
    }
    
    return data;
  } catch (error) {
    console.error('Primary Weather API Error:', error);
    
    // Fallback to secondary API (WeatherAPI.com if API key is available)
    try {
      const weatherApiKey = process.env.WEATHER_API_KEY;
      if (weatherApiKey) {
        console.log('Trying WeatherAPI.com as fallback...');
        const fallbackUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${latitude},${longitude}&days=7&aqi=no&alerts=no`;
        const fallbackResponse = await fetch(fallbackUrl);
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          return convertWeatherApiData(fallbackData, date);
        }
      }
    } catch (fallbackError) {
      console.error('Fallback API Error:', fallbackError);
    }
    
    throw new Error(`Error fetching weather data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Type definitions for WeatherAPI.com response
interface WeatherApiForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    avgtemp_c: number;
    maxwind_kph: number;
    totalprecip_mm: number;
    avgvis_km: number;
    avghumidity: number;
    uv: number;
    avgpressure_mb: number;
    condition: {
      text: string;
      code: number;
    };
  };
  astro: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moon_phase: string;
    moon_illumination: string;
  };
}

interface WeatherApiResponse {
  forecast?: {
    forecastday?: WeatherApiForecastDay[];
  };
}

/**
 * Convert WeatherAPI.com data format to our expected format
 */
function convertWeatherApiData(data: WeatherApiResponse, date: string) {
  const targetDate = new Date(date);
  const forecastDay = data.forecast?.forecastday?.find((day: WeatherApiForecastDay) => {
    const dayDate = new Date(day.date);
    return dayDate.toDateString() === targetDate.toDateString();
  });

  if (!forecastDay) {
    throw new Error('No forecast data available for the requested date');
  }

  const dayData = forecastDay.day;
  const astroData = forecastDay.astro;

  return {
    daily: {
      temperature_2m_max: [dayData.maxtemp_c],
      temperature_2m_min: [dayData.mintemp_c],
      precipitation_sum: [dayData.totalprecip_mm || 0],
      windspeed_10m_max: [dayData.maxwind_kph / 3.6], // Convert km/h to m/s
      winddirection_10m_dominant: [dayData.avgvis_km * 1000], // Placeholder
      relative_humidity_2m_max: [dayData.avghumidity],
      weathercode: [getWeatherCodeFromCondition(dayData.condition.code)],
      uv_index_max: [dayData.uv],
      sunset: [astroData.sunset],
      sunrise: [astroData.sunrise],
      pressure_msl: [dayData.avgpressure_mb]
    }
  };
}

/**
 * Convert WeatherAPI condition codes to Open-Meteo weather codes
 */
function getWeatherCodeFromCondition(conditionCode: number): number {
  // WeatherAPI condition codes to Open-Meteo weather codes mapping
  const codeMap: { [key: number]: number } = {
    1000: 0,  // Clear sky
    1003: 2,  // Partly cloudy
    1006: 3,  // Cloudy
    1009: 3,  // Overcast
    1030: 45, // Mist
    1063: 61, // Patchy rain possible
    1066: 71, // Patchy snow possible
    1069: 67, // Patchy sleet possible
    1072: 56, // Patchy freezing drizzle possible
    1087: 95, // Thundery outbreaks possible
    1114: 71, // Blowing snow
    1117: 75, // Blizzard
    1135: 45, // Fog
    1147: 48, // Freezing fog
    1150: 51, // Patchy light drizzle
    1153: 51, // Light drizzle
    1168: 56, // Freezing drizzle
    1171: 56, // Heavy freezing drizzle
    1180: 61, // Patchy light rain
    1183: 61, // Light rain
    1186: 61, // Moderate rain at times
    1189: 63, // Moderate rain
    1192: 65, // Heavy rain at times
    1195: 65, // Heavy rain
    1198: 66, // Light freezing rain
    1201: 66, // Moderate or heavy freezing rain
    1204: 67, // Light sleet
    1207: 67, // Moderate or heavy sleet
    1210: 71, // Patchy light snow
    1213: 71, // Light snow
    1216: 73, // Patchy moderate snow
    1219: 73, // Moderate snow
    1222: 75, // Patchy heavy snow
    1225: 75, // Heavy snow
    1237: 77, // Ice pellets
    1240: 80, // Light rain shower
    1243: 81, // Moderate or heavy rain shower
    1246: 82, // Torrential rain shower
    1249: 67, // Light sleet showers
    1252: 67, // Moderate or heavy sleet showers
    1255: 85, // Light snow showers
    1258: 86, // Moderate or heavy snow showers
    1261: 77, // Light showers of ice pellets
    1264: 77, // Moderate or heavy showers of ice pellets
    1273: 95, // Patchy light rain with thunder
    1276: 96, // Moderate or heavy rain with thunder
    1279: 96, // Patchy light snow with thunder
    1282: 99, // Moderate or heavy snow with thunder
  };
  
  return codeMap[conditionCode] || 0;
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
    recommendation += `**${eventType} Etkinlik Hava Durumu Analizi - ${location}:**\n\n`;
  } else {
    recommendation += `**Hava Durumu Tahmini - ${location} - ${date}:**\n\n`;
  }
  
  // Comfort level analysis - more flexible approach
  if (comfortIndex.score >= 85) {
    recommendation += `Mükemmel hava koşulları! Açık hava aktiviteleri için ideal.`;
  } else if (comfortIndex.score >= 70) {
    recommendation += `İyi hava koşulları! Çoğu açık hava aktivitesi için uygun.`;
  } else if (comfortIndex.score >= 55) {
    recommendation += `Orta düzeyde hava koşulları. Bazı aktiviteler ek hazırlık gerektirebilir.`;
  } else if (comfortIndex.score >= 40) {
    recommendation += `Zorlu hava koşulları. Alternatif planlar düşünülebilir.`;
  } else {
    recommendation += `Zorlu hava koşulları. Açık hava aktivitelerinde dikkatli olun.`;
  }
  
  // Detailed recommendations
  recommendation += `\n\n**Detaylı Analiz:**`;
  
  // Temperature recommendations - more flexible approach
  if (temp > 35) {
    recommendation += `\n• **Sıcaklık:** ${temp.toFixed(1)}°C - Çok sıcak hava. Bol su içmeyi unutmayın, gölge alanları tercih edin.`;
  } else if (temp > 30) {
    recommendation += `\n• **Sıcaklık:** ${temp.toFixed(1)}°C - Sıcak hava. Deniz aktiviteleri için uygun, ancak su tüketimine dikkat edin.`;
  } else if (temp > 20) {
    recommendation += `\n• **Sıcaklık:** ${temp.toFixed(1)}°C - Rahat sıcaklık. Çoğu açık hava aktivitesi için ideal.`;
  } else if (temp > 10) {
    recommendation += `\n• **Sıcaklık:** ${temp.toFixed(1)}°C - Serin hava. Katmanlı giyim rahatlık sağlayabilir.`;
  } else {
    recommendation += `\n• **Sıcaklık:** ${temp.toFixed(1)}°C - Soğuk hava. Sıcak giyin ve dışarıda kalma süresini sınırlayın.`;
  }
  
  // Precipitation recommendations - more flexible approach
  if (weather.precipitation > 10) {
    recommendation += `\n• **Yağış:** ${weather.precipitation}mm - Yoğun yağış bekleniyor. Alternatif planlar düşünülebilir.`;
  } else if (weather.precipitation > 5) {
    recommendation += `\n• **Yağış:** ${weather.precipitation}mm - Önemli yağış. Su geçirmez ekipman alın.`;
  } else if (weather.precipitation > 1) {
    recommendation += `\n• **Yağış:** ${weather.precipitation}mm - Hafif yağış mümkün. Şemsiye hazır bulundurun.`;
  } else if (weather.precipitation > 0) {
    recommendation += `\n• **Yağış:** ${weather.precipitation}mm - Minimal yağış. Genellikle kuru koşullar.`;
  } else {
    recommendation += `\n• **Yağış:** Yağış beklenmiyor. Açık hava aktiviteleri için ideal.`;
  }
  
  // Wind recommendations - more flexible approach
  if (weather.windSpeed > 25) {
    recommendation += `\n• **Rüzgar:** ${weather.windSpeed} km/h - Güçlü rüzgar. Açık hava aktivitelerinde dikkatli olun.`;
  } else if (weather.windSpeed > 15) {
    recommendation += `\n• **Rüzgar:** ${weather.windSpeed} km/h - Orta rüzgar. Rüzgar sporları için uygun, dikkatli olun.`;
  } else if (weather.windSpeed > 5) {
    recommendation += `\n• **Rüzgar:** ${weather.windSpeed} km/h - Hafif rüzgar. Çoğu aktivite için hoş.`;
  } else {
    recommendation += `\n• **Rüzgar:** ${weather.windSpeed} km/h - Sakin hava. Rüzgar endişesi yok.`;
  }
  
  // Humidity recommendations - more flexible approach
  if (weather.humidity > 80) {
    recommendation += `\n• **Nem:** %${weather.humidity} - Yüksek nem. Bunaltıcı hissedilebilir.`;
  } else if (weather.humidity > 60) {
    recommendation += `\n• **Nem:** %${weather.humidity} - Orta nem. Genellikle rahat koşullar.`;
  } else if (weather.humidity < 30) {
    recommendation += `\n• **Nem:** %${weather.humidity} - Düşük nem. Kuru koşullar - su tüketimine dikkat edin.`;
  } else {
    recommendation += `\n• **Nem:** %${weather.humidity} - Normal nem. Rahat koşullar.`;
  }
  
  // Event-specific recommendations - more flexible approach
  if (eventType) {
    recommendation += `\n\n**Etkinlik Özel Önerileri:**`;
    
    switch (eventType.toLowerCase()) {
      case 'wedding':
        recommendation += `\n• Düğün gününüz için, yağış bekleniyorsa kapalı alan alternatif planları düşünün.`;
        break;
      case 'outdoor party':
        recommendation += `\n• Açık hava kutlamaları için uygun! Gölge veya yağmur koruması için çadır düşünün.`;
        break;
      case 'sports event':
        recommendation += `\n• Spor etkinlikleri için iyi koşullar! Uygun hidrasyon ve güneş koruması sağlayın.`;
        break;
      case 'picnic':
        recommendation += `\n• İdeal piknik havası! Güneş kremi ve bol su almayı unutmayın.`;
        break;
      case 'hiking':
        recommendation += `\n• Yürüyüş için uygun koşullar! Parkur durumunu kontrol edin ve uygun ekipman alın.`;
        break;
      default:
        recommendation += `\n• Hava koşulları ${eventType.toLowerCase()} etkinliğiniz için uygun görünüyor.`;
    }
  }
  
  return recommendation;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const location = searchParams.get('location');
    const date = searchParams.get('date');
    const endDate = searchParams.get('endDate');
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

    // Validate endDate if provided
    if (endDate && !dateRegex.test(endDate)) {
      return NextResponse.json(
        { error: 'End date format must be YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const requestDate = new Date(date + 'T00:00:00.000Z'); // Ensure UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Reset time to start of day UTC
    
    // Allow past dates for NASA historical data and future dates for forecasts
    const minDate = new Date('2020-01-01'); // NASA POWER data available from 2020
    const maxDate = new Date();
    maxDate.setUTCFullYear(today.getUTCFullYear() + 2); // 2 years in the future (2027)

    console.log('Date validation:', {
      requestDate: requestDate.toISOString(),
      endDate: endDate,
      today: today.toISOString(),
      minDate: minDate.toISOString(),
      maxDate: maxDate.toISOString(),
      isValid: requestDate >= minDate && requestDate <= maxDate
    });

    if (requestDate < minDate || requestDate > maxDate) {
      return NextResponse.json(
        { error: `Date must be between ${minDate.toISOString().split('T')[0]} and ${maxDate.toISOString().split('T')[0]}` },
        { status: 400 }
      );
    }

    // Validate date range if endDate is provided
    if (endDate) {
      const requestEndDate = new Date(endDate + 'T00:00:00.000Z');
      
      if (requestEndDate <= requestDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
      
      // Limit to 7 days max
      const diffTime = Math.abs(requestEndDate.getTime() - requestDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 7) {
        return NextResponse.json(
          { error: 'Date range cannot exceed 7 days' },
          { status: 400 }
        );
      }
      
      if (requestEndDate > maxDate) {
        return NextResponse.json(
          { error: `End date must be before ${maxDate.toISOString().split('T')[0]}` },
          { status: 400 }
        );
      }
    }

    // Get coordinates for the location
    const coordinates = await getCoordinates(location);
    
    // Get weather data from Open-Meteo
    const weatherData = await getWeatherData(
      coordinates.latitude, 
      coordinates.longitude, 
      date,
      endDate || undefined
    );

    // Get NASA POWER data for the date range
    const nasaData = await getNASAPowerData(
      coordinates.latitude, 
      coordinates.longitude, 
      date,
      endDate || undefined
    );

    // Calculate comfort index for the first day (or average if multiple days)
    const isMultiDay = endDate && endDate !== date;
    
    const weather = {
      temperature: {
        max: isMultiDay ? Math.max(...weatherData.daily.temperature_2m_max) : weatherData.daily.temperature_2m_max[0],
        min: isMultiDay ? Math.min(...weatherData.daily.temperature_2m_min) : weatherData.daily.temperature_2m_min[0]
      },
      precipitation: isMultiDay ? weatherData.daily.precipitation_sum.reduce((a: number, b: number) => a + b, 0) : weatherData.daily.precipitation_sum[0],
      windSpeed: isMultiDay ? Math.max(...weatherData.daily.windspeed_10m_max) : weatherData.daily.windspeed_10m_max[0],
      humidity: isMultiDay ? weatherData.daily.relative_humidity_2m_max.reduce((a: number, b: number) => a + b, 0) / weatherData.daily.relative_humidity_2m_max.length : weatherData.daily.relative_humidity_2m_max[0]
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
    let response: any = {
      location: {
        name: coordinates.name,
        country: coordinates.country,
        coordinates: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        }
      },
      date,
      endDate: endDate || null,
      isMultiDay,
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
      // Include all daily data for chart rendering
      dailyData: weatherData.daily,
      comfortIndex,
      nasaData: nasaData && nasaData.properties && nasaData.properties.parameter ? {
        solarRadiation: nasaData.properties.parameter.ALLSKY_SFC_SW_DWN ? 
          Object.values(nasaData.properties.parameter.ALLSKY_SFC_SW_DWN)[0] as number : null,
        temperature: {
          max: nasaData.properties.parameter.T2M_MAX ? 
            Object.values(nasaData.properties.parameter.T2M_MAX)[0] as number : null,
          min: nasaData.properties.parameter.T2M_MIN ? 
            Object.values(nasaData.properties.parameter.T2M_MIN)[0] as number : null
        },
        humidity: nasaData.properties.parameter.RH2M ? 
          Object.values(nasaData.properties.parameter.RH2M)[0] as number : null,
        pressure: nasaData.properties.parameter.PS ? 
          Object.values(nasaData.properties.parameter.PS)[0] as number : null,
        windSpeed: nasaData.properties.parameter.WS10M ? 
          Object.values(nasaData.properties.parameter.WS10M)[0] as number : 
          (nasaData.properties.parameter.WS2M ? 
            Object.values(nasaData.properties.parameter.WS2M)[0] as number : null),
        precipitation: nasaData.properties.parameter.PRECTOT ? 
          Object.values(nasaData.properties.parameter.PRECTOT)[0] as number : null
      } : null,
      aiRecommendation
    };

    // Get AI Analysis
    try {
      const aiAnalysis = await getAIWeatherAnalysis({
        location,
        date,
        eventType: eventType || 'outdoor activity',
        temperature: response.weather.temperature.max,
        windSpeed: response.weather.windSpeed,
        precipitation: response.weather.precipitation,
        humidity: response.weather.humidity,
        uvIndex: response.weather.uvIndex,
        weatherDescription: response.weather.weatherDescription
      });

      // Add AI analysis to response
      response.aiAnalysis = aiAnalysis;
    } catch (aiError) {
      console.error('AI Analysis Error:', aiError);
      // Continue without AI analysis
    }

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
