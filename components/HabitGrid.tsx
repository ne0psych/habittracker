import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext.tsx';
import { getDaysInMonth, getDayOfWeek, getWeeksForMonth } from '../utils/helpers.ts';
import { Check, Plus, Flame, Calendar, Clock, Archive, Edit2, X, Save, Sparkles } from 'lucide-react';
import { MONTH_NAMES, CATEGORIES, Habit } from '../types.ts';

// --- Edit Modal Component ---
const EditHabitModal = ({ 
  isOpen, 
  onClose, 
  habit, 
  type, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  habit: Habit | null; 
  type: 'daily' | 'weekly' | 'monthly'; 
  onSave: (id: string, updates: Partial<Habit>) => void;
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  React.useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setCategory(habit.category);
      setReminderTime(habit.reminderTime || '');
    }
  }, [habit]);

  if (!isOpen || !habit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(habit.id, { 
      title, 
      category, 
      reminderTime: reminderTime || undefined 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Modify Habit</h3>
          <button onClick={onClose} className="p-2 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 transition-all active:rotate-90">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Habit Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-semibold"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-rose-500/10 bg-white cursor-pointer font-semibold appearance-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Reminder</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-rose-500/10 font-semibold"
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-slate-500 border border-slate-200 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-slate-800 dark:bg-rose-500 text-white border border-slate-800 dark:border-rose-400 rounded-2xl font-bold hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save size={20} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const HabitGrid: React.FC = () => {
  const { data, activeHabits, toggleHabit, addHabit, archiveHabit, updateHabitDetails } = useHabits();
  const [newHabitName, setNewHabitName] = useState('');
  const [habitType, setHabitType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [category, setCategory] = useState('Wellness');

  // Edit State
  const [editingHabit, setEditingHabit] = useState<{ type: 'daily' | 'weekly' | 'monthly', habit: Habit } | null>(null);
  
  const { month, year } = data.user;
  const daysInMonth = getDaysInMonth(month, year);
  const monthIndex = MONTH_NAMES.indexOf(month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = getWeeksForMonth(year, month);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit(habitType, newHabitName, category);
      setNewHabitName('');
    }
  };

  const openEditModal = (type: 'daily' | 'weekly' | 'monthly', habit: Habit) => {
    setEditingHabit({ type, habit });
  };

  const handleSaveEdit = (id: string, updates: Partial<Habit>) => {
    if (editingHabit) {
      updateHabitDetails(editingHabit.type, id, updates);
    }
  };

  const getDayColor = (day: number) => {
    const dayOfWeek = getDayOfWeek(year, month, day);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return isWeekend ? 'bg-slate-50/30 dark:bg-slate-900/40' : 'bg-white dark:bg-slate-950';
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === monthIndex && today.getFullYear() === year;
  };

  const getCategoryColor = (catName: string) => {
    return CATEGORIES.find(c => c.name === catName)?.color || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  };

  return (
    <div className="space-y-12">
      <EditHabitModal 
        isOpen={!!editingHabit} 
        onClose={() => setEditingHabit(null)} 
        habit={editingHabit?.habit || null}
        type={editingHabit?.type || 'daily'}
        onSave={handleSaveEdit}
      />

      {/* Add Habit Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 p-8 transition-all hover:shadow-2xl">
         <div className="flex items-center gap-2 mb-6">
            <Sparkles size={20} className="text-amber-400" />
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">What's next for you?</h2>
         </div>
         <form onSubmit={handleAddHabit} className="flex flex-col gap-6">
            <div className="flex flex-col xl:flex-row gap-4">
              <input
                type="text"
                placeholder="Write a new habit (e.g., Read 10 pages, Meditate, Code...)"
                className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white text-base font-bold focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
              />
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white text-sm font-bold focus:outline-none focus:border-rose-500/50 bg-white cursor-pointer appearance-none xl:w-48"
              >
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-wrap justify-between items-center gap-6">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setHabitType(type)}
                    className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all capitalize tracking-widest ${
                      habitType === type 
                        ? 'bg-white dark:bg-slate-700 shadow-lg text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600' 
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <button type="submit" className="px-10 py-4 bg-rose-500 text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-rose-600 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-rose-200 dark:shadow-none border border-rose-400 dark:border-transparent">
                <Plus size={20} /> Create Habit
              </button>
            </div>
         </form>
      </div>

      {/* Main Habit Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-rose-50/30 dark:from-rose-900/10 to-transparent">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200 dark:shadow-none border border-rose-400 dark:border-transparent">
               <Flame size={24} />
             </div>
             <div>
               <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Daily Journey</h2>
               <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Consistency is the secret ingredient</p>
             </div>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-max">
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              <div className="sticky left-0 w-80 bg-white dark:bg-slate-900 z-20 p-6 border-r border-slate-200 dark:border-slate-800 font-black text-xs uppercase tracking-widest text-slate-400">Habit Name</div>
              {days.map(day => (
                <div key={day} className={`w-12 flex-shrink-0 text-center py-6 text-[10px] font-black tracking-tighter border-r border-slate-100 dark:border-slate-800 last:border-r-0 ${isToday(day) ? 'bg-rose-500 text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                  {day}
                </div>
              ))}
              <div className="w-24 flex-shrink-0 text-center p-6 font-black text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">🔥 Streak</div>
            </div>
            {activeHabits.daily.map((habit, idx) => (
              <div key={habit.id} className={`flex group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-300 ${idx !== activeHabits.daily.length - 1 ? 'border-b border-slate-200 dark:border-slate-800' : ''}`}>
                <div className="sticky left-0 w-80 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80 transition-colors z-20 p-5 border-r border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-[4px_0_15px_-4px_rgba(0,0,0,0.05)]">
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-slate-800 dark:text-slate-100 text-base font-bold leading-tight">{habit.title}</span>
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full w-fit mt-2 font-black uppercase tracking-widest border border-slate-200 dark:border-transparent ${getCategoryColor(habit.category)}`}>{habit.category}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 duration-300">
                    <button 
                      onClick={() => openEditModal('daily', habit)}
                      className="p-2 text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => archiveHabit('daily', habit.id)}
                      className="p-2 text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                    >
                      <Archive size={16} />
                    </button>
                  </div>
                </div>
                {days.map(day => {
                  const dateKey = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}-${habit.id}`;
                  const isCompleted = !!data.logs.dailyCompletion[dateKey];
                  return (
                    <div key={day} className={`w-12 flex-shrink-0 flex items-center justify-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${getDayColor(day)}`}>
                      <button
                        onClick={() => toggleHabit('daily', habit.id, dateKey)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 transform ${
                          isCompleted 
                            ? 'bg-rose-500 border border-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none scale-100 rotate-0' 
                            : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-400 scale-90 hover:scale-105'
                        } active:scale-75`}
                      >
                        {isCompleted && <Check size={16} strokeWidth={4} className="animate-in zoom-in duration-300" />}
                      </button>
                    </div>
                  );
                })}
                <div className="w-24 flex-shrink-0 flex items-center justify-center text-slate-800 dark:text-slate-100 font-black text-sm gap-1 bg-slate-50/50 dark:bg-slate-800/30 border-l border-slate-100 dark:border-slate-800">
                  <Flame size={16} className="text-orange-500 fill-orange-500" />
                  {data.analytics.streaks[habit.id] || 0}
                </div>
              </div>
            ))}
            {activeHabits.daily.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 border-t border-slate-200 dark:border-slate-800">
                <Flame size={64} className="mb-4 opacity-10" />
                <p className="text-xl font-bold tracking-tight">Your streak begins with a single step.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};