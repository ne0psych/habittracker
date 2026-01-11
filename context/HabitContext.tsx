import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { HabitTrackerData, Habit, MONTH_NAMES, HabitsData, ActiveTimer } from '../types';
import * as StorageService from '../services/storage';
import * as Utils from '../utils/helpers';

interface HabitContextType {
  data: HabitTrackerData;
  activeHabits: HabitsData;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  updateUserName: (name: string) => void;
  addHabit: (type: 'daily' | 'weekly' | 'monthly', title: string, category: string) => void;
  updateHabitDetails: (type: 'daily' | 'weekly' | 'monthly', id: string, updates: Partial<Habit>) => void;
  toggleHabit: (type: 'daily' | 'weekly' | 'monthly', id: string, dateKey: string) => void;
  archiveHabit: (type: 'daily' | 'weekly' | 'monthly', id: string) => void;
  restoreHabit: (type: 'daily' | 'weekly' | 'monthly', id: string) => void;
  updateHabitReminder: (type: 'daily' | 'weekly' | 'monthly', id: string, time: string | undefined) => void;
  updateAffirmation: (text: string, imageUrl: string) => void;
  saveReflection: (notes: string) => void;
  saveJournal: (dateKey: string, content: string) => void;
  changeMonth: (offset: number) => void;
  exportData: () => void;
  startTimer: (habitId: string, description: string) => void;
  stopTimer: () => void;
  deleteTimeEntry: (id: string) => void;
}

