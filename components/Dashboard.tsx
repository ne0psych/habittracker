import React from 'react';
import { useHabits } from '../context/HabitContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Activity, TrendingUp, Calendar, AlertCircle, Clock, Timer } from 'lucide-react';
import { getWeeksForMonth } from '../utils/helpers';

const CircularProgress = ({ percentage, color, size = 50, stroke = 4 }: { percentage: number, color: string, size?: number, stroke?: number }) => {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          className="text-slate-100 dark:text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${color} transition-all duration-1000 ease-out`}
        />
      </svg>
      <span className={`absolute text-[10px] font-bold ${color}`}>{percentage}%</span>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { data, activeHabits, theme } = useHabits();
  
  // Daily Logic
  const habitsData = activeHabits.daily.map(habit => ({
    name: habit.title,
    rate: data.analytics.completionRates[habit.id] || 0,
    streak: data.analytics.streaks[habit.id] || 0
  })).sort((a, b) => b.rate - a.rate);

  const topHabits = habitsData.slice(0, 3);
  const strugglingHabits = habitsData.filter(h => h.rate < 50).slice(0, 3);
  
  const averageCompletion = habitsData.length > 0 
    ? Math.round(habitsData.reduce((acc, curr) => acc + curr.rate, 0) / habitsData.length)
    : 0;

  // Weekly Logic
  const weeks = getWeeksForMonth(data.user.year, data.user.month);
  const weeklyStats = activeHabits.weekly.map(habit => {
    let completed = 0;
    weeks.forEach(w => {
      if (data.logs.weeklyCompletion[`${data.user.year}-W${w}-${habit.id}`]) completed++;
    });
    const percentage = weeks.length > 0 ? Math.round((completed / weeks.length) * 100) : 0;
    return { ...habit, percentage };
  });

  // Monthly Logic
  const monthlyStats = activeHabits.monthly.map(habit => {
     // Check against a stable date for the month
     const dateKey = `${data.user.year}-${(new Date(Date.parse(data.user.month +" 1, 2012")).getMonth()+1).toString().padStart(2, '0')}-${habit.id}`;
     const isCompleted = data.logs.monthlyCompletion[dateKey];
     return { ...habit, percentage: isCompleted ? 100 : 0 };
  });

  // --- Time Tracking Analytics ---
  const allHabits = [
    ...activeHabits.daily,
    ...activeHabits.weekly,
    ...activeHabits.monthly
  ];

  const timeDistribution = data.timeEntries.reduce((acc, entry) => {
    const habit = allHabits.find(h => h.id === entry.habitId);
    const name = habit ? habit.title : 'Unknown';
    if (!acc[name]) acc[name] = 0;
    acc[name] += entry.duration;
    return acc;
  }, {} as Record<string, number>);

  const timeData = Object.entries(timeDistribution).map(([name, value]) => ({
    name,
    value: Math.round(value / 60) // in minutes
  })).sort((a, b) => b.value - a.value);

  const totalTimeSeconds = data.timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalTimeHours = (totalTimeSeconds / 3600).toFixed(1);

  const COLORS = ['#fda4af', '#f0abfc', '#a5b4fc', '#93c5fd', '#6ee7b7'];
  const TIME_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  
  const chartTextColor = theme === 'dark' ? '#94a3b8' : '#475569';
  const chartBgColor = theme === 'dark' ? '#1e293b' : '#f1f5f9';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#fff';
  const tooltipText = theme === 'dark' ? '#f1f5f9' : '#334155';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">Avg. Success</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{averageCompletion}%</h3>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">Top Streak</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {Math.max(0, ...Object.values(data.analytics.streaks))} <span className="text-sm font-normal text-slate-400">days</span>
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Timer size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">Total Time</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalTimeHours} <span className="text-sm font-normal text-slate-400">hrs</span></h3>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">Needs Focus</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{strugglingHabits.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Daily Habits Performance</h3>
            <p className="text-sm text-slate-400">Completion rate over this month</p>
          </div>
          <div className="h-[300px] w-full">
            {habitsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitsData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={140} 
                    tick={{ fontSize: 13, fill: chartTextColor, fontWeight: 500 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: theme === 'dark' ? '#334155' : '#f8fafc'}} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tooltipText }}
                  />
                  <Bar dataKey="rate" radius={[0, 6, 6, 0] as any} barSize={24} background={{ fill: chartBgColor, radius: [0, 6, 6, 0] } as any}>
                    {habitsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
                  <Activity size={32} className="mb-2 opacity-50" />
                  <p>No data to display yet</p>
               </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Time Distribution</h3>
          <p className="text-sm text-slate-400 mb-6">Where your time goes (minutes)</p>
          
          <div className="h-[300px] w-full relative">
            {timeData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {timeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TIME_COLORS[index % TIME_COLORS.length]} stroke={theme === 'dark' ? '#1e293b' : '#fff'} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tooltipText }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
                  <Clock size={32} className="mb-2 opacity-50" />
                  <p>Start tracking time to see data</p>
               </div>
            )}
            {/* Center Text Overlay */}
            {timeData.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                    <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100">{totalTimeHours}</span>
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Hrs</span>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
