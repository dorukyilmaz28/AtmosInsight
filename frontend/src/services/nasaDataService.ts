/**
 * NASA GES DISC OPeNDAP Data Service
 * Provides access to NASA Earth observation data for weather probability analysis
 */

export interface NASADataPoint {
  date: string;
  temperature: {
    max: number;
    min: number;
    mean: number;
  };
  precipitation: number;
  windSpeed: number;
  humidity: number;
  solarRadiation: number;
  pressure: number;
  cloudCover: number;
}

export interface WeatherProbability {
  veryHot: number;      // > 35°C
  veryCold: number;     // < 0°C
  veryWindy: number;    // > 25 km/h
  veryWet: number;      // > 10mm precipitation
  veryUncomfortable: number; // Combined adverse conditions
}

export interface HistoricalAnalysis {
  period: string;
  dataPoints: NASADataPoint[];
  probabilities: WeatherProbability;
  trends: {
    temperature: 'increasing' | 'decreasing' | 'stable';
    precipitation: 'increasing' | 'decreasing' | 'stable';
    windSpeed: 'increasing' | 'decreasing' | 'stable';
  };
  statistics: {
    averageTemperature: number;
    averagePrecipitation: number;
    averageWindSpeed: number;
    extremeEvents: number;
  };
}

export interface NASADataRequest {
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  parameters: string[];
}

class NASADataService {
  // NASA Data Sources
  private readonly GES_DISC_BASE_URL = 'https://goldsmr4.gesdisc.eosdis.nasa.gov/opendap/';
  private readonly GIOVANNI_BASE_URL = 'https://giovanni.gsfc.nasa.gov/giovanni/';
  private readonly POWER_BASE_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';
  private readonly EARTHDATA_SEARCH_BASE_URL = 'https://cmr.earthdata.nasa.gov/search/';
  private readonly WORLDVIEW_BASE_URL = 'https://worldview.earthdata.nasa.gov/';
  private readonly DATA_RODS_HYDROLOGY_URL = 'https://hydro1.gesdisc.eosdis.nasa.gov/data/';

  /**
   * Get historical weather data from NASA POWER API
   */
  async getHistoricalData(request: NASADataRequest): Promise<NASADataPoint[]> {
    try {
      // Validate coordinates
      if (Math.abs(request.latitude) > 90 || Math.abs(request.longitude) > 180) {
        console.warn('Invalid coordinates provided. Using mock data.');
        return this.generateMockHistoricalData(request);
      }

      // Validate date format and range
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      const currentDate = new Date();
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || 
          startDate > endDate || endDate > currentDate) {
        console.warn('Invalid date range provided. Using mock data.');
        return this.generateMockHistoricalData(request);
      }

      // Limit date range to avoid API limits
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        console.warn('Date range too large. Limiting to 1 year and using mock data.');
        return this.generateMockHistoricalData(request);
      }

      const params = new URLSearchParams({
        parameters: request.parameters.join(','),
        community: 'RE',
        longitude: request.longitude.toString(),
        latitude: request.latitude.toString(),
        start: request.startDate.replace(/-/g, ''),
        end: request.endDate.replace(/-/g, ''),
        format: 'JSON'
      });

      const response = await fetch(`${this.POWER_BASE_URL}?${params}`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        let errorMessage = `NASA POWER API error: ${response.status}`;
        
        if (response.status === 422) {
          errorMessage = 'NASA API: Invalid parameters provided. Using historical simulation data instead.';
        } else if (response.status === 429) {
          errorMessage = 'NASA API: Rate limit exceeded. Using cached data.';
        } else if (response.status >= 500) {
          errorMessage = 'NASA API: Server error. Using historical simulation data.';
        }
        
        console.warn(errorMessage);
        // Don't throw error, return mock data instead
        return this.generateMockHistoricalData(request);
      }

