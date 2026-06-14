// Weather types based on Open-Meteo API outputs

export interface CurrentWeather {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
}

export interface HourlyForecast {
  time: string[];
  temperature2m: string[] | number[];
  relativeHumidity2m?: number[];
  precipitationProbability: number[];
  weatherCode: number[];
  apparentTemperature: number[];
}

export interface DailyForecast {
  time: string[];
  weatherCode: number[];
  temperature2mMax: number[];
  temperature2mMin: number[];
  sunrise: string[];
  sunset: string[];
  uvIndexMax: number[];
  precipitationSum: number[];
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  elevation: number;
  current: {
    time: string;
    temperature2m: number;
    relativeHumidity2m: number;
    apparentTemperature: number;
    isDay: number;
    precipitation: number;
    weatherCode: number;
    windSpeed10m: number;
    windDirection10m: number;
  };
  hourly: {
    time: string[];
    temperature2m: number[];
    relativeHumidity2m: number[];
    apparentTemperature: number[];
    precipitationProbability: number[];
    weatherCode: number[];
  };
  daily: {
    time: string[];
    weatherCode: number[];
    temperature2mMax: number[];
    temperature2mMin: number[];
    sunrise: string[];
    sunset: string[];
    uvIndexMax: number[];
    precipitationProbabilityMax: number[];
  };
}

export interface LocationInfo {
  name: string;
  country: string;
  state?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface AIInsights {
  highlights: string;
  attire: string[];
  gear: string[];
  activityScore: number;
  activityExplanation: string;
  specialNote: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}
