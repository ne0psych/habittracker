import React from 'react';
import { useHabits } from '../context/HabitContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Activity, TrendingUp, Calendar, AlertCircle, Clock, Timer, Target } from 'lucide-react';
import { getWeeksForMonth } from '../utils/helpers';
import { CATEGORIES } from '../types';

const CircularProgress = ({ percentage, color, size = 64, stroke = 6 }: { percentage: number, color: string, size?: number, stroke?: number }) => {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center transition-transform hover:scale-110 duration-300" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          className="text-slate-100 dark:text-slate-800"
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
          className={`${color} transition-all duration-1000 ease-out shadow-sm`}
        />
      </svg>
      <span className={`absolute text-[11px] font-black tracking-tighter ${color}`}>{percentage}%</span>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { data, activeHabits, theme } = useHabits();
  
  // Daily Logic
  const habitsData = activeHabits.daily.map(habit => ({
    name: habit.title,
    rate: data.analytics.completionRates[habit.id] || 0,
    category: habit.category,
    streak: data.analytics.streaks[habit.id] || 0
  })).sort((a, b) => b.rate - a.rate);

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
     const monthNum = (new Date(Date.parse(data.user.month + " 1, 2012")).getMonth() + 1).toString().padStart(2, '0');
     const dateKey = `${data.user.year}-${monthNum}-${habit.id}`;
     const isCompleted = data.logs.monthlyCompletion[dateKey];
     return { ...habit, percentage: isCompleted ? 100 : 0 };
  });

  // Time Tracking Analytics
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

  const totalTimeSeconds = data.timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalTimeHours = (totalTimeSeconds / 3600).toFixed(1);

  // Visualization styling
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
            <div className={`p-4 bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600 dark:text-${item.color}-400 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-500`}>
              <item.icon size={26} />
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Main Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daily Performance</h3>
              <p className="text-sm text-slate-400 font-medium">Monthly success rate by individual habit</p>
            </div>
            <div className="flex gap-2">
               {CATEGORIES.slice(0,3).map(c => (
                 <div key={c.name} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500">
                   <div className={`w-2 h-2 rounded-full ${c.color.split(' ')[0]}`} /> {c.name}
                 </div>
               ))}
            </div>
          </div>
          
          <div className="h-[360px] w-full">
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
                  <p className="font-bold text-sm">Create your first daily habit to see analytics</p>
               </div>
            )}
          </div>
        </div>

        {/* Secondary Overview Panels */}
        <div className="flex flex-col gap-10">
          {/* Time Distribution */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Time Split</h3>
            <p className="text-sm text-slate-400 font-medium mb-6">Distribution in minutes</p>
            
            <div className="h-[200px] w-full relative">
              {timeData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
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
                    <p className="text-xs font-bold">Track time to view</p>
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
          </div>

          {/* Periodic Habits Summary */}
          <div className="flex-1 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
             <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Periodic Goals</h3>
             <div className="space-y-6 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {weeklyStats.map(h => (
                  <div key={h.id} className="flex items-center justify-between group">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block truncate">{h.title}</span>
                      <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Weekly</span>
                    </div>
                    <CircularProgress percentage={h.percentage} color="text-purple-500" size={48} stroke={4} />
                  </div>
                ))}
                {monthlyStats.map(h => (
                  <div key={h.id} className="flex items-center justify-between group">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block truncate">{h.title}</span>
                      <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Monthly</span>
                    </div>
                    <CircularProgress percentage={h.percentage} color="text-teal-500" size={48} stroke={4} />
                  </div>
                ))}
                {weeklyStats.length === 0 && monthlyStats.length === 0 && (
                  <p className="text-center text-slate-400 text-xs font-bold py-8 opacity-50">No periodic habits set.</p>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
