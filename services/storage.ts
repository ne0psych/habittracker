import { HabitTrackerData, MONTH_NAMES } from '../types';

const STORAGE_KEY = 'habit_tracker_v1';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const getInitialData = (): HabitTrackerData => {
  const now = new Date();
  return {
    user: {
      id: generateId(),
      name: "Mindful Achiever",
      month: MONTH_NAMES[now.getMonth()],
      year: now.getFullYear(),
    },
    habits: {
      daily: [],
      weekly: [],
      monthly: [],
    },
    logs: {
      dailyCompletion: {},
      weeklyCompletion: {},
      monthlyCompletion: {},
    },
    analytics: {
      streaks: {},
      completionRates: {},
      bestDay: "",
      worstDay: "",
    },
    affirmation: {
      text: "I am capable of achieving my goals through consistent small steps.",
      imageUrl: "https://picsum.photos/800/400",
    },
    monthlyReflection: {
      notes: "",
      savedAt: null,
    },
    timeEntries: [],
    activeTimer: null
  };
};

export const loadData = (): HabitTrackerData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Remove community data if it exists in local storage from previous versions
      if ('community' in parsed) {
        delete parsed.community;
      }
      // Migration: Ensure new fields exist for existing users
      if (!parsed.timeEntries) parsed.timeEntries = [];
      if (!parsed.activeTimer) parsed.activeTimer = null;
      
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load data", e);
  }
  return getInitialData();
};

export const saveData = (data: HabitTrackerData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

export const generateBackup = (data: HabitTrackerData) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // In a real browser environment, automatic download might be blocked.
    // We return the URL so the UI can present a button or try to trigger it.
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `habit-tracker-backup-${dateStr}.json`;
    
    return { url, filename };
  } catch (e) {
    console.error("Backup generation failed", e);
    return null;
  }
};
