import { useEffect, useState } from 'react';

interface WeatherNews {
  id: string;
  title: string;
  description: string;
}

export default function WeatherNewsFeed() {
  const [news, setNews] = useState<WeatherNews[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const weatherNews: WeatherNews[] = [
      {
        id: '1',
        title: 'Heat Advisory',
        description: 'High temperatures expected today. Stay hydrated.',
      },
      {
        id: '2',
        title: 'Monsoon Season Alert',
        description: 'Heavy rainfall expected in the next 48 hours.',
      },
      {
        id: '3',
        title: 'Air Quality Update',
        description: 'Air quality improving. Moderate levels expected tomorrow.',
      },
      {
        id: '4',
        title: 'Wind Advisory',
        description: 'Strong winds forecasted. Secure loose items.',
      },
    ];

    setNews(weatherNews);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => (prev + 2) % 1000);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const newsText = news.map((item) => `${item.title}: ${item.description}`).join(' • ');

  return (
    <div className="bg-red-600 rounded-lg overflow-hidden">
      <div className="relative h-12 flex items-center">
        <div className="absolute whitespace-nowrap text-white font-semibold text-sm" style={{
          transform: `translateX(${100 - scrollPosition}%)`,
          transition: 'none',
        }}>
          {newsText} • {newsText}
        </div>
      </div>
    </div>
  );
}
