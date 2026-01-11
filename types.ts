export interface User {
  id: string;
  name: string;
  month: string; // "January"
  year: number; // 2026
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
  // Key format: "YYYY-MM-DD-habitId" -> boolean | number
  dailyCompletion: Record<string, boolean>;
  // Key format: "YYYY-Www-habitId" (ww = week number) -> boolean
  weeklyCompletion: Record<string, boolean>;
  // Key format: "YYYY-MM-habitId" -> number (progress %) or boolean
  monthlyCompletion: Record<string, boolean>;
}

export interface Analytics {
  streaks: Record<string, number>; // habitId -> current streak
  completionRates: Record<string, number>; // habitId -> %
  bestDay: string; // Day of week
  worstDay: string; // Day of week
}

export interface TimeEntry {
  id: string;
  habitId: string; // Linked to a habit (acting as Project)
  description: string; // Specific task description
  startTime: string; // ISO string
  endTime: string; // ISO string
  duration: number; // seconds
}

export interface ActiveTimer {
  habitId: string;
  description: string;
  startTime: string; // ISO string
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
