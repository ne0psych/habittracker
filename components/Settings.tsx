import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { Bell, RotateCcw, Archive, Clock, Moon, Sun } from 'lucide-react';

export const Settings: React.FC = () => {
  const { data, activeHabits, restoreHabit, updateHabitReminder, theme, toggleTheme } = useHabits();
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const allArchived = [
    ...data.habits.daily.filter(h => h.archived).map(h => ({ ...h, type: 'daily' as const })),
    ...data.habits.weekly.filter(h => h.archived).map(h => ({ ...h, type: 'weekly' as const })),
    ...data.habits.monthly.filter(h => h.archived).map(h => ({ ...h, type: 'monthly' as const })),
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Theme Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Appearance</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark mode</p>
             </div>
          </div>
          <button 
            onClick={toggleTheme}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
              theme === 'dark' ? 'bg-purple-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`${
                theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
              } inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200`}
            />
          </button>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Reminders</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Set daily notifications for your habits</p>
            </div>
          </div>
          {permission !== 'granted' && (
            <button 
              onClick={requestPermission}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600"
            >
              Enable Notifications
            </button>
          )}
        </div>

        {permission === 'granted' ? (
          <div className="space-y-4">
             {activeHabits.daily.length === 0 && <p className="text-slate-400 text-sm">No active daily habits.</p>}
             {activeHabits.daily.map(habit => (
               <div key={habit.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                 <span className="font-medium text-slate-700 dark:text-slate-200">{habit.title}</span>
                 <div className="flex items-center gap-2">
                   <Clock size={16} className="text-slate-400" />
                   <input 
                    type="time" 
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-sm outline-none focus:border-blue-300 dark:text-slate-200"
                    value={habit.reminderTime || ''}
                    onChange={(e) => updateHabitReminder('daily', habit.id, e.target.value)}
                   />
                 </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-xl text-sm">
            Please enable notifications to set reminders.
          </div>
        )}
      </div>

      {/* Archive Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
            <Archive size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Archived Habits</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Restore habits you previously removed</p>
          </div>
        </div>

        <div className="space-y-3">
          {allArchived.length === 0 && <p className="text-slate-400 text-sm">No archived habits.</p>}
          {allArchived.map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50">
               <div>
                  <span className="font-medium text-slate-700 dark:text-slate-200 block">{habit.title}</span>
                  <span className="text-xs text-slate-400 capitalize">{habit.type}</span>
               </div>
               <button 
                onClick={() => restoreHabit(habit.type, habit.id)}
                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
               >
                 <RotateCcw size={16} /> Restore
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};