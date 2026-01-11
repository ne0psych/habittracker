import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { getDaysInMonth, getDayOfWeek, getWeeksForMonth } from '../utils/helpers';
import { Check, Plus, Flame, Calendar, Clock, Archive, Edit2, X, Save } from 'lucide-react';
import { MONTH_NAMES, CATEGORIES, Habit } from '../types';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all border dark:border-slate-700">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Edit Habit</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Habit Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 bg-white cursor-pointer"
            >
              {CATEGORIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reminder Time (Optional)</label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors flex items-center gap-2"
            >
              <Save size={18} /> Save Changes
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
    return isWeekend ? 'bg-slate-50/50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900';
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === monthIndex && today.getFullYear() === year;
  };

  const getCategoryColor = (catName: string) => {
    return CATEGORIES.find(c => c.name === catName)?.color || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  };

  return (
    <div className="space-y-8">
      <EditHabitModal 
        isOpen={!!editingHabit} 
        onClose={() => setEditingHabit(null)} 
        habit={editingHabit?.habit || null}
        type={editingHabit?.type || 'daily'}
        onSave={handleSaveEdit}
      />

      {/* Add Habit Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 transition-shadow hover:shadow-md">
         <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Add New Habit</h2>
         <form onSubmit={handleAddHabit} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="What do you want to achieve?"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all placeholder:text-slate-400"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
              />
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 bg-white cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setHabitType(type)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                      habitType === type 
                        ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-600/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <button type="submit" className="px-6 py-3 bg-rose-500 text-white font-medium rounded-xl hover:bg-rose-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-rose-200">
                <Plus size={20} /> <span className="hidden sm:inline">Add Habit</span>
              </button>
            </div>
         </form>
      </div>

      {/* Daily Habits */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-rose-50/50 dark:from-rose-900/20 to-white dark:to-slate-800">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg shadow-sm">
               <Flame size={20} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daily Habits</h2>
               <p className="text-sm text-slate-500 dark:text-slate-400">Track your consistency day by day</p>
             </div>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-max">
            <div className="flex border-b border-slate-100 dark:border-slate-700">
              <div className="sticky left-0 w-72 bg-white dark:bg-slate-800 z-20 p-4 border-r border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">Habit</div>
              {days.map(day => (
                <div key={day} className={`w-12 flex-shrink-0 text-center py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 border-r border-slate-50 dark:border-slate-700 last:border-r-0 ${isToday(day) ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : ''}`}>
                  {day}
                </div>
              ))}
              <div className="w-24 flex-shrink-0 text-center p-4 font-bold text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-700/30">Streak</div>
            </div>
            {activeHabits.daily.map((habit, idx) => (
              <div key={habit.id} className={`flex group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors ${idx !== activeHabits.daily.length - 1 ? 'border-b border-slate-50 dark:border-slate-700' : ''}`}>
                <div className="sticky left-0 w-72 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80 transition-colors z-20 p-3 border-r border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-slate-800 dark:text-slate-100 text-sm font-semibold">{habit.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full w-max mt-1 font-medium ${getCategoryColor(habit.category)}`}>{habit.category}</span>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal('daily', habit)}
                      className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => archiveHabit('daily', habit.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                      title="Archive"
                    >
                      <Archive size={14} />
                    </button>
                  </div>
                </div>
                {days.map(day => {
                  const dateKey = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}-${habit.id}`;
                  const isCompleted = !!data.logs.dailyCompletion[dateKey];
                  return (
                    <div key={day} className={`w-12 flex-shrink-0 flex items-center justify-center border-r border-slate-50 dark:border-slate-700 last:border-r-0 ${getDayColor(day)}`}>
                      <button
                        onClick={() => toggleHabit('daily', habit.id, dateKey)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 ${
                          isCompleted 
                            ? 'bg-rose-500 border-rose-600 text-white shadow-sm scale-100' 
                            : 'bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-500 hover:border-rose-300 dark:hover:border-rose-400 scale-90 hover:scale-100'
                        }`}
                      >
                        {isCompleted && <Check size={14} strokeWidth={3} />}
                      </button>
                    </div>
                  );
                })}
                <div className="w-24 flex-shrink-0 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-sm gap-1 bg-slate-50/50 dark:bg-slate-700/30">
                  <Flame size={14} className="text-orange-500 fill-orange-500" />
                  {data.analytics.streaks[habit.id] || 0}
                </div>
              </div>
            ))}
            {activeHabits.daily.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                <Flame size={48} className="mb-4 text-slate-200 dark:text-slate-700" />
                <p>No daily habits yet. Start small!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Habits */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-purple-50/50 dark:from-purple-900/20 to-white dark:to-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg shadow-sm">
                <Clock size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Weekly Habits</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Achieve these once a week</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
             <div className="min-w-full">
                <div className="flex border-b border-slate-100 dark:border-slate-700">
                  <div className="w-60 flex-shrink-0 p-4 border-r border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200">Habit</div>
                  {weeks.map((weekNum, i) => (
                    <div key={weekNum} className="flex-1 min-w-[4rem] text-center p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 border-r border-slate-50 dark:border-slate-700 last:border-r-0">
                      Week {i + 1}
                    </div>
                  ))}
                </div>
                {activeHabits.weekly.map(habit => (
                  <div key={habit.id} className="flex group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-b-0">
                    <div className="w-60 flex-shrink-0 p-3 border-r border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex flex-col min-w-0">
                         <span className="truncate text-slate-800 dark:text-slate-100 text-sm font-semibold">{habit.title}</span>
                         <span className={`text-[10px] px-2 py-0.5 rounded-full w-max mt-1 font-medium ${getCategoryColor(habit.category)}`}>{habit.category}</span>
                      </div>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal('weekly', habit)}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => archiveHabit('weekly', habit.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                        >
                          <Archive size={14} />
                        </button>
                      </div>
                    </div>
                    {weeks.map(weekNum => {
                      const dateKey = `${year}-W${weekNum}-${habit.id}`;
                      const isCompleted = !!data.logs.weeklyCompletion[dateKey];
                      return (
                        <div key={weekNum} className="flex-1 min-w-[4rem] flex items-center justify-center border-r border-slate-50 dark:border-slate-700 last:border-r-0 p-2">
                           <button
                            onClick={() => toggleHabit('weekly', habit.id, dateKey)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                              isCompleted 
                                ? 'bg-purple-500 border-purple-600 text-white shadow-sm scale-100' 
                                : 'bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-500 hover:border-purple-300 dark:hover:border-purple-400 scale-90 hover:scale-100'
                            }`}
                          >
                            {isCompleted && <Check size={16} strokeWidth={3} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
                {activeHabits.weekly.length === 0 && (
                  <div className="p-12 text-center text-slate-400">No weekly habits yet.</div>
                )}
             </div>
          </div>
        </div>

        {/* Monthly Habits */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-teal-50/50 dark:from-teal-900/20 to-white dark:to-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-lg shadow-sm">
                <Calendar size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Monthly Habits</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Big goals for {month}</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {activeHabits.monthly.map(habit => {
               const dateKey = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${habit.id}`;
               const isCompleted = !!data.logs.monthlyCompletion[dateKey];
               return (
                <div key={habit.id} className="flex group items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/30 rounded-xl hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-100 block">{habit.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full w-max mt-1 font-medium ${getCategoryColor(habit.category)}`}>{habit.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleHabit('monthly', habit.id, dateKey)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                        isCompleted 
                          ? 'bg-teal-500 text-white shadow-md' 
                          : 'bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-500 text-slate-500 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400'
                      }`}
                    >
                      {isCompleted ? <Check size={16} /> : "Mark Done"}
                    </button>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pl-2 border-l border-slate-200 dark:border-slate-600 ml-2">
                      <button 
                        onClick={() => openEditModal('monthly', habit)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                       <button 
                          onClick={() => archiveHabit('monthly', habit.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                        >
                          <Archive size={16} />
                        </button>
                    </div>
                  </div>
                </div>
               );
            })}
            {activeHabits.monthly.length === 0 && (
              <div className="p-12 text-center text-slate-400">No monthly habits yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};