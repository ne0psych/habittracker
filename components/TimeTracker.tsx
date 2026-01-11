import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext.tsx';
import { Play, Square, Clock, Trash2, Tag, Calendar, Layout, PlusCircle, X, Save } from 'lucide-react';

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ManualEntryModal = ({ isOpen, onClose, habits, onSave }: { isOpen: boolean, onClose: () => void, habits: any[], onSave: (entry: any) => void }) => {
  const [description, setDescription] = useState('');
  const [habitId, setHabitId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitId) return;
    
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

    if (duration <= 0) {
      alert("End time must be after start time.");
      return;
    }

    onSave({
      description,
      habitId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl w-full max-w-xl border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Manual Log</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Forgot to track? Add it here.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input 
              type="text" 
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500/50 outline-none text-slate-800 dark:text-white font-bold" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you focus on?"
            />
            <select 
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500/50 outline-none text-slate-800 dark:text-white font-bold" 
              value={habitId}
              onChange={(e) => setHabitId(e.target.value)}
              required
            >
              <option value="">Select a Category</option>
              {habits.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Date</label>
              <input type="date" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold dark:text-white outline-none" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">From</label>
              <input type="time" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold dark:text-white outline-none" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Until</label>
              <input type="time" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold dark:text-white outline-none" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="w-full py-5 bg-rose-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs mt-4 flex items-center justify-center gap-3 hover:bg-rose-600 shadow-xl shadow-rose-200 dark:shadow-none transition-all">
            <Save size={18} /> Add Entry
          </button>
        </form>
      </div>
    </div>
  );
};

export const TimeTracker: React.FC = () => {
  const { data, activeHabits, startTimer, stopTimer, addManualTimeEntry, deleteTimeEntry } = useHabits();
  const [description, setDescription] = useState('');
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

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
    if (data.activeTimer) { stopTimer(); setDescription(''); }
    else {
      if (!selectedHabitId) { alert('Select a habit first.'); return; }
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
    <div className="space-y-10 max-w-6xl mx-auto animate-in fade-in duration-500">
      <ManualEntryModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} habits={allHabits} onSave={addManualTimeEntry} />
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row items-center gap-6 sticky top-8 z-30 transition-all duration-500">
        <div className="flex-1 w-full"><input type="text" placeholder="Focused on..." className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none text-xl font-bold px-2" value={description} onChange={(e) => setDescription(e.target.value)} disabled={!!data.activeTimer} /></div>
        <div className="flex flex-wrap items-center gap-6 w-full xl:w-auto justify-between xl:justify-end">
          <select className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-2xl font-bold text-sm outline-none" value={selectedHabitId} onChange={(e) => setSelectedHabitId(e.target.value)} disabled={!!data.activeTimer}><option value="">Choose Project</option>{allHabits.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}</select>
          <div className="font-mono text-3xl font-black text-slate-800 dark:text-slate-100 min-w-[140px] text-center tracking-tighter tabular-nums">{formatDuration(elapsedTime)}</div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsManualModalOpen(true)} className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-200 transition-all" title="Manual Entry"><PlusCircle size={24} /></button>
            <button onClick={handleStartStop} className={`h-14 px-10 rounded-2xl font-black text-xs tracking-widest uppercase text-white transition-all shadow-xl active:scale-90 flex items-center justify-center gap-3 ${data.activeTimer ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-600 hover:bg-blue-700'}`}>{data.activeTimer ? <>Stop <Square size={16} fill="currentColor" /></> : <>Start <Play size={16} fill="currentColor" /></>}</button>
          </div>
        </div>
      </div>
      <div className="space-y-10 pb-12">
        {Object.entries(groupedEntries).map(([date, entries]) => (
          <div key={date}>
            <div className="flex justify-between items-end px-4 mb-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{date}</span></div>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all gap-4">
                  <div className="flex-1"><div className="text-lg font-bold text-slate-800 dark:text-slate-100">{entry.description || "Focused Work"}</div><div className="text-[10px] font-black uppercase text-blue-500 mt-1">{allHabits.find(h => h.id === entry.habitId)?.title}</div></div>
                  <div className="flex items-center gap-8"><div className="text-xs font-bold text-slate-400 font-mono">{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</div><div className="text-xl font-black text-slate-800 dark:text-slate-200 font-mono tracking-tighter">{formatDuration(entry.duration)}</div><button onClick={() => deleteTimeEntry(entry.id)} className="text-slate-200 hover:text-rose-500 transition-all"><Trash2 size={18} /></button></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};