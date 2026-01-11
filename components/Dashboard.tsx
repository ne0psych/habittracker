import React from 'react';
import { useHabits } from '../context/HabitContext.tsx';
import { Activity, TrendingUp, AlertCircle, Timer, ChevronLeft, ChevronRight } from 'lucide-react';
import { JournalEditor } from './JournalEditor.tsx';

export const Dashboard: React.FC = () => {
  const { data, activeHabits, viewDate, setViewDate } = useHabits();
  
  const habitsData = activeHabits.daily.map(habit => ({
    name: habit.title,
    rate: data.analytics.completionRates[habit.id] || 0,
    streak: data.analytics.streaks[habit.id] || 0
  })).sort((a, b) => b.rate - a.rate);

  const averageCompletion = habitsData.length > 0 
    ? Math.round(habitsData.reduce((acc, curr) => acc + curr.rate, 0) / habitsData.length)
    : 0;

  const totalTimeSeconds = data.timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalTimeHours = (totalTimeSeconds / 3600).toFixed(1);

  const handleDateChange = (days: number) => {
    const nextDate = new Date(viewDate);
    nextDate.setDate(viewDate.getDate() + days);
    setViewDate(nextDate);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Date Navigation & Summary */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => handleDateChange(-1)} className="p-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all"><ChevronLeft size={20} /></button>
          <div className="text-center min-w-[140px]">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{viewDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Date</p>
          </div>
          <button onClick={() => handleDateChange(1)} className="p-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all"><ChevronRight size={20} /></button>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <div className="px-5 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-rose-200 dark:border-rose-900/30">
            {averageCompletion}% Productivity
          </div>
          <div className="px-5 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-blue-200 dark:border-blue-900/30">
            {totalTimeHours}h Focused
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { label: 'Consistency', value: `${averageCompletion}%`, icon: Activity, color: 'rose' },
          { label: 'Max Streak', value: `${Math.max(0, ...Object.values(data.analytics.streaks))}d`, icon: TrendingUp, color: 'purple' },
          { label: 'Time Spent', value: `${totalTimeHours}h`, icon: Timer, color: 'blue' },
          { label: 'Attention', value: habitsData.filter(h => h.rate < 50).length, icon: AlertCircle, color: 'orange' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm group hover:shadow-xl transition-all duration-500">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform border border-slate-100 dark:border-slate-700">
              <item.icon size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10">
        <div className="min-h-[500px]">
          <JournalEditor />
        </div>
      </div>
    </div>
  );
};