"use client";

import React, { useState, useEffect } from "react";

// Open-Meteo WMO weather code to emoji mapping
function getWeatherEmoji(code) {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code <= 3) return "☁️";
  if (code <= 9) return "🌫️";
  if (code <= 19) return "🌧️";
  if (code <= 29) return "⛈️";
  if (code <= 39) return "🌨️";
  if (code <= 49) return "🌫️";
  if (code <= 59) return "🌦️";
  if (code <= 69) return "🌧️";
  if (code <= 79) return "❄️";
  if (code <= 84) return "🌧️";
  if (code <= 94) return "⛈️";
  if (code <= 99) return "🌩️";
  return "🌡️";
}

function getWeatherLabel(code) {
  if (code === 0) return "Clear";
  if (code <= 2) return "Partly cloudy";
  if (code <= 3) return "Cloudy";
  if (code <= 49) return "Foggy";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

const DHAKA_LAT = 23.8103;
const DHAKA_LON = 90.4125;
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${DHAKA_LAT}&longitude=${DHAKA_LON}&current=temperature_2m,weather_code,relative_humidity_2m&temperature_unit=celsius&timezone=Asia%2FDhaka`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      const current = data.current;
      setWeather({
        temp: Math.round(current.temperature_2m),
        code: current.weather_code,
        humidity: current.relative_humidity_2m,
      });
    } catch (err) {
      console.error("Weather fetch error:", err);
      // Keep showing last known weather or nothing on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <span className="flex items-center gap-1.5 text-slate-400">
        <span className="inline-block w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
        Dhaka
      </span>
    );
  }

  if (!weather) {
    return <span>🌡️ Dhaka</span>;
  }

  return (
    <span
      className="flex items-center gap-1.5 cursor-default"
      title={`${getWeatherLabel(weather.code)} — Humidity: ${weather.humidity}%`}
    >
      <span>{getWeatherEmoji(weather.code)}</span>
      <span>{weather.temp}°C</span>
      <span className="text-slate-500">Dhaka</span>
    </span>
  );
}
