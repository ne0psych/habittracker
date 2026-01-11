import React from 'react';
import { useHabits } from '../context/HabitContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Activity, TrendingUp, AlertCircle, Timer, Target, Clock } from 'lucide-react';
import { CATEGORIES } from '../types';

export const AnalyticsHub: React.FC = () => {
  const { data, activeHabits, theme } = useHabits();
  
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

  // Time tracking distribution
  const allHabits = [...activeHabits.daily, ...activeHabits.weekly, ...activeHabits.monthly];
  const timeDistribution = data.timeEntries.reduce((acc, entry) => {
    const habit = allHabits.find(h => h.id === entry.habitId);
    const name = habit ? habit.title : 'Uncategorized';
    if (!acc[name]) acc[name] = 0;
    acc[name] += entry.duration;
    return acc;
  }, {} as Record<string, number>);

  const timeData = Object.entries(timeDistribution).map(([name, value]) => ({
    name,
    value: Math.round(value / 60)
  })).sort((a, b) => b.value - a.value);

  const getCategoryHex = (catName: string) => {
    switch(catName) {
      case 'Wellness': return '#10b981';
      case 'Work': return '#3b82f6';
      case 'Learning': return '#8b5cf6';
      case 'Creativity': return '#f43f5e';
      default: return '#94a3b8';
    }
  };

  const chartTextColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const chartBgColor = theme === 'dark' ? '#0f172a' : '#f8fafc';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipText = theme === 'dark' ? '#f1f5f9' : '#1e293b';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Consistency', value: `${averageCompletion}%`, icon: Activity, color: 'rose' },
          { label: 'Max Streak', value: `${Math.max(0, ...Object.values(data.analytics.streaks))}d`, icon: TrendingUp, color: 'purple' },
          { label: 'Time Spent', value: `${totalTimeHours}h`, icon: Timer, color: 'blue' },
          { label: 'Attention', value: habitsData.filter(h => h.rate < 50).length, icon: AlertCircle, color: 'orange' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-500">
            <div className={`p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-2xl w-fit mb-4`}>
              <item.icon size={26} />
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Habit Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daily Performance</h3>
            <p className="text-sm text-slate-400 font-medium">Monthly success rate by individual habit</p>
          </div>
          
          <div className="h-[400px] w-full">
            {habitsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitsData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={120} 
                    tick={{ fontSize: 12, fill: chartTextColor, fontWeight: 700 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: theme === 'dark' ? '#1e293b' : '#f8fafc', radius: 12}} 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tooltipText, padding: '12px' }}
                  />
                  <Bar dataKey="rate" radius={[0, 10, 10, 0] as any} barSize={24} background={{ fill: chartBgColor, radius: [0, 10, 10, 0] } as any}>
                    {habitsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryHex(entry.category)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Target size={40} className="mb-3 opacity-20" />
                  <p className="font-bold text-sm">Start tracking habits to see data</p>
               </div>
            )}
          </div>
        </div>

        {/* Time Pie */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Time Distribution</h3>
          <p className="text-sm text-slate-400 font-medium mb-6">Distribution in minutes</p>
          
          <div className="h-[250px] w-full relative">
            {timeData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {timeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tooltipText }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Clock size={32} className="mb-2 opacity-20" />
                  <p className="text-xs font-bold text-center">No time tracked yet</p>
               </div>
            )}
            {timeData.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                    <span className="block text-2xl font-black text-slate-800 dark:text-slate-100">{totalTimeHours}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hrs</span>
                 </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {timeData.slice(0, 5).map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600 dark:text-slate-400 truncate pr-4">{entry.name}</span>
                <span className="text-slate-800 dark:text-slate-100 whitespace-nowrap">{entry.value}m</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
