import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { Play, Square, Clock, Trash2, Tag, Calendar } from 'lucide-react';

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

  // Combine all active habits for the dropdown
  const allHabits = [
    ...activeHabits.daily.map(h => ({ ...h, type: 'Daily' })),
    ...activeHabits.weekly.map(h => ({ ...h, type: 'Weekly' })),
    ...activeHabits.monthly.map(h => ({ ...h, type: 'Monthly' }))
  ];

  // Sync state with active timer if exists
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
      // Don't clear description/habit immediately to allow quick restart
    }
  }, [data.activeTimer]);

  const handleStartStop = () => {
    if (data.activeTimer) {
      stopTimer();
      setDescription(''); // Clear after stop
    } else {
      if (!selectedHabitId) {
        alert('Please select a habit/project to track.');
        return;
      }
      startTimer(selectedHabitId, description);
    }
  };

  // Group entries by date
  const groupedEntries = data.timeEntries.reduce((groups, entry) => {
    const date = new Date(entry.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, typeof data.timeEntries>);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Bar - Timer Control */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-4 sticky top-4 z-30">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="What are you working on?"
            className="w-full bg-transparent text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none text-lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!!data.activeTimer}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="relative">
            <select
              className="appearance-none bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 pr-8 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 cursor-pointer min-w-[200px]"
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              disabled={!!data.activeTimer}
            >
              <option value="">Select Project / Habit</option>
              {allHabits.map(habit => (
                <option key={habit.id} value={habit.id}>
                  {habit.title} ({habit.type})
                </option>
              ))}
            </select>
            <Tag size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="font-mono text-xl font-bold text-slate-700 dark:text-slate-200 min-w-[100px] text-center">
            {formatDuration(elapsedTime)}
          </div>

          <button
            onClick={handleStartStop}
            className={`px-6 py-2 rounded-lg font-bold text-white transition-all shadow-md active:scale-95 flex items-center gap-2 ${
              data.activeTimer 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-none' 
                : 'bg-blue-500 hover:bg-blue-600 shadow-blue-200 dark:shadow-none'
            }`}
          >
            {data.activeTimer ? (
              <>STOP <Square size={16} fill="currentColor" /></>
            ) : (
              <>START <Play size={16} fill="currentColor" /></>
            )}
          </button>
        </div>
      </div>

      {/* Time Entries List */}
      <div className="space-y-6">
        {Object.entries(groupedEntries).map(([date, entries]) => {
          const totalDuration = entries.reduce((acc, curr) => acc + curr.duration, 0);
          
          return (
            <div key={date} className="space-y-2">
              <div className="flex justify-between items-end px-2 pb-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Calendar size={14} /> {date}
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Total: {formatDuration(totalDuration)}
                </span>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {entries.map((entry) => {
                  const habit = allHabits.find(h => h.id === entry.habitId);
                  return (
                    <div key={entry.id} className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{entry.description || "(No description)"}</div>
                        <div className="text-xs text-blue-500 dark:text-blue-400 font-medium flex items-center gap-1 mt-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 inline-block"></span>
                          {habit?.title || 'Unknown Habit'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
                        <div className="text-xs text-slate-400 font-mono">
                          {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                        </div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {formatDuration(entry.duration)}
                        </div>
                        <button 
                          onClick={() => deleteTimeEntry(entry.id)}
                          className="text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                          title="Delete entry"
                        >
                          <Trash2 size={16} />
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
          <div className="text-center py-12 text-slate-400">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>No time entries yet. Start the timer above!</p>
          </div>
        )}
      </div>
    </div>
  );
};