const HabitContext = createContext<HabitContextType | null>(null);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<HabitTrackerData>(StorageService.getInitialData());
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme_preference') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme_preference', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const loadedData = StorageService.loadData();
    setData(loadedData);
    setIsLoaded(true);
    
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Remember to export your data backup before leaving!';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      StorageService.saveData(data);
    }
  }, [data, isLoaded]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      data.habits.daily.forEach(habit => {
        if (!habit.archived && habit.reminderTime === currentTime) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`Reminder: ${habit.title}`, {
              body: "Time to complete your habit!",
              icon: "/favicon.ico"
            });
          }
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [data.habits.daily]);

  const activeHabits = useMemo(() => {
    return {
      daily: data.habits.daily.filter(h => !h.archived),
      weekly: data.habits.weekly.filter(h => !h.archived),
      monthly: data.habits.monthly.filter(h => !h.archived),
    };
  }, [data.habits]);

  const updateUserName = useCallback((name: string) => {
    setData(prev => ({
      ...prev,
      user: { ...prev.user, name, hasOnboarded: true }
    }));
  }, []);

  const addHabit = useCallback((type: 'daily' | 'weekly' | 'monthly', title: string, category: string) => {
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      category,
      createdAt: new Date().toISOString(),
      archived: false,
    };

    setData(prev => ({
      ...prev,
      habits: {
        ...prev.habits,
        [type]: [...prev.habits[type], newHabit]
      }
    }));
  }, []);

  const updateHabitDetails = useCallback((type: 'daily' | 'weekly' | 'monthly', id: string, updates: Partial<Habit>) => {
    setData(prev => ({
      ...prev,
      habits: {
        ...prev.habits,
        [type]: prev.habits[type].map(h => h.id === id ? { ...h, ...updates } : h)
      }
    }));
  }, []);

  const archiveHabit = useCallback((type: 'daily' | 'weekly' | 'monthly', id: string) => {
    setData(prev => ({
      ...prev,
      habits: {
        ...prev.habits,
        [type]: prev.habits[type].map(h => h.id === id ? { ...h, archived: true } : h)
      }
    }));
  }, []);

  const restoreHabit = useCallback((type: 'daily' | 'weekly' | 'monthly', id: string) => {
    setData(prev => ({
      ...prev,
      habits: {
        ...prev.habits,
        [type]: prev.habits[type].map(h => h.id === id ? { ...h, archived: false } : h)
      }
    }));
  }, []);

  const updateHabitReminder = useCallback((type: 'daily' | 'weekly' | 'monthly', id: string, time: string | undefined) => {
    setData(prev => ({
      ...prev,
      habits: {
        ...prev.habits,
        [type]: prev.habits[type].map(h => h.id === id ? { ...h, reminderTime: time } : h)
      }
    }));
  }, []);

  const toggleHabit = useCallback((type: 'daily' | 'weekly' | 'monthly', id: string, dateKey: string) => {
    setData(prev => {
      const logKey = type === 'daily' ? 'dailyCompletion' : type === 'weekly' ? 'weeklyCompletion' : 'monthlyCompletion';
      const currentVal = prev.logs[logKey][dateKey];
      
      const newLogs = {
        ...prev.logs,
        [logKey]: {
          ...prev.logs[logKey],
          [dateKey]: !currentVal
        }
      };

      const newAnalytics = { ...prev.analytics };
      if (type === 'daily') {
        const habit = prev.habits.daily.find(h => h.id === id);
        if (habit) {
          newAnalytics.streaks[id] = Utils.calculateStreaks(habit, newLogs.dailyCompletion, prev.user.year, prev.user.month);
          newAnalytics.completionRates[id] = Utils.calculateCompletionRate(habit, newLogs.dailyCompletion, prev.user.year, prev.user.month);
        }
      }

      return {
        ...prev,
        logs: newLogs,
        analytics: newAnalytics
      };
    });
  }, []);

  const updateAffirmation = useCallback((text: string, imageUrl: string) => {
    setData(prev => ({
      ...prev,
      affirmation: { text, imageUrl }
    }));
  }, []);

  const saveReflection = useCallback((notes: string) => {
    setData(prev => ({
      ...prev,
      monthlyReflection: {
        notes,
        savedAt: new Date().toISOString()
      }
    }));
  }, []);

  const saveJournal = useCallback((dateKey: string, content: string) => {
    setData(prev => ({
      ...prev,
      journals: {
        ...prev.journals,
        [dateKey]: content
      }
    }));
  }, []);

  const changeMonth = useCallback((offset: number) => {
    setData(prev => {
      let monthIndex = MONTH_NAMES.indexOf(prev.user.month);
      let year = prev.user.year;
      monthIndex += offset;
      if (monthIndex > 11) {
        monthIndex = 0;
        year += 1;
      } else if (monthIndex < 0) {
        monthIndex = 11;
        year -= 1;
      }
      return {
        ...prev,
        user: {
          ...prev.user,
          month: MONTH_NAMES[monthIndex],
          year
        }
      };
    });
  }, []);

  const exportData = useCallback(() => {
    const backup = StorageService.generateBackup(data);
    if (backup) {
      const a = document.createElement('a');
      a.href = backup.url;
      a.download = backup.filename;
      a.click();
    }
  }, [data]);

  const startTimer = useCallback((habitId: string, description: string) => {
    setData(prev => ({
      ...prev,
      activeTimer: {
        habitId,
        description,
        startTime: new Date().toISOString()
      }
    }));
  }, []);

  const stopTimer = useCallback(() => {
    setData(prev => {
      if (!prev.activeTimer) return prev;
      const endTime = new Date();
      const startTime = new Date(prev.activeTimer.startTime);
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      const newEntry = {
        id: Math.random().toString(36).substr(2, 9),
        habitId: prev.activeTimer.habitId,
        description: prev.activeTimer.description,
        startTime: prev.activeTimer.startTime,
        endTime: endTime.toISOString(),
        duration
      };
      return {
        ...prev,
        timeEntries: [newEntry, ...prev.timeEntries],
        activeTimer: null
      };
    });
  }, []);

  const deleteTimeEntry = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      timeEntries: prev.timeEntries.filter(entry => entry.id !== id)
    }));
  }, []);

  return (
    <HabitContext.Provider value={{ 
      data, 
      activeHabits,
      theme,
      toggleTheme,
      updateUserName,
      addHabit, 
      updateHabitDetails,
      toggleHabit, 
      archiveHabit,
      restoreHabit,
      updateHabitReminder,
      updateAffirmation, 
      saveReflection, 
      saveJournal,
      changeMonth, 
      exportData,
      startTimer,
      stopTimer,
      deleteTimeEntry
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) throw new Error("useHabits must be used within HabitProvider");
  return context;
};
