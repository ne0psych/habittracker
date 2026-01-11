import React from 'react';
import { useHabits } from '../context/HabitContext.tsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, AlertCircle, Timer, Target, Clock, Zap } from 'lucide-react';

export const AnalyticsHub: React.FC = () => {
  const { data, activeHabits, theme } = useHabits();
  
  const habitsData = activeHabits.daily.map(habit => ({
    name: habit.title,
    rate: data.analytics.completionRates[habit.id] || 0,
    category: habit.category
  })).sort((a, b) => b.rate - a.rate);

  const averageCompletion = habitsData.length > 0 
    ? Math.round(habitsData.reduce((acc, curr) => acc + curr.rate, 0) / habitsData.length)
    : 0;

  // Trend Data: Completion over last 7 days
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayKeyPrefix = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    let completedCount = 0;
    activeHabits.daily.forEach(h => {
      if (data.logs.dailyCompletion[`${dayKeyPrefix}-${h.id}`]) completedCount++;
    });
    return {
      name: d.toLocaleDateString(undefined, { weekday: 'short' }),
      count: completedCount,
      total: activeHabits.daily.length
    };
  });

  const chartTextColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Trend Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-300 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200 dark:shadow-none border border-rose-400 dark:border-transparent">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Completion Trend</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Past 7 days performance</p>
            </div>
          </div>
          <div className="h-[300px] w-full border border-slate-100 dark:border-transparent rounded-2xl p-4 bg-slate-50/30 dark:bg-transparent">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: chartTextColor, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: chartTextColor, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', border: '1px solid #e2e8f0', backgroundColor: tooltipBg, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="count" stroke="#f43f5e" strokeWidth={4} dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habit Leaderboard */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none border border-blue-400 dark:border-transparent">
              <Target size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Success Rates</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consistency by individual habit</p>
            </div>
          </div>
          <div className="space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
            {habitsData.length > 0 ? habitsData.map((h, i) => (
              <div key={i} className="group p-4 rounded-2xl border border-slate-100 dark:border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{h.name}</span>
                  <span className="text-xs font-black text-slate-500">{h.rate}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner">
                  <div className="bg-rose-500 h-full rounded-full transition-all duration-1000 border-r border-rose-600 shadow-sm" style={{ width: `${h.rate}%` }} />
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-400 text-sm py-10 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">No data available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};