export interface WeatherData {
  location: {
    name: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  date: string;
  endDate?: string | null;
  isMultiDay?: boolean;
  weather: {
    temperature: {
      max: number;
      min: number;
    };
    precipitation: number;
    windSpeed: number;
    windDirection: number;
    humidity: number;
    weatherCode: number;
    uvIndex: number;
    sunset: string;
    sunrise: string;
    visibility: number;
    pressure: number;
    description?: string;
  };
  dailyData?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    windspeed_10m_max: number[];
    winddirection_10m_dominant: number[];
    relative_humidity_2m_max: number[];
    weathercode: number[];
    uv_index_max: number[];
    sunset: string[];
    sunrise: string[];
  } | null;
  comfortIndex: {
    score: number;
    level: string;
    issues: string[];
    color: string;
  };
  nasaData: {
    solarRadiation: number | null;
    temperature: {
      max: number | null;
      min: number | null;
    };
    humidity: number | null;
    pressure: number | null;
    windSpeed: number | null;
    precipitation: number | null;
  } | null;
  aiRecommendation: string;
  weatherProbabilities?: {
    veryHot: number;
    veryCold: number;
    veryWindy: number;
    veryWet: number;
    veryUncomfortable: number;
  };
  historicalAnalysis?: {
    period: string;
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
  };
}

export interface WeatherSearchProps {
  onSearch: (location: string, date: string) => void;
}

export interface WeatherResultsProps {
  data: WeatherData;
}

export interface WeatherCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}
