'use client';

import { useEffect, useState } from 'react';
import { Cloud, Wind, Droplets, Thermometer } from 'lucide-react';

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  wind: number;
  desc: string;
  icon: string;
}

interface Props {
  province: string;
}

// Аймаг → wttr.in-д ойлгогдох хот нэр
const PROVINCE_CITIES: Record<string, string> = {
  'Архангай':    'Tsetserleg',
  'Баян-Өлгий': 'Olgii',
  'Баянхонгор':  'Bayankhongor',
  'Булган':      'Bulgan',
  'Говь-Алтай':  'Altai',
  'Говьсүмбэр':  'Choir',
  'Дархан-Уул':  'Darkhan',
  'Дорноговь':   'Sainshand',
  'Дорнод':      'Choibalsan',
  'Дундговь':    'Mandalgovi',
  'Завхан':      'Uliastai',
  'Орхон':       'Erdenet',
  'Өвөрхангай':  'Arvaikheer',
  'Өмнөговь':    'Dalanzadgad',
  'Сэлэнгэ':     'Sukhbaatar',
  'Сүхбаатар':   'Baruun-Urt',
  'Төв':         'Zuunmod',
  'Увс':         'Ulaangom',
  'Ховд':        'Khovd',
  'Хэнтий':      'Undurkhaan',
  'Хөвсгөл':     'Murun',
};

export default function WeatherWidget({ province }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const city = PROVINCE_CITIES[province] ?? 'Ulaanbaatar';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const cur = data?.current_condition?.[0];
        if (!cur) return;
        setWeather({
          temp:       parseInt(cur.temp_C),
          feels_like: parseInt(cur.FeelsLikeC),
          humidity:   parseInt(cur.humidity),
          wind:       parseInt(cur.windspeedKmph),
          desc:       cur.lang_mn?.[0]?.value ?? cur.weatherDesc?.[0]?.value ?? '',
          icon:       getWeatherEmoji(parseInt(cur.weatherCode)),
        });
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [city]);

  if (loading) {
    return (
      <div className="card p-5">
        <div className="h-4 w-32 bg-forest-100 rounded animate-pulse mb-3" />
        <div className="h-12 w-24 bg-forest-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-forest-900 mb-3 flex items-center gap-2">
        <Cloud size={16} className="text-sky-500" />
        Одоогийн цаг агаар
        <span className="text-xs text-forest-400 font-normal ml-auto">{province}</span>
      </h3>

      <div className="flex items-center gap-4 mb-3">
        <div className="text-4xl">{weather.icon}</div>
        <div>
          <div className="text-3xl font-bold text-forest-900">{weather.temp}°C</div>
          <div className="text-sm text-forest-500">{weather.desc}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-forest-600">
        <div className="flex items-center gap-1.5">
          <Thermometer size={12} className="text-amber-500" />
          Мэдрэмж {weather.feels_like}°
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets size={12} className="text-blue-500" />
          {weather.humidity}%
        </div>
        <div className="flex items-center gap-1.5">
          <Wind size={12} className="text-gray-500" />
          {weather.wind} км/ц
        </div>
      </div>
    </div>
  );
}

function getWeatherEmoji(code: number): string {
  if (code === 113) return '☀️';
  if (code === 116) return '⛅';
  if (code === 119 || code === 122) return '☁️';
  if ([143,248,260].includes(code)) return '🌫️';
  if ([176,263,266,293,296].includes(code)) return '🌦️';
  if ([299,302,305,308].includes(code)) return '🌧️';
  if ([179,182,185,227,230,323,326,329,332,335,338,350,368,371,374,377].includes(code)) return '❄️';
  if ([200,386,389,392,395].includes(code)) return '⛈️';
  return '🌤️';
}
