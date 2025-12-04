import React, { useState, useMemo } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import MiniCalendar from './cards/MiniCalendar';
import NotesCard from './cards/NotesCard';
import RemindersCard from './cards/RemindersCard';
import HabitsCard from './cards/HabitsCard';
import HealthCard from './cards/HealthCard';
import FinanceCard from './cards/FinanceCard';
import IslamicCard from './cards/IslamicCard';
import { generateDailyInsight } from '../services/geminiService';
import { useNotes, useReminders, useHabits, useFinance, useHealth } from '../hooks/useData';
import { MOCK_PRAYER_TIMES } from '../constants';
import { Habit, HealthMetric, FinanceSummary } from '../types';

const Dashboard: React.FC = () => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Fetch data from API
  const { notes, loading: notesLoading } = useNotes();
  const { reminders, loading: remindersLoading, toggleComplete } = useReminders();
  const { habits, loading: habitsLoading, logCompletion } = useHabits();
  const { summary, loading: financeLoading } = useFinance();
  const { logs: healthLogs, loading: healthLoading } = useHealth();

  const isLoading = notesLoading || remindersLoading || habitsLoading || financeLoading || healthLoading;

  // Transform habits data for HabitsCard
  const transformedHabits: Habit[] = useMemo(() => {
    return habits.map(h => ({
      id: h.id.toString(),
      name: h.name,
      description: h.description,
      category: h.category || 'personal',
      frequency: h.frequency || 'daily',
      color: h.color || 'blue',
      icon: h.icon,
      streak: 0, // Calculate from logs if needed
      completed: h.logs?.some(log => {
        const today = new Date().toISOString().split('T')[0];
        return log.date === today && log.completed;
      }) || false,
      status: h.is_active ? 'active' : 'archived',
      history: h.logs?.map(log => ({
        date: log.date,
        status: log.completed ? 'completed' : 'missed'
      })) || []
    }));
  }, [habits]);

  // Transform health logs for HealthCard
  const transformedHealth: HealthMetric[] = useMemo(() => {
    const metricTypes = ['weight', 'steps', 'sleep', 'water', 'calories', 'heart rate'];
    return metricTypes.map(type => {
      const latestLog = healthLogs.find(log => log.type?.toLowerCase() === type);
      return {
        id: type,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: latestLog?.value || 0,
        unit: type === 'weight' ? 'kg' : type === 'steps' ? 'steps' : type === 'sleep' ? 'hrs' : type === 'water' ? 'ml' : type === 'calories' ? 'kcal' : 'bpm',
        icon: type === 'weight' ? 'Weight' : type === 'steps' ? 'Footprints' : type === 'sleep' ? 'Moon' : type === 'water' ? 'Droplets' : type === 'calories' ? 'Flame' : 'Heart',
        trend: 'stable',
        target: 0
      };
    });
  }, [healthLogs]);

  // Transform finance data for FinanceCard
  const transformedFinance: FinanceSummary = useMemo(() => ({
    balance: summary?.balance || 0,
    income: summary?.income || 0,
    expenses: summary?.expenses || 0,
    savings: summary?.savings || 0
  }), [summary]);

  const handleGenerateInsight = async () => {
    setIsLoadingInsight(true);
    const text = await generateDailyInsight(transformedHabits, transformedHealth, transformedFinance, reminders);
    setInsight(text);
    setIsLoadingInsight(false);
  };

  // Handle habit toggle from card
  const handleHabitToggle = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id.toString() === habitId);
    const isCompleted = habit?.logs?.some(log => log.date === today && log.completed);
    await logCompletion(habitId, today, !isCompleted);
  };

  // Handle reminder toggle from card
  const handleReminderToggle = async (reminderId: string) => {
    await toggleComplete(reminderId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <p className="text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header Area with Gemini Integration */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good Morning, Ali</h1>
          <p className="text-slate-500 mt-1">Here is your daily overview.</p>
        </div>

        <div className="flex-1 md:max-w-xl">
           {!insight ? (
             <button
                onClick={handleGenerateInsight}
                disabled={isLoadingInsight}
                className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70"
             >
                <Sparkles size={18} className={isLoadingInsight ? "animate-spin" : ""} />
                {isLoadingInsight ? "Generating Insight..." : "Get Daily Gemini Insight"}
             </button>
           ) : (
             <div className="relative bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
                <Sparkles size={20} className="text-indigo-600 mt-0.5 shrink-0" />
                <div>
                   <p className="text-slate-800 text-sm font-medium leading-relaxed">"{insight}"</p>
                   <button onClick={() => setInsight(null)} className="text-[10px] text-slate-400 mt-2 hover:text-indigo-600 underline">Refresh</button>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {/* Row 1 */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <MiniCalendar />
        </div>
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
           <IslamicCard prayers={MOCK_PRAYER_TIMES} />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
           <RemindersCard reminders={reminders} onToggle={handleReminderToggle} />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
           <HabitsCard habits={transformedHabits} onToggle={handleHabitToggle} />
        </div>

        {/* Row 2 */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2">
           <FinanceCard data={transformedFinance} />
        </div>
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
           <HealthCard metrics={transformedHealth} />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <NotesCard notes={notes} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
