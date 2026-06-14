import React from "react";
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Navigation, 
  CloudRain, 
  Sun, 
  Compass, 
  ArrowDownLeft 
} from "lucide-react";
import { WeatherData } from "../types";
import { formatTemp } from "../utils";

interface WeatherStatsGridProps {
  weatherData: WeatherData;
  unit: "c" | "f";
}

export default function WeatherStatsGrid({ weatherData, unit }: WeatherStatsGridProps) {
  const current = weatherData.current;
  const todayDaily = weatherData.daily;

  // Formatting sunrise and sunset
  const formatTimeStr = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  };

  const uvLevel = (uv: number) => {
    if (uv <= 2) return { text: "Low", color: "text-green-800 bg-green-100" };
    if (uv <= 5) return { text: "Moderate", color: "text-amber-800 bg-amber-100" };
    if (uv <= 7) return { text: "High", color: "text-orange-850 bg-orange-100" };
    return { text: "Very High", color: "text-red-800 bg-red-100" };
  };

  const getWindDirectionName = (deg: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return directions[index];
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="weather-stats-grid">
      {/* Sensation Block - styled in deep sage-olive according to design requirements */}
      <div className="bg-[#5a5a40] text-stone-100 p-5 rounded-[32px] border border-stone-800/10 shadow-sm flex flex-col justify-between min-h-[140px] transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-stone-300">Feels Like</span>
          <Thermometer className="w-5 h-5 text-amber-200" />
        </div>
        <div>
          <h4 className="text-3xl font-serif font-medium text-white mt-2">
            {formatTemp(current.apparentTemperature, unit)}
          </h4>
          <p className="text-xs text-stone-300 mt-1">
            {current.apparentTemperature > current.temperature2m ? "Warmer than actual" : "Comfortably cool"}
          </p>
        </div>
      </div>

      {/* Humid Atmosphere Block */}
      <div className="bg-white p-5 rounded-[32px] border border-stone-200 shadow-sm flex flex-col justify-between min-h-[140px] transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#5a5a40]">Humidity</span>
          <Droplets className="w-5 h-5 text-[#5a5a40]" />
        </div>
        <div>
          <h4 className="text-3xl font-serif font-medium text-[#2d2d2a] mt-2">
            {current.relativeHumidity2m}%
          </h4>
          <p className="text-xs text-stone-500 mt-1">
            {current.relativeHumidity2m > 65 ? "Damp atmosphere" : "Comfortable air"}
          </p>
        </div>
      </div>

      {/* Wind Dynamic Block */}
      <div className="bg-white p-5 rounded-[32px] border border-stone-200 shadow-sm flex flex-col justify-between min-h-[140px] transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#5a5a40]">Wind dynamic</span>
          <Wind className="w-5 h-5 text-[#5a5a40]" />
        </div>
        <div>
          <h4 className="text-2xl font-serif font-medium text-[#2d2d2a] mt-2 flex items-baseline gap-1">
            {Math.round(current.windSpeed10m)} <span className="text-xs font-sans font-normal text-[#5a5a40]">km/h</span>
          </h4>
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
            <Navigation 
              className="w-3 h-3 text-[#5a5a40]" 
              style={{ transform: `rotate(${current.windDirection10m}deg)` }} 
            />
            {getWindDirectionName(current.windDirection10m)} ({current.windDirection10m}°)
          </p>
        </div>
      </div>

      {/* Precipitation probability card */}
      <div className="bg-[#5a5a40] text-stone-100 p-5 rounded-[32px] border border-stone-800/10 shadow-sm flex flex-col justify-between min-h-[140px] transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-stone-300">Rain Chance</span>
          <CloudRain className="w-5 h-5 text-sky-200" />
        </div>
        <div>
          <h4 className="text-3xl font-serif font-medium text-white mt-2">
            {todayDaily.precipitationProbabilityMax?.[0] ?? 0}%
          </h4>
          <p className="text-xs text-stone-300 mt-1">
            Daily peak probability
          </p>
        </div>
      </div>

      {/* UV Exposure level */}
      <div className="bg-white p-5 rounded-[32px] border border-stone-200 shadow-sm flex flex-col justify-between min-h-[140px] transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#5a5a40]">UV Index</span>
          <Sun className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h4 className="text-2xl font-serif font-medium text-[#2d2d2a] mt-2 flex items-center gap-2">
            {todayDaily.uvIndexMax?.[0] ?? 0}
            <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${uvLevel(todayDaily.uvIndexMax?.[0] ?? 0).color}`}>
              {uvLevel(todayDaily.uvIndexMax?.[0] ?? 0).text}
            </span>
          </h4>
          <p className="text-xs text-stone-500 mt-1">Peak radiation threat</p>
        </div>
      </div>

      {/* Sunrise Time Card */}
      <div className="bg-white p-5 rounded-[32px] border border-stone-200 shadow-sm flex flex-col justify-between min-h-[140px] transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#5a5a40]">Sunrise</span>
          <Sun className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h4 className="text-xl font-serif font-medium text-[#2d2d2a] mt-2">
            {formatTimeStr(todayDaily.sunrise?.[0] ?? "")}
          </h4>
          <p className="text-xs text-stone-500 mt-1">Sun rises above horizon</p>
        </div>
      </div>

      {/* Sunset Time Card */}
      <div className="bg-white p-5 rounded-[32px] border border-stone-200 shadow-sm flex flex-col justify-between min-h-[140px] transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#5a5a40]">Sunset</span>
          <Sun className="w-5 h-5 text-[#5a5a40]" />
        </div>
        <div>
          <h4 className="text-xl font-serif font-medium text-[#2d2d2a] mt-2">
            {formatTimeStr(todayDaily.sunset?.[0] ?? "")}
          </h4>
          <p className="text-xs text-stone-500 mt-1">Sun sets below horizon</p>
        </div>
      </div>

      {/* Elevation Track Card */}
      <div className="bg-white p-5 rounded-[32px] border border-stone-200 shadow-sm flex flex-col justify-between min-h-[140px] transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#5a5a40]">Elevation</span>
          <ArrowDownLeft className="w-5 h-5 text-[#5a5a40]" />
        </div>
        <div>
          <h4 className="text-xl font-serif font-medium text-[#2d2d2a] mt-2">
            {weatherData.elevation} <span className="text-xs font-normal text-stone-500">m</span>
          </h4>
          <p className="text-xs text-stone-500 mt-1">Above sea level elevation</p>
        </div>
      </div>
    </div>
  );
}
