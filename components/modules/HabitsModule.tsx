import React, { useState, useEffect } from 'react';
import {
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  Calendar as CalendarIcon,
  BarChart2,
  Filter,
  MoreHorizontal,
  Brain,
  BookOpen,
  Ban,
  Briefcase,
  Moon,
  Activity,
  Coffee,
  CheckCircle,
  Archive,
  Loader2
} from 'lucide-react';
import {
  format,
  addDays,
  isSameDay,
  eachDayOfInterval,
  endOfMonth,
  getDay
} from 'date-fns';
import { Habit, HabitLog } from '../../types';
import { useHabits } from '../../hooks/useData';

type ViewMode = 'daily' | 'monthly';
type CategoryFilter = 'all' | 'health' | 'work' | 'personal' | 'islamic';

const HabitsModule: React.FC = () => {
  // API Hook
  const { habits: apiHabits, loading, logCompletion, createHabit: apiCreateHabit } = useHabits();

  // Local state synced with API
  const [habits, setHabits] = useState<Habit[]>([]);

  // Sync API habits to local state
  useEffect(() => {
    if (apiHabits.length > 0 || !loading) {
      const transformedHabits = apiHabits.map((h: any) => ({
        id: h.id?.toString() || '',
        name: h.name,
        description: h.description,
        category: h.category || 'personal',
        frequency: h.frequency || 'daily',
        color: h.color || 'blue',
        icon: h.icon,
        streak: 0,
        completed: h.logs?.some((log: any) => {
          const today = new Date().toISOString().split('T')[0];
          return log.date === today && log.completed;
        }) || false,
        status: h.is_active ? 'active' : 'archived',
        history: h.logs?.map((log: any) => ({
          date: log.date,
          status: log.completed ? 'completed' : 'missed'
        })) || []
      }));
      setHabits(transformedHabits);
    }
  }, [apiHabits, loading]);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Stats
  const completedToday = habits.filter(h => h.completed).length;
  const totalActive = habits.filter(h => h.status === 'active').length;
  const progressPercentage = Math.round((completedToday / totalActive) * 100);

  // Filters
  const filteredHabits = habits.filter(h => {
    if (h.status === 'archived') return false;
    if (selectedCategory === 'all') return true;
    return h.category === selectedCategory;
  });

  // Handlers
  const toggleHabitToday = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];
    const newCompleted = !habit.completed;

    // Optimistic update
    setHabits(habits.map(h => {
      if (h.id === id) {
        return { ...h, completed: newCompleted };
      }
      return h;
    }));

    // API call
    try {
      await logCompletion(id, today, newCompleted);
    } catch (error) {
      console.error('Failed to log habit:', error);
      // Revert on error
      setHabits(habits.map(h => {
        if (h.id === id) {
          return { ...h, completed: !newCompleted };
        }
        return h;
      }));
    }
  };

  const getIcon = (iconName?: string, size: number = 20) => {
    switch(iconName) {
      case 'Brain': return <Brain size={size} />;
      case 'BookOpen': return <BookOpen size={size} />;
      case 'Ban': return <Ban size={size} />;
      case 'Briefcase': return <Briefcase size={size} />;
      case 'Moon': return <Moon size={size} />;
      case 'Calendar': return <CalendarIcon size={size} />;
      default: return <Activity size={size} />;
    }
  };

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'emerald': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', bar: 'bg-emerald-500' };
      case 'blue': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', bar: 'bg-blue-500' };
      case 'rose': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', bar: 'bg-rose-500' };
      case 'indigo': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', bar: 'bg-indigo-500' };
      case 'amber': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', bar: 'bg-amber-500' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', bar: 'bg-slate-500' };
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <p className="text-slate-500">Loading habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-6">

      {/* Header Section */}
      <header className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 w-full lg:w-auto">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1">
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, -30))} 
              className="p-2 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 shadow-sm transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="w-32 text-center font-bold text-slate-700">{format(currentDate, 'MMMM yyyy')}</span>
            <button 
              onClick={() => setCurrentDate(new Date())} // Reset to today for demo
              className="p-2 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 shadow-sm transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Progress Summary */}
          <div className="flex-1 lg:w-64">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500 font-medium">Daily Progress</span>
              <span className="text-slate-900 font-bold">{completedToday}/{totalActive}</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'daily' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Daily
            </button>
            <button 
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Monthly
            </button>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-slate-200 ml-auto lg:ml-0"
          >
            <Plus size={18} />
            <span>Add Habit</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* Filters Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
          <Filter size={16} className="text-slate-400 mr-2 shrink-0" />
          {['all', 'health', 'work', 'personal', 'islamic'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as CategoryFilter)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors border
                ${selectedCategory === cat 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Views */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'daily' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredHabits.map((habit) => {
                const styles = getColorClasses(habit.color);
                return (
                  <div 
                    key={habit.id}
                    onClick={() => setSelectedHabit(habit)}
                    className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                  >
                    {/* Status Toggle (Absolute) */}
                    <div className="absolute top-5 right-5 z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleHabitToday(habit.id); }}
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                          ${habit.completed 
                            ? `${styles.bg.replace('50', '500')} text-white shadow-md scale-100` 
                            : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                          }
                        `}
                      >
                        <Check size={16} strokeWidth={3} />
                      </button>
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl ${styles.bg} ${styles.text}`}>
                        {getIcon(habit.icon)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{habit.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 capitalize">{habit.frequency} • {habit.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                      <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                        <Flame size={14} className={habit.streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-300"} />
                        <span className="text-xs font-bold">{habit.streak} Day Streak</span>
                      </div>
                      
                      {/* Mini Heatmap Preview (Last 7 days) */}
                      <div className="flex items-center gap-1 ml-auto">
                        {habit.history.slice(0, 5).reverse().map((log, i) => (
                           <div 
                              key={i} 
                              className={`w-1.5 h-6 rounded-full ${
                                log.status === 'completed' ? styles.bar : 
                                log.status === 'skipped' ? 'bg-slate-200' : 'bg-slate-100'
                              }`} 
                              title={log.date}
                           />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="p-4 font-semibold text-sm text-slate-500 w-64 sticky left-0 bg-slate-50 z-10">Habit</th>
                        {Array.from({ length: 30 }).map((_, i) => (
                           <th key={i} className="p-2 text-center text-[10px] text-slate-400 font-medium min-w-[32px]">
                              {format(addDays(new Date(), -(29 - i)), 'd')}
                           </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHabits.map((habit) => {
                         const styles = getColorClasses(habit.color);
                         // Pad history to 30 days if needed
                         const displayHistory = [...habit.history].reverse().slice(0, 30).reverse(); // Simplified logic
                         
                         return (
                           <tr key={habit.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-50">
                                 <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${styles.bg} ${styles.text}`}>
                                       {getIcon(habit.icon)}
                                    </div>
                                    <span className="font-medium text-sm text-slate-900">{habit.name}</span>
                                 </div>
                              </td>
                              {Array.from({ length: 30 }).map((_, i) => {
                                 const dayIndex = 29 - i; // reverse index
                                 // Mock data alignment (in real app, match date key)
                                 const log = displayHistory[displayHistory.length - 1 - dayIndex]; 
                                 const status = log?.status || 'missed';
                                 
                                 return (
                                    <td key={i} className="p-2 text-center">
                                       <div className={`
                                          w-6 h-6 mx-auto rounded-md flex items-center justify-center transition-all
                                          ${status === 'completed' ? styles.bg + ' ' + styles.text : ''}
                                          ${status === 'skipped' ? 'bg-slate-100 text-slate-400' : ''}
                                          ${status === 'missed' ? 'text-slate-200' : ''}
                                       `}>
                                          {status === 'completed' && <Check size={14} strokeWidth={3} />}
                                          {status === 'skipped' && <MoreHorizontal size={14} />}
                                          {status === 'missed' && <div className="w-1 h-1 rounded-full bg-slate-200" />}
                                       </div>
                                    </td>
                                 );
                              })}
                           </tr>
                         );
                      })}
                    </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Habit Details Slide-over / Modal */}
      {selectedHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`h-32 ${getColorClasses(selectedHabit.color).bg} p-6 relative`}>
              <button 
                onClick={() => setSelectedHabit(null)}
                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
              <div className="flex items-end gap-4 h-full translate-y-8">
                 <div className={`w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center ${getColorClasses(selectedHabit.color).text}`}>
                    {getIcon(selectedHabit.icon, 40)}
                 </div>
                 <div className="mb-8">
                   <h2 className="text-2xl font-bold text-slate-900">{selectedHabit.name}</h2>
                   <p className="text-slate-600 font-medium capitalize">{selectedHabit.category}</p>
                 </div>
              </div>
            </div>
            
            <div className="pt-12 px-6 pb-6 space-y-6">
               <p className="text-slate-600 text-sm leading-relaxed">
                  {selectedHabit.description || "No description provided for this habit."}
               </p>

               <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 text-center">
                     <div className="text-xs text-slate-500 uppercase font-bold mb-1">Streak</div>
                     <div className="text-xl font-bold text-slate-900 flex items-center justify-center gap-1">
                        {selectedHabit.streak} <Flame size={16} className="text-orange-500 fill-orange-500" />
                     </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 text-center">
                     <div className="text-xs text-slate-500 uppercase font-bold mb-1">Success</div>
                     <div className="text-xl font-bold text-slate-900">85%</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 text-center">
                     <div className="text-xs text-slate-500 uppercase font-bold mb-1">Target</div>
                     <div className="text-xl font-bold text-slate-900 capitalize">{selectedHabit.frequency}</div>
                  </div>
               </div>

               <div className="space-y-3 pt-2">
                  <button className="w-full py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors">
                     Edit Habit
                  </button>
                  <button className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                     <Archive size={18} />
                     Archive Habit
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Habit Modal (Simplified) */}
      {isAddModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative">
               <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                  <X size={24} />
               </button>

               <h3 className="text-xl font-bold text-slate-900 mb-6">Create New Habit</h3>
               
               <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Habit Name</label>
                     <input 
                        type="text" 
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none placeholder-slate-400 text-slate-900" 
                        placeholder="e.g., Drink Water" 
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                        <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm bg-white focus:ring-2 focus:ring-slate-900 outline-none text-slate-900">
                           <option>Health</option>
                           <option>Work</option>
                           <option>Personal</option>
                           <option>Islamic</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Frequency</label>
                        <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm bg-white focus:ring-2 focus:ring-slate-900 outline-none text-slate-900">
                           <option>Daily</option>
                           <option>Weekly</option>
                        </select>
                     </div>
                  </div>
                  
                  <div className="pt-4">
                     <button 
                        onClick={() => setIsAddModalOpen(false)}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                     >
                        Create Habit
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default HabitsModule;