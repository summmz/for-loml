import { useEffect, useState } from 'react';

// WMO weather codes -> simple categories
// https://open-meteo.com/en/docs (no API key needed)
const codeToCategory = (code) => {
  if (code === 0 || code === 1 || code === 2) return 'clear';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'storm';
  return 'clear';
};

// mood: nudges idle-message tone; tone: dropped into the chat system prompt
const categoryMeta = {
  clear: { icon: '☀️', label: 'Clear', tone: "it's clear and sunny where she is", mood: 'happy' },
  cloudy: { icon: '☁️', label: 'Cloudy', tone: "it's cloudy/overcast where she is", mood: 'neutral' },
  rain: { icon: '🌧️', label: 'Rainy', tone: "it's raining where she is — cozy, a little clingy energy", mood: 'sad' },
  fog: { icon: '🌫️', label: 'Foggy', tone: "it's foggy and quiet where she is", mood: 'sleepy' },
  snow: { icon: '❄️', label: 'Snowy', tone: "it's snowing where she is", mood: 'happy' },
  storm: { icon: '⛈️', label: 'Stormy', tone: "there's a storm where she is, might want extra comfort", mood: 'sad' },
};

const CACHE_KEY = 'nini_weather_cache';
const CACHE_MS = 30 * 60 * 1000; // 30 min

const RETRY_MS = 2 * 60 * 1000; // 2 min retry backoff when a reading fails

export function useWeather() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let retryTimer = null;

    const applyFromApi = (data) => {
      const code = data?.current?.weather_code;
      const temp = data?.current?.temperature_2m;
      if (code === undefined || cancelled) {
        throw new Error('weather: missing fields in response');
      }
      const category = codeToCategory(code);
      const result = { category, tempC: temp, ...categoryMeta[category] };
      setWeather(result);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ result, ts: Date.now() }));
      } catch {}
    };

    const fetchWeather = (lat, lon) =>
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
      )
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`open-meteo status ${r.status}`))))
        .then(applyFromApi);

    // Fallback used when browser geolocation is unavailable, denied, or times out
    // (common on iOS home-screen PWAs, or plain http hosting) — IP-based lookup,
    // no key required, so weather still populates instead of staying off forever.
    const fetchByIp = () =>
      fetch('https://ipapi.co/json/')
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`ipapi status ${r.status}`))))
        .then((loc) => {
          if (loc?.latitude == null || loc?.longitude == null) {
            throw new Error('weather: ip lookup missing coords');
          }
          return fetchWeather(loc.latitude, loc.longitude);
        });

    const scheduleRetry = (reason) => {
      console.warn('[nini weather] reading failed, will retry:', reason);
      if (cancelled) return;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(getFreshReading, RETRY_MS);
    };

    // Serve cached reading instantly so there's no header flicker on load
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.ts < CACHE_MS) {
        setWeather(cached.result);
      }
    } catch {}

    function getFreshReading() {
      if (!navigator.geolocation) {
        fetchByIp().catch(scheduleRetry);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude).catch(scheduleRetry),
        (err) => {
          // denied/unavailable/timed out — fall back to IP-based location instead of giving up
          fetchByIp().catch(() => scheduleRetry(err?.message || 'geolocation error'));
        },
        { timeout: 8000, maximumAge: CACHE_MS }
      );
    }

    getFreshReading();
    const interval = setInterval(getFreshReading, CACHE_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(retryTimer);
    };
  }, []);

  return weather; // null until available — always check before use
}
