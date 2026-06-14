import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, Bot, AlertCircle, RefreshCw } from "lucide-react";
import { ChatMessage, WeatherData } from "../types";

interface WeatherChatProps {
  weatherData: WeatherData | null;
  locationName: string;
}

const PRESET_PROMPTS = [
  "Should I bring an umbrella today?",
  "Is the weather suitable for an outdoor run?",
  "What is the best time today for a walk?",
  "How should I dress for commuting today?"
];

export default function WeatherChat({ weatherData, locationName }: WeatherChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: `Hello! I am your AI Weather Companion. I'm connected to the real-time forecast for **${locationName}**.\n\nAsk me anything! For example, "What should I wear this evening?" or "Is it a good day for gardening?"`,
      role: "assistant",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      content: text,
      role: "user",
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/weather/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          weatherData,
          locationName
        })
      });

      if (!response.ok) {
        throw new Error("Chat assistant was unable to process the query.");
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        content: data.reply,
        role: "assistant",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to reach the AI assistant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl" id="weather-chat-widget">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-1">
              Weather AI Assistant
            </h3>
            <p className="text-xs text-slate-400">Context: {locationName}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages([
              {
                id: "welcome",
                content: `Reset complete! Ask me any details about weather plans for **${locationName}**.`,
                role: "assistant",
                timestamp: new Date()
              }
            ]);
            setError(null);
          }}
          className="text-xs text-slate-400 hover:text-slate-100 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 transition"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[280px] max-h-[360px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-slate-800 text-slate-200"
                  : "bg-indigo-600 text-slate-100"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div>
              <div
                className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-slate-800 text-slate-100 rounded-tr-none"
                    : "bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-slate-100 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 text-sm italic flex items-center gap-2">
              <span className="flex space-x-1">
                <span className="block w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                <span className="block w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="block w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
              AI is reviewing conditions...
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl flex items-center gap-2 text-red-300 text-xs text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset click tools */}
      <div className="p-2 bg-slate-950/40 border-t border-slate-800/80 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        {PRESET_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] text-indigo-400 bg-slate-950/80 border border-indigo-900/40 hover:bg-indigo-950/40 hover:border-indigo-800/80 transition-colors px-2.5 py-1.5 rounded-full"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about current ${locationName} weather...`}
          className="flex-1 bg-slate-900 text-slate-100 text-sm px-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600 border border-slate-800"
          id="chat-user-input"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-slate-100 p-2 rounded-xl flex items-center justify-center shrink-0 transition"
          id="submit-chat-button"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
