import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { Play, Square, Clock, Trash2, Tag, Calendar, Layout } from 'lucide-react';

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const TimeTracker: React.FC = () => {
  const { data, activeHabits, startTimer, stopTimer, deleteTimeEntry } = useHabits();
  const [description, setDescription] = useState('');
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  const allHabits = [
    ...activeHabits.daily.map(h => ({ ...h, type: 'Daily' })),
    ...activeHabits.weekly.map(h => ({ ...h, type: 'Weekly' })),
    ...activeHabits.monthly.map(h => ({ ...h, type: 'Monthly' }))
  ];

  useEffect(() => {
    if (data.activeTimer) {
      setDescription(data.activeTimer.description);
      setSelectedHabitId(data.activeTimer.habitId);
      
      const interval = setInterval(() => {
        const start = new Date(data.activeTimer!.startTime).getTime();
        const now = new Date().getTime();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [data.activeTimer]);

  const handleStartStop = () => {
    if (data.activeTimer) {
      stopTimer();
      setDescription('');
    } else {
      if (!selectedHabitId) {
        alert('Please select a project/habit to link this timer to.');
        return;
      }
      startTimer(selectedHabitId, description);
    }
  };

  const groupedEntries = data.timeEntries.reduce((groups, entry) => {
    const date = new Date(entry.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, typeof data.timeEntries>);

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Timer Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row items-center gap-6 sticky top-8 z-30 transition-all duration-500 animate-in slide-in-from-top-4 duration-700">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="What are you focusing on right now?"
            className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none text-xl font-bold px-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!!data.activeTimer}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-6 w-full xl:w-auto justify-between xl:justify-end">
          <div className="relative group">
            <select
              className="appearance-none bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3 pr-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:outline-none focus:border-blue-500/50 cursor-pointer min-w-[240px] font-bold text-sm"
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              disabled={!!data.activeTimer}
            >
              <option value="">Choose Project</option>
              {allHabits.map(habit => (
                <option key={habit.id} value={habit.id}>
                  {habit.title}
                </option>
              ))}
            </select>
            <Tag size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
          </div>

          <div className="font-mono text-3xl font-black text-slate-800 dark:text-slate-100 min-w-[140px] text-center tracking-tighter tabular-nums">
            {formatDuration(elapsedTime)}
          </div>

          <button
            onClick={handleStartStop}
            className={`h-14 px-10 rounded-2xl font-black text-sm tracking-widest uppercase text-white transition-all shadow-xl active:scale-90 flex items-center justify-center gap-3 ${
              data.activeTimer 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 dark:shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none'
            }`}
          >
            {data.activeTimer ? (
              <>Stop <Square size={18} fill="currentColor" /></>
            ) : (
              <>Start <Play size={18} fill="currentColor" /></>
            )}
          </button>
        </div>
      </div>

      {/* Log List */}
      <div className="space-y-10">
        {Object.entries(groupedEntries).map(([date, entries]) => {
          const totalDuration = entries.reduce((acc, curr) => acc + curr.duration, 0);
          
          return (
            <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex justify-between items-end px-4 mb-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} className="text-slate-300" /> {date}
                </span>
                <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  Daily Total <span className="text-sm text-slate-800 dark:text-slate-200">{formatDuration(totalDuration)}</span>
                </span>
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                {entries.map((entry) => {
                  const habit = allHabits.find(h => h.id === entry.habitId);
                  return (
                    <div key={entry.id} className="group flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-300 gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{entry.description || "(No description provided)"}</div>
                        <div className="flex items-center gap-3 mt-2">
                           <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 rounded-lg">
                            <Layout size={12} /> {habit?.title || 'Unknown'}
                           </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end">
                        <div className="text-xs font-bold text-slate-400 font-mono tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">
                          {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
                        </div>
                        <div className="text-xl font-black text-slate-800 dark:text-slate-200 font-mono tabular-nums tracking-tighter">
                          {formatDuration(entry.duration)}
                        </div>
                        <button 
                          onClick={() => deleteTimeEntry(entry.id)}
                          className="text-slate-200 hover:text-rose-500 dark:hover:text-rose-400 transition-all p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl"
                          title="Delete entry"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {data.timeEntries.length === 0 && (
          <div className="text-center py-24 text-slate-300 dark:text-slate-700 bg-white/30 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
            <Clock size={80} className="mx-auto mb-6 opacity-10" />
            <p className="text-2xl font-black tracking-tight max-w-sm mx-auto">Your time is your most valuable resource. Start tracking it.</p>
          </div>
        )}
      </div>
    </div>
  );
};
