import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  Snowflake, 
  CloudLightning,
  LucideIcon 
} from "lucide-react";

export interface WeatherCondition {
  label: string;
  icon: LucideIcon;
  gradientClass: string; // Tailwind gradient background
  accentClass: string;   // Text/Border colors corresponding to the theme
  bgOverlayClass: string; // Minimal blur/grain overlays
  cardBgClass: string;
}

export function getWeatherCondition(code: number, isDay: boolean = true): WeatherCondition {
  // WMO weather codes mapping
  if (code === 0) {
    return {
      label: isDay ? "Sky Clear / Sunny" : "Clear Night",
      icon: Sun,
      gradientClass: isDay 
        ? "from-amber-400 via-orange-400 to-amber-500" 
        : "from-slate-900 via-indigo-950 to-slate-950",
      accentClass: isDay ? "text-amber-600 border-amber-200" : "text-sky-400 border-sky-900",
      bgOverlayClass: isDay ? "bg-amber-50/40" : "bg-indigo-950/20",
      cardBgClass: isDay ? "bg-white/80 border-amber-100" : "bg-slate-900/80 border-slate-800",
    };
  }
  
  if (code >= 1 && code <= 3) {
    const isPartly = code <= 2;
    return {
      label: isPartly ? "Partly Cloudy" : "Overcast Sky",
      icon: CloudSun,
      gradientClass: isDay 
        ? "from-sky-400 via-blue-400 to-indigo-400" 
        : "from-slate-900 via-blue-950 to-slate-950",
      accentClass: isDay ? "text-blue-600 border-blue-200" : "text-blue-400 border-blue-900",
      bgOverlayClass: isDay ? "bg-blue-50/40" : "bg-slate-950/20",
      cardBgClass: isDay ? "bg-white/80 border-blue-100" : "bg-slate-900/80 border-slate-800",
    };
  }
  
  if (code === 45 || code === 48) {
    return {
      label: "Dense Fog / Mist",
      icon: CloudFog,
      gradientClass: isDay 
        ? "from-slate-300 via-gray-300 to-zinc-400" 
        : "from-neutral-900 to-neutral-950",
      accentClass: "text-zinc-600 border-zinc-200",
      bgOverlayClass: "bg-zinc-50/40",
      cardBgClass: isDay ? "bg-white/80 border-zinc-200" : "bg-neutral-900/80 border-zinc-800",
    };
  }
  
  if (code >= 51 && code <= 57) {
    return {
      label: "Drizzle Conditions",
      icon: CloudDrizzle,
      gradientClass: isDay 
        ? "from-blue-300 via-cyan-400 to-sky-400" 
        : "from-slate-900 via-slate-950 to-black",
      accentClass: "text-cyan-600 border-cyan-200",
      bgOverlayClass: "bg-cyan-50/40",
      cardBgClass: isDay ? "bg-white/80 border-cyan-100" : "bg-slate-900/80 border-slate-850",
    };
  }
  
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      label: "Rain Showers",
      icon: CloudRain,
      gradientClass: isDay 
        ? "from-blue-500 via-indigo-400 to-sky-500" 
        : "from-slate-950 via-indigo-950 to-black",
      accentClass: "text-indigo-600 border-indigo-200",
      bgOverlayClass: "bg-indigo-50/40",
      cardBgClass: isDay ? "bg-white/80 border-indigo-100" : "bg-slate-900/80 border-slate-800",
    };
  }
  
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return {
      label: "Snowfall Active",
      icon: Snowflake,
      gradientClass: isDay 
        ? "from-sky-200 via-cyan-100 to-neutral-200" 
        : "from-slate-900 via-slate-950 to-neutral-950",
      accentClass: "text-sky-500 border-sky-200",
      bgOverlayClass: "bg-sky-50/40",
      cardBgClass: isDay ? "bg-white/80 border-sky-100" : "bg-slate-900/80 border-slate-800",
    };
  }
  
  if (code >= 95 && code <= 99) {
    return {
      label: "Heavy Thunderstorms",
      icon: CloudLightning,
      gradientClass: "from-slate-800 via-purple-900 to-slate-950",
      accentClass: "text-purple-400 border-purple-900",
      bgOverlayClass: "bg-purple-950/20",
      cardBgClass: "bg-slate-950/80 border-purple-900/40",
    };
  }

  // Fallback
  return {
    label: "Settled Weather",
    icon: Cloud,
    gradientClass: isDay 
      ? "from-sky-400 to-blue-500" 
      : "from-slate-900 to-slate-950",
    accentClass: "text-blue-500 border-blue-200",
    bgOverlayClass: "bg-blue-50/20",
    cardBgClass: "bg-white/80 border-blue-100",
  };
}

export function toFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function formatTemp(c: number, unit: "c" | "f"): string {
  const val = unit === "c" ? Math.round(c) : toFahrenheit(c);
  return `${val}°${unit.toUpperCase()}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatDayOnly(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

export function formatDayShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function formatHour(dateTimeStr: string): string {
  const d = new Date(dateTimeStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}
