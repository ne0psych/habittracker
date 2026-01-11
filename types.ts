export interface User {
  id: string;
  name: string;
  month: string; // "January"
  year: number; // 2026
  hasOnboarded: boolean;
}

export interface Habit {
  id: string;
  title: string;
  category: string; // "Wellness", "Work", etc.
  reminderTime?: string; // "08:00", "20:30"
  createdAt: string;
  archived: boolean;
}

export interface HabitsData {
  daily: Habit[];
  weekly: Habit[];
  monthly: Habit[];
}

export interface Logs {
  dailyCompletion: Record<string, boolean>;
  weeklyCompletion: Record<string, boolean>;
  monthlyCompletion: Record<string, boolean>;
}

export interface Analytics {
  streaks: Record<string, number>;
  completionRates: Record<string, number>;
  bestDay: string;
  worstDay: string;
}

export interface TimeEntry {
  id: string;
  habitId: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export interface ActiveTimer {
  habitId: string;
  description: string;
  startTime: string;
}

export interface HabitTrackerData {
  user: User;
  habits: HabitsData;
  logs: Logs;
  analytics: Analytics;
  affirmation: {
    text: string;
    imageUrl: string;
  };
  monthlyReflection: {
    notes: string;
    savedAt: string | null;
  };
  timeEntries: TimeEntry[];
  activeTimer: ActiveTimer | null;
  journals: Record<string, string>; // dateKey (YYYY-MM-DD) -> HTML content
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const CATEGORIES = [
  { name: 'Wellness', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Work', color: 'bg-blue-100 text-blue-700' },
  { name: 'Learning', color: 'bg-purple-100 text-purple-700' },
  { name: 'Creativity', color: 'bg-rose-100 text-rose-700' },
  { name: 'General', color: 'bg-slate-100 text-slate-700' }
];
