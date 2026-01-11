import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
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
    <div className="space-y-10 max-w-4xl mx-auto pb-12">
      
      {/* Profile Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 p-8">
        <div className="flex items-center gap-4 mb-8">
           <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl">
              <User size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Personal Info</h2>
              <p className="text-sm text-slate-500 font-medium">Customize your name and appearance</p>
           </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input 
            type="text" 
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className="w-full sm:flex-1 bg-slate-50 dark:bg-slate-700 border-2 border-transparent rounded-2xl px-6 py-4 text-slate-800 dark:text-slate-200 outline-none focus:border-rose-200 font-bold transition-all"
            placeholder="What's your name?"
          />
          <button 
            onClick={handleNameSave}
            className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${
              nameSaved ? 'bg-green-500 text-white' : 'bg-slate-800 dark:bg-rose-500 text-white hover:shadow-xl active:scale-95'
            }`}
          >
            <Save size={16} /> {nameSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl">
                {theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Dark Mode</h2>
                <p className="text-sm text-slate-500 font-medium">Switch between light and focused themes</p>
             </div>
          </div>
          <button 
            onClick={toggleTheme}
            className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none ${
              theme === 'dark' ? 'bg-purple-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`${
                theme === 'dark' ? 'translate-x-11' : 'translate-x-1'
              } inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition-transform duration-200`}
            />
          </button>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
              <Bell size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Smart Reminders</h2>
              <p className="text-sm text-slate-500 font-medium">Daily push notifications for your habits</p>
            </div>
          </div>
          {permission !== 'granted' && (
            <button 
              onClick={requestPermission}
              className="px-6 py-2 bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-none"
            >
              Enable
            </button>
          )}
        </div>

        {permission === 'granted' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {activeHabits.daily.length === 0 && <p className="text-slate-400 font-bold col-span-2 text-center py-4">No active habits to remind you about.</p>}
             {activeHabits.daily.map(habit => (
               <div key={habit.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/30 rounded-3xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all group">
                 <span className="font-bold text-slate-700 dark:text-slate-200 truncate pr-2">{habit.title}</span>
                 <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:shadow-md transition-all">
                   <Clock size={16} className="text-blue-500" />
                   <input 
                    type="time" 
                    className="bg-transparent border-none p-0 text-sm font-black outline-none dark:text-slate-100 cursor-pointer"
                    value={habit.reminderTime || ''}
                    onChange={(e) => updateHabitReminder('daily', habit.id, e.target.value)}
                   />
                 </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="p-8 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500 rounded-3xl text-sm font-bold flex flex-col items-center gap-4 border border-dashed border-amber-200 dark:border-amber-900/30">
            <Bell className="opacity-40" size={32} />
            <p>Notifications are required to set daily reminders.</p>
          </div>
        )}
      </div>

      {/* Archive Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-slate-100 dark:bg-slate-700 text-slate-600 rounded-2xl">
            <Archive size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Archived Habits</h2>
            <p className="text-sm text-slate-500 font-medium">Re-activate habits you've paused</p>
          </div>
        </div>

        <div className="space-y-4">
          {allArchived.length === 0 && <p className="text-slate-400 font-bold text-center py-4">The archive is empty.</p>}
          {allArchived.map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-5 border border-slate-100 dark:border-slate-700 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
               <div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 block">{habit.title}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{habit.type}</span>
               </div>
               <button 
                onClick={() => restoreHabit(habit.type, habit.id)}
                className="px-6 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 rounded-2xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
               >
                 <RotateCcw size={14} /> Restore
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
