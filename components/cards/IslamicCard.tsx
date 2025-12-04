import React, { useEffect, useState, useCallback } from 'react';
import { Moon, Clock, BookOpen } from 'lucide-react';
import { PrayerTime } from '../../types';
import { getQuranChapter, getQuranChapters } from '../../services/islamicService';

interface IslamicCardProps {
  prayers: PrayerTime[];
}

const IslamicCard: React.FC<IslamicCardProps> = ({ prayers }) => {
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [randomVerse, setRandomVerse] = useState<any>(null);

  const calculateNextPrayer = useCallback(() => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let upcoming = null;
    let minDiff = Infinity;

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTimeMinutes = hours * 60 + minutes;

      let diff = prayerTimeMinutes - currentTime;
      if (diff < 0) diff += 24 * 60;

      if (diff < minDiff) {
        minDiff = diff;
        upcoming = prayer;
      }
    }
    
    setNextPrayer(upcoming);
    
    const h = Math.floor(minDiff / 60);
    const m = minDiff % 60;
    setTimeLeft(`${h}h ${m}m`);
  }, [prayers]);

  const fetchRandomVerse = async () => {
    const chapters = await getQuranChapters();
    const randomChapter = chapters[Math.floor(Math.random() * chapters.length)];
    const chapterData = await getQuranChapter(randomChapter.chapter);
    const randomVerse = chapterData.verses[Math.floor(Math.random() * chapterData.verses.length)];
    setRandomVerse({
        ...randomVerse,
        chapterName: randomChapter.name
    });
  }

  useEffect(() => {
    calculateNextPrayer();
    fetchRandomVerse();
    const timer = setInterval(calculateNextPrayer, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [calculateNextPrayer]);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full relative group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full opacity-50 pointer-events-none transition-opacity group-hover:opacity-100" />

      <div className="p-6 flex flex-col h-full relative z-10">
        <div className="flex items-center gap-2 mb-4">
           <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Moon size={18} />
          </div>
          <h3 className="font-semibold text-slate-900">Islamic Corner</h3>
        </div>

        <div className="flex-1 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <BookOpen size={16} />
                <span>Ayah of the Day</span>
            </div>
            {randomVerse ? (
                <div>
                    <p className="text-sm text-slate-800 mb-2 leading-relaxed">"{randomVerse.translation}"</p>
                    <p className="text-xs text-slate-500 text-right">Surah {randomVerse.chapterName}, Ayah {randomVerse.verse}</p>
                </div>
            ) : (
                <p className="text-sm text-slate-500">Loading...</p>
            )}
        </div>

        <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Clock size={16} />
                <span>Next Prayer</span>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">{nextPrayer?.name || 'Loading...'}</h2>
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full text-sm mt-2">
                <span>{nextPrayer?.time}</span>
                <span className="text-emerald-400 mx-1">•</span>
                <span>- {timeLeft}</span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default IslamicCard;
