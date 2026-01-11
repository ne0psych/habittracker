import React from 'react';
import { useHabits } from '../context/HabitContext';
import { Activity, TrendingUp, AlertCircle, Timer, Target } from 'lucide-react';
import { JournalEditor } from './JournalEditor';

export const Dashboard: React.FC = () => {
  const { data, activeHabits } = useHabits();
  
  const habitsData = activeHabits.daily.map(habit => ({
    name: habit.title,
    rate: data.analytics.completionRates[habit.id] || 0,
    category: habit.category,
    streak: data.analytics.streaks[habit.id] || 0
  })).sort((a, b) => b.rate - a.rate);

  const averageCompletion = habitsData.length > 0 
    ? Math.round(habitsData.reduce((acc, curr) => acc + curr.rate, 0) / habitsData.length)
    : 0;

  const totalTimeSeconds = data.timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalTimeHours = (totalTimeSeconds / 3600).toFixed(1);

  return (
    <div className="space-y-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Consistency', value: `${averageCompletion}%`, icon: Activity, color: 'rose' },
          { label: 'Max Streak', value: `${Math.max(0, ...Object.values(data.analytics.streaks))}d`, icon: TrendingUp, color: 'purple' },
          { label: 'Time Spent', value: `${totalTimeHours}h`, icon: Timer, color: 'blue' },
          { label: 'Attention', value: habitsData.filter(h => h.rate < 50).length, icon: AlertCircle, color: 'orange' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className={`p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-500`}>
              <item.icon size={26} />
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Journal Section replaces old charts */}
        <div className="h-[600px]">
          <JournalEditor />
        </div>
      </div>
    </div>
  );
};