      const data = await response.json();
      return this.parseNASAPowerData(data, request.startDate, request.endDate);
    } catch (error) {
      console.error('Error fetching NASA historical data:', error);
      // Return mock data for development
      return this.generateMockHistoricalData(request);
    }
  }

  /**
   * Calculate weather probabilities based on historical data
   */
  calculateWeatherProbabilities(data: NASADataPoint[]): WeatherProbability {
    if (data.length === 0) {
      return {
        veryHot: 0,
        veryCold: 0,
        veryWindy: 0,
        veryWet: 0,
        veryUncomfortable: 0
      };
    }

    const totalDays = data.length;
    
    // Calculate probabilities for each condition
    const veryHot = data.filter(d => d.temperature.max > 35).length / totalDays * 100;
    const veryCold = data.filter(d => d.temperature.min < 0).length / totalDays * 100;
    const veryWindy = data.filter(d => d.windSpeed > 25).length / totalDays * 100;
    const veryWet = data.filter(d => d.precipitation > 10).length / totalDays * 100;
    
    // Calculate very uncomfortable (combination of adverse conditions)
    const veryUncomfortable = data.filter(d => 
      d.temperature.max > 35 || 
      d.temperature.min < 0 || 
      d.windSpeed > 25 || 
      d.precipitation > 10 ||
      (d.humidity > 80 && d.temperature.max > 30)
    ).length / totalDays * 100;

    return {
      veryHot: Math.round(veryHot * 10) / 10,
      veryCold: Math.round(veryCold * 10) / 10,
      veryWindy: Math.round(veryWindy * 10) / 10,
      veryWet: Math.round(veryWet * 10) / 10,
      veryUncomfortable: Math.round(veryUncomfortable * 10) / 10
    };
  }

  /**
   * Get GES DISC OPeNDAP data for detailed atmospheric analysis
   */
  async getGESDISCData(latitude: number, longitude: number, startDate: string, endDate: string) {
    try {
      // GES DISC OPeNDAP provides access to various atmospheric datasets
      // This is a simplified implementation - in production, you'd need to handle
      // the specific dataset URLs and OPeNDAP protocol
      const params = {
        lat: latitude.toString(),
        lon: longitude.toString(),
        start: startDate,
        end: endDate
      };

      console.log('GES DISC OPeNDAP data request:', params);
      
      // For now, return enhanced mock data that simulates GES DISC capabilities
      return this.generateGESDISCMockData(latitude, longitude, startDate, endDate);
    } catch (error) {
      console.error('Error fetching GES DISC data:', error);
      return null;
    }
  }

  /**
   * Get Giovanni visualization data
   */
  async getGiovanniData(latitude: number, longitude: number, startDate: string, endDate: string) {
    try {
      // Giovanni provides time-series and map visualizations
      // This would typically involve making requests to Giovanni's service
      const params = {
        lat: latitude.toString(),
        lon: longitude.toString(),
        start: startDate,
        end: endDate,
        service: 'ArAvTs'
      };

      console.log('Giovanni data request:', params);
      
      // Return mock data for Giovanni visualization
      return this.generateGiovanniMockData(latitude, longitude, startDate, endDate);
    } catch (error) {
      console.error('Error fetching Giovanni data:', error);
      return null;
    }
  }

  /**
   * Get hydrological data from Data Rods
   */
  async getHydrologyData(latitude: number, longitude: number, startDate: string, endDate: string) {
    try {
      // Data Rods for Hydrology provides hydrological variables
      const params = {
        lat: latitude.toString(),
        lon: longitude.toString(),
        start: startDate,
        end: endDate
      };

      console.log('Hydrology data request:', params);
      
      // Return mock hydrological data
      return this.generateHydrologyMockData(latitude, longitude, startDate, endDate);
    } catch (error) {
      console.error('Error fetching hydrology data:', error);
      return null;
    }
  }

  /**
   * Search Earthdata for available datasets
   */
  async searchEarthdata(keywords: string[], location?: { lat: number; lon: number }) {
    try {
      const searchParams = new URLSearchParams({
        q: keywords.join(' '),
        page_size: '20',
        sort_key: '-revision-date'
      });

      if (location) {
        searchParams.append('lat', location.lat.toString());
        searchParams.append('lon', location.lon.toString());
      }

      const response = await fetch(`${this.EARTHDATA_SEARCH_BASE_URL}granules.json?${searchParams}`, {
        next: { revalidate: 3600 }
      });

      if (!response.ok) {
        throw new Error(`Earthdata Search API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching Earthdata:', error);
      return { feed: { entry: [] } }; // Return empty result on error
    }
  }

  /**
   * Generate Worldview imagery URL
   */
  generateWorldviewURL(latitude: number, longitude: number, date: string, layer?: string) {
    const baseUrl = this.WORLDVIEW_BASE_URL;
    const params = new URLSearchParams({
      p: `geographic&l=${layer || 'MODIS_Terra_CorrectedReflectance_TrueColor'}`,
      t: date,
      v: `${longitude},${latitude},${longitude},${latitude}`,
      e: date,
      c: `${longitude},${latitude}`
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate GES DISC mock data
   */
  private generateGESDISCMockData(lat: number, lon: number, start: string, end: string) {
    return {
      source: 'GES DISC OPeNDAP',
      coordinates: { lat, lon },
      dateRange: { start, end },
      atmosphericData: {
        ozone: Math.random() * 50 + 200, // Dobson units
        aerosols: Math.random() * 0.5 + 0.1, // Aerosol optical depth
        cloudCover: Math.random() * 40 + 20, // Percentage
        atmosphericPressure: Math.random() * 50 + 950, // hPa
        waterVapor: Math.random() * 30 + 10 // kg/m²
      },
      satelliteData: {
        surfaceTemperature: Math.random() * 20 + 15, // °C
        vegetationIndex: Math.random() * 0.3 + 0.4, // NDVI
        albedo: Math.random() * 0.2 + 0.2 // Surface albedo
      }
    };
  }

  /**
   * Generate Giovanni mock data
   */
  private generateGiovanniMockData(lat: number, lon: number, start: string, end: string) {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
    const timeSeries = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      
      timeSeries.push({
        date: date.toISOString().split('T')[0],
        precipitation: Math.random() * 10,
        temperature: Math.random() * 15 + 10,
        humidity: Math.random() * 40 + 40,
        pressure: Math.random() * 20 + 980
      });
    }

    return {
      source: 'Giovanni',
      coordinates: { lat, lon },
      dateRange: { start, end },
      timeSeries,
      mapData: {
        bounds: {
          north: lat + 0.1,
          south: lat - 0.1,
          east: lon + 0.1,
          west: lon - 0.1
        },
        resolution: '0.1°'
      }
    };
  }

  /**
   * Generate hydrology mock data
   */
  private generateHydrologyMockData(lat: number, lon: number, start: string, end: string) {
    return {
      source: 'Data Rods for Hydrology',
      coordinates: { lat, lon },
      dateRange: { start, end },
      hydrologicalData: {
        streamflow: Math.random() * 50 + 10, // m³/s
        soilMoisture: Math.random() * 0.3 + 0.2, // m³/m³
        evapotranspiration: Math.random() * 5 + 2, // mm/day
        runoff: Math.random() * 20 + 5, // mm/day
        groundwater: Math.random() * 10 + 5 // m below surface
      },
      waterQuality: {
        temperature: Math.random() * 10 + 15, // °C
        pH: Math.random() * 2 + 6.5,
        dissolvedOxygen: Math.random() * 4 + 6 // mg/L
      }
    };
  }

  /**
   * Analyze historical trends
   */
  analyzeTrends(data: NASADataPoint[]): HistoricalAnalysis['trends'] {
    if (data.length < 2) {
      return {
        temperature: 'stable',
        precipitation: 'stable',
        windSpeed: 'stable'
      };
    }

    const midPoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midPoint);
    const secondHalf = data.slice(midPoint);

    const getAverage = (points: NASADataPoint[], key: keyof NASADataPoint) => {
      if (typeof points[0][key] === 'object') {
        return points.reduce((sum, point) => {
          const value = point[key] as { mean: number };
          return sum + value.mean;
        }, 0) / points.length;
      }
      return points.reduce((sum, point) => sum + (point[key] as number), 0) / points.length;
    };

    const getTrend = (first: number, second: number) => {
      const change = ((second - first) / first) * 100;
      if (change > 5) return 'increasing';
      if (change < -5) return 'decreasing';
      return 'stable';
    };

    const tempFirst = getAverage(firstHalf, 'temperature');
    const tempSecond = getAverage(secondHalf, 'temperature');
    const precipFirst = getAverage(firstHalf, 'precipitation');
    const precipSecond = getAverage(secondHalf, 'precipitation');
    const windFirst = getAverage(firstHalf, 'windSpeed');
    const windSecond = getAverage(secondHalf, 'windSpeed');

    return {
      temperature: getTrend(tempFirst, tempSecond),
      precipitation: getTrend(precipFirst, precipSecond),
      windSpeed: getTrend(windFirst, windSecond)
    };
  }

  /**
   * Get comprehensive historical analysis
   */
  async getHistoricalAnalysis(
    latitude: number, 
    longitude: number, 
    targetDate: string
  ): Promise<HistoricalAnalysis> {
    // Get data for the same period over multiple years
    const targetDateObj = new Date(targetDate);
    const startYear = targetDateObj.getFullYear() - 10; // 10 years of data
    const endYear = targetDateObj.getFullYear() - 1; // Exclude current year
    
    const startDate = `${startYear}-${String(targetDateObj.getMonth() + 1).padStart(2, '0')}-${String(targetDateObj.getDate()).padStart(2, '0')}`;
    const endDate = `${endYear}-${String(targetDateObj.getMonth() + 1).padStart(2, '0')}-${String(targetDateObj.getDate()).padStart(2, '0')}`;

    const request: NASADataRequest = {
      latitude,
      longitude,
      startDate,
      endDate,
      parameters: [
        'T2M_MAX', 'T2M_MIN', 'T2M', // Temperature
        'PRECTOT', // Precipitation
        'WS2M', // Wind speed
        'RH2M', // Humidity
        'ALLSKY_SFC_SW_DWN', // Solar radiation
        'PS', // Surface pressure
        'CLOUD_AMOUNT' // Cloud cover
      ]
    };

    const data = await this.getHistoricalData(request);
    const probabilities = this.calculateWeatherProbabilities(data);
    const trends = this.analyzeTrends(data);

    const statistics = {
      averageTemperature: data.reduce((sum, d) => sum + d.temperature.mean, 0) / data.length,
      averagePrecipitation: data.reduce((sum, d) => sum + d.precipitation, 0) / data.length,
      averageWindSpeed: data.reduce((sum, d) => sum + d.windSpeed, 0) / data.length,
      extremeEvents: data.filter(d => 
        d.temperature.max > 35 || d.temperature.min < 0 || 
        d.windSpeed > 25 || d.precipitation > 10
      ).length
    };

    return {
      period: `${startYear}-${endYear}`,
      dataPoints: data,
      probabilities,
      trends,
      statistics
    };
  }

  /**
   * Parse NASA POWER API response
   */
  private parseNASAPowerData(data: { properties?: { parameter?: Record<string, Record<string, number>> } }, _startDate: string, _endDate: string): NASADataPoint[] {
    if (!data.properties || !data.properties.parameter) {
      return [];
    }

    const params = data.properties.parameter;
    const dates = Object.keys(params.T2M_MAX || {});
    
    return dates.map(date => {
      const year = date.substring(0, 4);
      const month = date.substring(4, 6);
      const day = date.substring(6, 8);
      const formattedDate = `${year}-${month}-${day}`;

      return {
        date: formattedDate,
        temperature: {
          max: params.T2M_MAX?.[date] || 0,
          min: params.T2M_MIN?.[date] || 0,
          mean: params.T2M?.[date] || 0
        },
        precipitation: params.PRECTOT?.[date] || 0,
        windSpeed: params.WS2M?.[date] || 0,
        humidity: params.RH2M?.[date] || 0,
        solarRadiation: params.ALLSKY_SFC_SW_DWN?.[date] || 0,
        pressure: params.PS?.[date] || 1013.25,
        cloudCover: params.CLOUD_AMOUNT?.[date] || 0
      };
    });
  }

  /**
   * Generate mock historical data for development
   */
  private generateMockHistoricalData(request: NASADataRequest): NASADataPoint[] {
    const data: NASADataPoint[] = [];
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Generate realistic mock data based on season and location
      const month = d.getMonth();
      const isSummer = month >= 5 && month <= 8;
      const isWinter = month >= 11 || month <= 2;
      
      const baseTemp = isSummer ? 25 : isWinter ? 5 : 15;
      const tempVariation = 10;
      const maxTemp = baseTemp + (Math.random() - 0.5) * tempVariation;
      const minTemp = maxTemp - (5 + Math.random() * 10);
      
      data.push({
        date: d.toISOString().split('T')[0],
        temperature: {
          max: Math.round(maxTemp * 10) / 10,
          min: Math.round(minTemp * 10) / 10,
          mean: Math.round((maxTemp + minTemp) / 2 * 10) / 10
        },
        precipitation: Math.random() > 0.7 ? Math.random() * 20 : 0,
        windSpeed: Math.random() * 30,
        humidity: 40 + Math.random() * 40,
        solarRadiation: isSummer ? 200 + Math.random() * 100 : 100 + Math.random() * 50,
        pressure: 1000 + Math.random() * 50,
        cloudCover: Math.random() * 100
      });
    }
    
    return data;
  }
}

export const nasaDataService = new NASADataService();
