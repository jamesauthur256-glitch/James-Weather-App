import React, { useState, useEffect } from "react";
import { 
  Navigation, 
  MapPin, 
  Search, 
  Thermometer, 
  CloudRain, 
  Sparkles, 
  Calendar, 
  Clock, 
  Compass, 
  RotateCw,
  AlertCircle,
  HelpCircle,
  Sun,
  X
} from "lucide-react";
import WeatherStatsGrid from "./components/WeatherStatsGrid";
import WeatherChat from "./components/WeatherChat";
import AIWeatherInsights from "./components/AIWeatherInsights";
import { WeatherData, LocationInfo, AIInsights } from "./types";
import { getWeatherCondition, formatTemp, formatDayShort, formatHour, formatDate } from "./utils";

// Fallback to Copenhagen, Denmark as defined in Natural Tones theme rules
const DEFAULT_LOCATION: LocationInfo = {
  name: "Copenhagen",
  country: "Denmark",
  latitude: 55.6761,
  longitude: 12.5683,
  timezone: "Europe/Copenhagen"
};

export default function App() {
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [unit, setUnit] = useState<"c" | "f">("c");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [authLocationState, setAuthLocationState] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

  // AI insights state
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Load weather when current location transitions
  useEffect(() => {
    fetchWeather(currentLocation);
  }, [currentLocation]);

  // Request browser geolocation on mount
  useEffect(() => {
    handleRequestBrowserLocation();
  }, []);

  const handleRequestBrowserLocation = () => {
    if (!navigator.geolocation) {
      setAuthLocationState("denied");
      return;
    }

    setAuthLocationState("requesting");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setAuthLocationState("granted");
        
        // Attempt reverse geocoding to find a friendly city name
        let resolvedCity = "Local Area";
        let resolvedCountry = "Coordinates";
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address;
            resolvedCity = addr.city || addr.town || addr.village || addr.suburb || "Local Area";
            resolvedCountry = addr.country || "Your Location";
          }
        } catch (e) {
          console.warn("Could not reverse-geocode city name, using coordinates description", e);
        }

        setCurrentLocation({
          name: resolvedCity,
          country: resolvedCountry,
          latitude,
          longitude
        });
      },
      (error) => {
        console.warn("Geolocation permission rejected or error", error);
        setAuthLocationState("denied");
        // Maintain fallback location
      },
      { timeout: 7000 }
    );
  };

  const fetchWeather = async (loc: LocationInfo) => {
    setIsLoading(true);
    setWeatherError(null);
    setAiInsights(null); // Clear insights to refresh for new city
    
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Unable to retrieve real-time data from weather server.");
      }
      
      const data = await res.json();
      setWeatherData({
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        elevation: data.elevation,
        current: {
          time: data.current.time,
          temperature2m: data.current.temperature_2m,
          relativeHumidity2m: data.current.relative_humidity_2m,
          apparentTemperature: data.current.apparent_temperature,
          isDay: data.current.is_day,
          precipitation: data.current.precipitation,
          weatherCode: data.current.weather_code,
          windSpeed10m: data.current.wind_speed_10m,
          windDirection10m: data.current.wind_direction_10m,
        },
        hourly: {
          time: data.hourly.time,
          temperature2m: data.hourly.temperature_2m,
          relativeHumidity2m: data.hourly.relative_humidity_2m,
          apparentTemperature: data.hourly.apparent_temperature,
          precipitationProbability: data.hourly.precipitation_probability,
          weatherCode: data.hourly.weather_code,
        },
        daily: {
          time: data.daily.time,
          weatherCode: data.daily.weather_code,
          temperature2mMax: data.daily.temperature_2m_max,
          temperature2mMin: data.daily.temperature_2m_min,
          sunrise: data.daily.sunrise,
          sunset: data.daily.sunset,
          uvIndexMax: data.daily.uv_index_max,
          precipitationProbabilityMax: data.daily.precipitation_probability_max,
        }
      });

      // Automatically fetch AI Insights for this newly loaded city
      generateAIInsights(data, loc);
    } catch (err: any) {
      console.error(err);
      setWeatherError("Weather forecast is temporarily unavailable. Check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=5&language=en&format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          const places: LocationInfo[] = data.results.map((item: any) => ({
            name: item.name,
            country: item.country || "",
            state: item.admin1 || "",
            latitude: item.latitude,
            longitude: item.longitude,
            timezone: item.timezone
          }));
          setSearchResults(places);
          setShowDropdown(true);
        } else {
          setSearchResults([]);
        }
      }
    } catch (e) {
      console.error("Geocoding lookup failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlace = (place: LocationInfo) => {
    setCurrentLocation(place);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const generateAIInsights = async (providedWeather: any, loc: LocationInfo) => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const weatherToSend = providedWeather || weatherData;
      if (!weatherToSend) return;

      const res = await fetch("/api/weather/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weatherData: weatherToSend,
          locationName: `${loc.name}, ${loc.country}`
        })
      });

      if (!res.ok) {
        throw new Error("Unable to synthesize customized AI weather insights.");
      }

      const parsed = await res.json();
      setAiInsights(parsed);
    } catch (e: any) {
      console.warn("AI Insights generation failed", e);
      setAiError("AI insights could not be populated right now.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Get active condition properties
  const activeCondition = weatherData 
    ? getWeatherCondition(weatherData.current.weatherCode, weatherData.current.isDay === 1)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-red-100 font-sans text-[#2d2d2a] py-6 px-4 md:px-12 flex flex-col items-center relative overflow-hidden">
      
      {/* Decorative ambient air current and warm thermal cells (Blue and Red) */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-300/30 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-red-300/25 blur-[130px] pointer-events-none" />
      
      {/* Outer bounds width restriction */}
      <div className="w-full max-w-7xl flex flex-col gap-8 relative z-10">
        
        {/* Search Bar / Geocode Utilities Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-blue-200/50 pb-6">
          
          {/* Logo Title */}
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-serif text-[#2d2d2a] font-semibold flex items-center gap-1">
              <Sun className="w-5 h-5 text-red-600 animate-spin-slow" />
              Natural Weather
            </span>
            <span className="text-xs bg-blue-600/10 px-2.5 py-1 rounded-full text-blue-700 font-medium uppercase tracking-wider">
              Real-Time
            </span>
          </div>

          {/* Autocomplete form */}
          <div className="relative w-full md:w-96" id="location-picker">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-blue-600" />
              <input
                type="text"
                placeholder="Search global cities (e.g. Kyoto, London...)"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-white border border-stone-200 rounded-full pl-10 pr-10 py-2.5 text-sm font-medium text-[#2d2d2a] placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition"
              />
              {isSearching ? (
                <RotateCw className="absolute right-4 w-4 h-4 text-blue-600 animate-spin" />
              ) : searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(""); setSearchResults([]); setShowDropdown(false); }}
                  className="absolute right-4 w-4 h-4 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions drop card */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-white border border-stone-200 rounded-2xl shadow-lg overflow-hidden z-50 animate-fade-in">
                {searchResults.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPlace(p)}
                    className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between border-b border-stone-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#2d2d2a]">{p.name}</p>
                      <p className="text-xs text-stone-400">
                        {p.state ? `${p.state}, ` : ""}{p.country}
                      </p>
                    </div>
                    <MapPin className="w-4 h-4 text-blue-600/70" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Geolocation request and Units controller */}
          <div className="flex gap-3 items-center">
            {/* Geolocation Button */}
            <button
              onClick={handleRequestBrowserLocation}
              disabled={authLocationState === "requesting"}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold uppercase tracking-wider transition ${
                authLocationState === "granted"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-[#2d2d2a] border-stone-200 hover:border-blue-600"
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${authLocationState === "requesting" ? "animate-spin" : ""}`} />
              {authLocationState === "requesting" ? "Syncing..." : "My Geolocation"}
            </button>

            {/* Unit pill switcher */}
            <div className="bg-stone-250/10 backdrop-blur-sm p-1 rounded-full flex gap-1 shadow-inner bg-stone-200">
              <button
                onClick={() => setUnit("c")}
                className={`w-9 h-7 rounded-full text-xs font-bold transition flex items-center justify-center ${
                  unit === "c" ? "bg-white text-[#2d2d2a] shadow-sm" : "text-stone-600 hover:text-[#2d2d2a]"
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setUnit("f")}
                className={`w-9 h-7 rounded-full text-xs font-bold transition flex items-center justify-center ${
                  unit === "f" ? "bg-white text-[#2d2d2a] shadow-sm" : "text-stone-600 hover:text-[#2d2d2a]"
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </div>

        {/* Global Loading or Error messaging */}
        {isLoading && !weatherData && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-red-500 rounded-full animate-spin"></div>
            <p className="font-serif italic text-stone-500">Acquiring conditions for {currentLocation.name}...</p>
          </div>
        )}

        {weatherError && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-3xl max-w-2xl mx-auto flex items-center gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p>{weatherError}</p>
          </div>
        )}

        {/* Weather Main Grid System */}
        {weatherData && activeCondition && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT / MAIN COLUMN (8 Columns on Large Display) */}
            <div className="lg:col-span-8 flex flex-col gap-8">
                            {/* App Shell Display Title & Banner */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="location-info">
                  <h1 className="font-serif text-5xl md:text-[5.5rem] font-light leading-[1.05] tracking-tight text-[#2d2d2a]">
                    {currentLocation.name},
                  </h1>
                  <p className="text-sm font-semibold tracking-widest text-blue-700 uppercase mt-2 font-mono">
                    {currentLocation.country}
                  </p>
                </div>
                <div className="bg-blue-600/10 text-blue-700 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(weatherData.current.time)}
                </div>
              </div>

              {/* Hero Weather Temperature Visual */}
              <div className="py-6 border-y border-blue-100 my-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-baseline leading-[0.85]">
                    <span className="font-serif font-light text-[7.5rem] md:text-[11rem] tracking-tighter text-[#2d2d2a]">
                      {unit === "c" 
                        ? Math.round(weatherData.current.temperature2m)
                        : Math.round((weatherData.current.temperature2m * 9) / 5 + 32)
                      }
                    </span>
                    <span className="text-4xl md:text-5xl font-light text-red-600 font-serif ml-1 vertical-top">
                      °{unit.toUpperCase()}
                    </span>
                  </div>
                  <div className="font-serif italic text-2xl md:text-3xl text-blue-800 mt-1">
                    {activeCondition.label} with soft breeze
                  </div>
                </div>

                {/* Condition Large Emblem */}
                <div className="p-6 bg-white/70 border border-blue-100 rounded-[40px] flex items-center justify-center relative shadow-md shrink-0 w-36 h-36 md:w-44 md:h-44">
                  <activeCondition.icon className="w-20 h-20 md:w-24 md:h-24 text-blue-600 animate-pulse" />
                </div>
              </div>

              {/* Hourly Forecast (24 Hours Scroll Carousel) */}
              <div className="bg-white border border-stone-200 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> 24-Hour Timeline
                  </span>
                  <span className="text-[10px] text-stone-400">Horizontal scroll</span>
                </div>

                {/* Scroll Wrapper */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-100">
                  {weatherData.hourly.time.slice(0, 24).map((timeStr, idx) => {
                    const temp = weatherData.hourly.temperature2m[idx];
                    const code = weatherData.hourly.weatherCode[idx];
                    const rainPt = weatherData.hourly.precipitationProbability[idx];
                    const cond = getWeatherCondition(code, true);

                    return (
                      <div 
                        key={idx}
                        className="flex flex-col items-center justify-between p-3.5 bg-blue-50/40 rounded-2xl min-w-[76px] text-center border border-blue-100/30 relative hover:border-blue-500/30 transition shadow-sm"
                      >
                        <span className="text-[10px] text-blue-800 font-semibold">
                          {formatHour(timeStr)}
                        </span>
                        <cond.icon className="w-5 h-5 text-blue-600/95 my-2" />
                        <span className="text-sm font-serif font-bold text-[#2d2d2a]">
                          {formatTemp(temp, unit)}
                        </span>
                        {rainPt > 0 && (
                          <span className="text-[9px] text-sky-700 font-bold mt-1 flex items-center gap-0.5">
                            💧{rainPt}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Forecast Blocks */}
              <div className="bg-white border border-stone-200 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5 border-b border-stone-100 pb-3">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> 7-Day Outlook predictions
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                    High / Low
                  </span>
                </div>

                {/* Cards Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {weatherData.daily.time.map((timeStr, idx) => {
                    const maxTemp = weatherData.daily.temperature2mMax[idx];
                    const minTemp = weatherData.daily.temperature2mMin[idx];
                    const code = weatherData.daily.weatherCode[idx];
                    const cond = getWeatherCondition(code, true);

                    return (
                      <div 
                        key={idx}
                        className="bg-red-50/20 border border-red-100/50 rounded-2xl p-3.5 text-center flex flex-col justify-between items-center transition hover:shadow-sm hover:border-red-500/40"
                      >
                        <span className="text-[11px] font-semibold text-red-800 uppercase tracking-wider">
                          {formatDayShort(timeStr)}
                        </span>
                        
                        <div className="my-3 flex items-center justify-center p-1.5 bg-red-100/40 rounded-xl">
                          <cond.icon className="w-6 h-6 text-red-600" />
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-serif font-bold text-[#2d2d2a]">
                            {formatTemp(maxTemp, unit)}
                          </span>
                          <span className="text-[10px] font-medium text-stone-400">
                            {formatTemp(minTemp, unit)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid of weather metrics */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider px-2">
                  Atmospheric Indicators
                </span>
                <WeatherStatsGrid weatherData={weatherData} unit={unit} />
              </div>

            </div>

            {/* RIGHT PANEL COLUMN (4 Columns on Large Display) */}
            <aside className="lg:col-span-4 flex flex-col gap-8">
              
              {/* AI Insight Highlights Panel */}
              <AIWeatherInsights 
                insights={aiInsights} 
                isLoading={isAiLoading} 
                onGenerate={() => generateAIInsights(weatherData, currentLocation)} 
              />

              {/* Weather Companion AI Agent */}
              <WeatherChat 
                weatherData={weatherData} 
                locationName={`${currentLocation.name}, ${currentLocation.country}`} 
              />

              {/* Theme Credit Card */}
              <div className="p-5 bg-white border border-blue-100 rounded-[32px] text-stone-700 shadow-sm">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 animate-spin" /> Live Radar Simulation
                </h4>
                <p className="text-[11px] text-stone-505 text-stone-500 mt-1 leading-normal">
                  Tracking fine wind anomalies and pressure fronts around {currentLocation.name}. Radar online and integrated.
                </p>
                <div className="relative mt-3 h-28 bg-blue-50/40 rounded-2xl overflow-hidden border border-blue-150 flex items-center justify-center">
                  <div className="absolute w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                  <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                  {/* Radar Circles */}
                  <div className="absolute border border-blue-200/50 w-8 h-8 rounded-full"></div>
                  <div className="absolute border border-blue-200/50 w-16 h-16 rounded-full"></div>
                  <div className="absolute border border-blue-200/50 w-24 h-24 rounded-full"></div>
                </div>
              </div>

            </aside>

          </div>
        )}

      </div>
    </div>
  );
}
