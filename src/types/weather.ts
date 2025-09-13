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
  };
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
  } | null;
  aiRecommendation: string;
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
