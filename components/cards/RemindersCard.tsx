import React from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { Reminder } from '../../types';
import { format, isToday, isTomorrow } from 'date-fns';

interface RemindersCardProps {
  reminders: Reminder[];
  onToggle?: (id: string) => void;
}

const RemindersCard: React.FC<RemindersCardProps> = ({ reminders, onToggle }) => {
  const getDueLabel = (date: Date) => {
    if (isToday(date)) return format(date, 'h:mm a');
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const handleToggle = (id: string) => {
    if (onToggle) {
      onToggle(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <Bell size={18} />
          </div>
          <h3 className="font-semibold text-slate-900">Reminders</h3>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {reminders.filter(r => !r.completed).length} Pending
        </span>
      </div>

      <div className="space-y-2 flex-1">
        {reminders.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            No reminders yet
          </div>
        ) : (
          reminders.slice(0, 3).map((reminder) => (
            <div key={reminder.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <button
                onClick={() => handleToggle(reminder.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  reminder.completed
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-slate-300 hover:border-blue-500'
                }`}
              >
                 {reminder.completed && <Check size={12} className="text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${reminder.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {reminder.title}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={10} className="text-slate-400" />
                  <span className="text-xs text-slate-400">{getDueLabel(reminder.dueDate)}</span>
                </div>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                reminder.priority === 'high' ? 'bg-red-400' :
                reminder.priority === 'medium' ? 'bg-orange-400' : 'bg-green-400'
              }`} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RemindersCard;
