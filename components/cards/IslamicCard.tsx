import React, { useEffect, useState, useCallback } from 'react';
import { Moon, Clock } from 'lucide-react';
import { PrayerTime } from '../../types';

interface IslamicCardProps {
  prayers: PrayerTime[];
}

const IslamicCard: React.FC<IslamicCardProps> = ({ prayers }) => {
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const calculateNextPrayer = useCallback(() => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let upcoming = null;
    let minDiff = Infinity;

    // Convert prayer times to minutes and find next
    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTimeMinutes = hours * 60 + minutes;

      let diff = prayerTimeMinutes - currentTime;
      // If prayer is tomorrow (e.g., now is 20:00, Fajr is 05:00)
      if (diff < 0) diff += 24 * 60;

      if (diff < minDiff) {
        minDiff = diff;
        upcoming = prayer;
      }
    }
    
    setNextPrayer(upcoming);
    
    // Format countdown
    const h = Math.floor(minDiff / 60);
    const m = minDiff % 60;
    setTimeLeft(`${h}h ${m}m`);
  }, [prayers]);

  useEffect(() => {
    calculateNextPrayer();
    const timer = setInterval(calculateNextPrayer, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [calculateNextPrayer]);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full relative group">
      {/* Decorative Background Pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full opacity-50 pointer-events-none transition-opacity group-hover:opacity-100" />

      <div className="p-6 flex flex-col h-full relative z-10">
        <div className="flex items-center gap-2 mb-6">
           <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Moon size={18} />
          </div>
          <h3 className="font-semibold text-slate-900">Prayer Times</h3>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Next Prayer</span>
          <h2 className="text-3xl font-bold text-slate-900 mb-1">{nextPrayer?.name || 'Loading...'}</h2>
          <div className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full text-sm mt-2">
            <Clock size={14} />
            <span>{nextPrayer?.time}</span>
            <span className="text-emerald-400 mx-1">•</span>
            <span>- {timeLeft}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IslamicCard;
