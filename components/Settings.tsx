import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext.tsx';
import { Bell, RotateCcw, Archive, Clock, Moon, Sun, User, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const { data, activeHabits, restoreHabit, updateHabitReminder, theme, toggleTheme, updateUserName } = useHabits();
  const [permission, setPermission] = useState(Notification.permission);
  const [tempName, setTempName] = useState(data.user.name);
  const [nameSaved, setNameSaved] = useState(false);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      updateUserName(tempName);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
  };

  const allArchived = [
    ...data.habits.daily.filter(h => h.archived).map(h => ({ ...h, type: 'daily' as const })),
    ...data.habits.weekly.filter(h => h.archived).map(h => ({ ...h, type: 'weekly' as const })),
    ...data.habits.monthly.filter(h => h.archived).map(h => ({ ...h, type: 'monthly' as const })),
  ];

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-12 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-800 p-10">
        <div className="flex items-center gap-4 mb-8">
           <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-2xl border border-rose-100 dark:border-rose-800"><User size={24} /></div>
           <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Identity</h2>
              <p className="text-sm text-slate-500 font-medium">How we address you</p>
           </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full sm:flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-transparent rounded-2xl px-6 py-4 text-slate-800 dark:text-slate-200 font-bold outline-none focus:border-rose-200 transition-all" />
          <button onClick={handleNameSave} className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all border ${nameSaved ? 'bg-green-500 text-white border-green-600' : 'bg-slate-800 dark:bg-rose-500 text-white border-slate-900 dark:border-rose-400 hover:shadow-xl'}`}><Save size={16} /> {nameSaved ? 'Saved' : 'Update'}</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-800 p-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-2xl border border-blue-100 dark:border-blue-800"><Bell size={24} /></div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Smart Reminders</h2>
              <p className="text-sm text-slate-500 font-medium">Daily gentle nudges</p>
            </div>
          </div>
          {permission !== 'granted' && <button onClick={requestPermission} className="px-6 py-3 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all border border-blue-600">Enable</button>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeHabits.daily.length === 0 && <p className="text-slate-400 font-bold col-span-2 text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">Create some habits to set reminders.</p>}
          {activeHabits.daily.map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl group transition-all border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-200 truncate pr-4">{habit.title}</span>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <Clock size={14} className="text-blue-500" />
                <input type="time" className="bg-transparent border-none p-0 text-sm font-black outline-none dark:text-slate-100 cursor-pointer" value={habit.reminderTime || ''} onChange={(e) => updateHabitReminder('daily', habit.id, e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-800 p-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-500 rounded-2xl border border-purple-100 dark:border-purple-800">{theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}</div>
           <div><h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Appearance</h2><p className="text-sm text-slate-500 font-medium">Dark and light themes</p></div>
        </div>
        <button onClick={toggleTheme} className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors border border-slate-200 dark:border-slate-700 ${theme === 'dark' ? 'bg-purple-600' : 'bg-slate-200'}`}><span className={`${theme === 'dark' ? 'translate-x-11' : 'translate-x-1'} inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition-transform duration-200`} /></button>
      </div>
    </div>
  );
};