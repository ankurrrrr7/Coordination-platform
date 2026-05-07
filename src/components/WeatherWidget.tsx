import { useEffect, useState, useRef } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, Zap, Sunrise, Sunset, RotateCcw } from 'lucide-react';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  weatherCode: number;
  pressure: number;
  dewPoint: number;
  uvIndex: number;
  sunrise: string;
  sunriseTime: Date;
  sunset: string;
  sunsetTime: Date;
  precipitationChance: number;
  lastUpdated: Date;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [sunriseCountdown, setSunriseCountdown] = useState('');
  const [sunsetCountdown, setSunsetCountdown] = useState('');
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,visibility,pressure_msl,dew_point_2m,uv_index,precipitation_probability&daily=sunrise,sunset&temperature_unit=celsius&wind_speed_unit=kmh`
      );
      const data = await response.json();
      const current = data.current;
      const daily = data.daily;

      const weatherDescriptions: Record<number, string> = {
        0: 'Clear Sky',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light Drizzle',
        53: 'Moderate Drizzle',
        55: 'Dense Drizzle',
        61: 'Slight Rain',
        63: 'Moderate Rain',
        65: 'Heavy Rain',
        71: 'Slight Snow',
        73: 'Moderate Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Slight Rain Showers',
        81: 'Moderate Rain Showers',
        82: 'Violent Rain Showers',
        85: 'Slight Snow Showers',
        86: 'Heavy Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Hail',
        99: 'Thunderstorm with Hail',
      };

      // Parse sunrise/sunset times
      const sunriseDate = new Date(daily.sunrise[0]);
      const sunsetDate = new Date(daily.sunset[0]);

      const sunrise = sunriseDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const sunset = sunsetDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      setWeather({
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        description: weatherDescriptions[current.weather_code] || 'Unknown',
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        visibility: current.visibility / 1000,
        weatherCode: current.weather_code,
        pressure: current.pressure_msl,
        dewPoint: Math.round(current.dew_point_2m),
        uvIndex: current.uv_index,
        sunrise,
        sunriseTime: sunriseDate,
        sunset,
        sunsetTime: sunsetDate,
        precipitationChance: current.precipitation_probability || 0,
        lastUpdated: new Date(),
      });
      setError('');
    } catch (err) {
      console.log('Failed to fetch weather:', err);
      setError('Unable to load weather');
    }
  };

  const handleRefresh = async () => {
    if (!location) return;
    setRefreshing(true);
    await fetchWeatherData(location.lat, location.lon);
    setRefreshing(false);
  };

  // Calculate time until sunrise/sunset
  const updateCountdowns = () => {
    if (!weather) return;

    const now = new Date();
    const sunriseMs = weather.sunriseTime.getTime() - now.getTime();
    const sunsetMs = weather.sunsetTime.getTime() - now.getTime();

    const formatCountdown = (ms: number) => {
      if (ms < 0) return 'Past';
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      if (hours === 0) return `${minutes}m`;
      return `${hours}h ${minutes}m`;
    };

    setSunriseCountdown(formatCountdown(sunriseMs));
    setSunsetCountdown(formatCountdown(sunsetMs));
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          await fetchWeatherData(latitude, longitude);
          setLoading(false);
        },
        (err) => {
          console.log('Geolocation error:', err);
          setError('Location access denied');
          setLoading(false);
        }
      );
    }
  }, []);

  // Update countdowns every minute
  useEffect(() => {
    updateCountdowns();
    updateIntervalRef.current = setInterval(updateCountdowns, 60000);
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [weather]);

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="w-8 h-8 text-yellow-400" />;
    if (code === 2 || code === 3) return <Cloud className="w-8 h-8 text-gray-400" />;
    if (code >= 51 && code <= 82) return <CloudRain className="w-8 h-8 text-blue-400" />;
    if (code >= 95) return <CloudRain className="w-8 h-8 text-purple-400" />;
    return <Cloud className="w-8 h-8 text-gray-400" />;
  };

  const getUVIndexLabel = (uv: number) => {
    if (uv < 3) return { label: 'Low', color: 'text-green-600' };
    if (uv < 6) return { label: 'Moderate', color: 'text-yellow-600' };
    if (uv < 8) return { label: 'High', color: 'text-orange-600' };
    return { label: 'Very High', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
        <div className="text-center text-gray-400 text-sm">Loading weather...</div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="text-center text-red-600 text-sm">{error}</div>
          {location && (
            <button
              onClick={handleRefresh}
              className="p-1.5 hover:bg-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
      {/* Header with Title and Refresh Button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">🌤️ Current Weather</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1.5 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
          title="Refresh weather data"
        >
          <RotateCcw className={`w-4 h-4 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {weather && (
        <div className="text-xs text-gray-400 mb-3 px-1">
          Updated: {weather.lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </div>
      )}
      
      {/* Main Temperature Section */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-blue-200">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-800">{weather?.temperature}</span>
            <span className="text-lg text-gray-600">°C</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 font-medium">{weather?.description}</p>
          <p className="text-xs text-gray-500">Feels like {weather?.feelsLike}°C</p>
        </div>
        <div className="flex justify-center">
          {weather && getWeatherIcon(weather.weatherCode)}
        </div>
      </div>

      {/* Quick Stats - 3 Columns */}
      <div className="grid grid-cols-3 gap-2 text-xs mb-4">
        <div className="bg-white rounded p-2 text-center">
          <div className="flex justify-center mb-1">
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div className="font-semibold text-gray-800">{weather?.humidity}%</div>
          <div className="text-gray-500">Humidity</div>
        </div>
        <div className="bg-white rounded p-2 text-center">
          <div className="flex justify-center mb-1">
            <Wind className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="font-semibold text-gray-800">{weather?.windSpeed}</div>
          <div className="text-gray-500">km/h</div>
        </div>
        <div className="bg-white rounded p-2 text-center">
          <div className="flex justify-center mb-1">
            <Eye className="w-4 h-4 text-purple-500" />
          </div>
          <div className="font-semibold text-gray-800">{weather?.visibility.toFixed(1)}</div>
          <div className="text-gray-500">km</div>
        </div>
      </div>

      {/* Additional Details - 4 Columns */}
      <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-blue-200">
        <div className="bg-white rounded p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Gauge className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs font-semibold text-gray-600">Pressure</span>
          </div>
          <div className="text-sm font-bold text-gray-800">{weather?.pressure} mb</div>
        </div>
        <div className="bg-white rounded p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Cloud className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-gray-600">Dew Point</span>
          </div>
          <div className="text-sm font-bold text-gray-800">{weather?.dewPoint}°C</div>
        </div>
        <div className="bg-white rounded p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className={`w-3.5 h-3.5 ${weather ? getUVIndexLabel(weather.uvIndex).color : ''}`} />
            <span className="text-xs font-semibold text-gray-600">UV Index</span>
          </div>
          <div className="text-sm font-bold text-gray-800">
            {weather?.uvIndex.toFixed(1)} <span className={`text-xs ${weather ? getUVIndexLabel(weather.uvIndex).color : ''}`}>({weather ? getUVIndexLabel(weather.uvIndex).label : ''})</span>
          </div>
        </div>
        <div className="bg-white rounded p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-gray-600">Precipitation</span>
          </div>
          <div className="text-sm font-bold text-gray-800">{weather?.precipitationChance}%</div>
        </div>
      </div>

      {/* Sunrise/Sunset Times - Real-Time Countdowns */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-orange-50 border border-orange-100 rounded p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Sunrise className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-semibold text-gray-600">Sunrise</span>
          </div>
          <div className="text-sm font-bold text-gray-800">{weather?.sunrise}</div>
          <div className="text-xs text-orange-600 font-medium mt-1">
            {sunriseCountdown && `In ${sunriseCountdown}`}
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Sunset className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold text-gray-600">Sunset</span>
          </div>
          <div className="text-sm font-bold text-gray-800">{weather?.sunset}</div>
          <div className="text-xs text-indigo-600 font-medium mt-1">
            {sunsetCountdown && `In ${sunsetCountdown}`}
          </div>
        </div>
      </div>
    </div>
  );
}
