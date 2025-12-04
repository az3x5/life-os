import React from 'react';
import { CheckCircle, Flame } from 'lucide-react';
import { Habit } from '../../types';

interface HabitsCardProps {
  habits: Habit[];
  onToggle?: (id: string) => void;
}

const HabitsCard: React.FC<HabitsCardProps> = ({ habits, onToggle }) => {
  const handleToggle = (id: string) => {
    if (onToggle) {
      onToggle(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
       <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle size={18} />
          </div>
          <h3 className="font-semibold text-slate-900">Habits</h3>
        </div>
      </div>

      <div className="space-y-5">
        {habits.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm py-4">
            No habits yet
          </div>
        ) : (
          habits.slice(0, 3).map((habit) => (
            <div key={habit.id} className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800">{habit.name}</span>
                <div className="flex items-center gap-1 mt-1 text-orange-500">
                  <Flame size={12} fill="currentColor" />
                  <span className="text-xs font-bold">{habit.streak || 0} day streak</span>
                </div>
              </div>

              <button
                onClick={() => handleToggle(habit.id)}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                  ${habit.completed
                    ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-md scale-100'
                    : 'bg-slate-100 text-slate-300 hover:bg-emerald-100 hover:text-emerald-400'
                  }
                `}
              >
                <CheckCircle size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HabitsCard;
