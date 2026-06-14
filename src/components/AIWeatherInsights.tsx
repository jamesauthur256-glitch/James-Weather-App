import React from "react";
import { Sparkles, Shirt, ShieldCheck, Compass, MessageSquare } from "lucide-react";
import { AIInsights } from "../types";

interface AIWeatherInsightsProps {
  insights: AIInsights | null;
  isLoading: boolean;
  onGenerate: () => void;
}

export default function AIWeatherInsights({ insights, isLoading, onGenerate }: AIWeatherInsightsProps) {
  return (
    <div className="bg-white border border-stone-200 rounded-[32px] p-6 shadow-sm flex flex-col gap-5 justify-between" id="ai-insights-panel">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#e2e2d8] text-[#5a5a40] rounded-full">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-[#2d2d2a]">AI Lifestyle Guide</h3>
            <p className="text-xs text-[#5a5a40] tracking-wider uppercase font-medium">Real-Time Recommendations</p>
          </div>
        </div>
      </div>

      {/* Loading or Content State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute w-full h-full border-4 border-[#e2e2d8] rounded-full"></div>
            <div className="absolute w-full h-full border-4 border-t-[#5a5a40] rounded-full animate-spin"></div>
            <Sparkles className="w-5 h-5 text-[#5a5a40]" />
          </div>
          <div>
            <p className="text-sm font-serif italic text-[#5a5a40]">Analyzing weather conditions...</p>
            <p className="text-xs text-stone-400 mt-1">Synthesizing attire & activities advice</p>
          </div>
        </div>
      ) : insights ? (
        <div className="space-y-5 animate-fade-in text-left">
          {/* Highlights */}
          <div className="p-4 bg-[#f8f7f2] rounded-2xl border border-stone-100">
            <p className="font-serif text-[#2d2d2a] text-sm leading-relaxed italic">
              "{insights.highlights}"
            </p>
          </div>

          {/* Attire & Gear */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attire */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#5a5a40] tracking-wider uppercase flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5" /> Wear Today
              </span>
              <ul className="space-y-1.5">
                {insights.attire.map((item, idx) => (
                  <li key={idx} className="text-xs text-stone-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#5a5a40]/60 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Gear */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#5a5a40] tracking-wider uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Essential Gear
              </span>
              <ul className="space-y-1.5">
                {insights.gear.map((item, idx) => (
                  <li key={idx} className="text-xs text-stone-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-yellow-600/70 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Outdoor Activity Score */}
          <div className="pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Outdoor activity potential
              </span>
              <span className="font-serif font-bold text-sm text-[#2d2d2a]">
                {insights.activityScore} / 10
              </span>
            </div>
            
            {/* Bar meter */}
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#5a5a40] transition-all duration-1000"
                style={{ width: `${insights.activityScore * 10}%` }}
              ></div>
            </div>

            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              {insights.activityExplanation}
            </p>
          </div>

          {/* Delightful Note */}
          {insights.specialNote && (
            <div className="text-[11px] text-[#5a5a40] font-serif border-l-2 border-[#5a5a40] pl-3 py-0.5 mt-2 italic leading-normal">
              {insights.specialNote}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-xs text-stone-500 mb-3">No custom lifestyle insights loaded yet.</p>
          <button
            onClick={onGenerate}
            className="px-4 py-2 bg-[#5a5a40] text-white rounded-full text-xs font-semibold hover:bg-[#2d2d2a] transition"
          >
            Generate AI Insights
          </button>
        </div>
      )}
    </div>
  );
}
