import { HabitTrackerData, Habit, MONTH_NAMES } from '../types';

// Simple date helpers
export const getDaysInMonth = (monthName: string, year: number) => {
  const monthIndex = MONTH_NAMES.indexOf(monthName);
  return new Date(year, monthIndex + 1, 0).getDate();
};

export const getDayOfWeek = (year: number, monthName: string, day: number) => {
  const monthIndex = MONTH_NAMES.indexOf(monthName);
  return new Date(year, monthIndex, day).getDay(); // 0 = Sunday
};

export const getWeekNumber = (date: Date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const getWeeksForMonth = (year: number, monthName: string) => {
  const monthIndex = MONTH_NAMES.indexOf(monthName);
  const daysInMonth = getDaysInMonth(monthName, year);
  const weeks = new Set<number>();
  
  // Check the week number for the 1st, 8th, 15th, 22nd, and last day
  const checkDays = [1, 8, 15, 22, daysInMonth];
  
  checkDays.forEach(day => {
    if (day <= daysInMonth) {
      const date = new Date(year, monthIndex, day);
      weeks.add(getWeekNumber(date));
    }
  });
  
  return Array.from(weeks).sort((a, b) => a - b);
};

export const calculateStreaks = (
  habit: Habit,
  logs: Record<string, boolean>,
  year: number,
  monthName: string
) => {
  const monthIndex = MONTH_NAMES.indexOf(monthName);
  const today = new Date();
  // If viewing past month, check till end of that month. If current, till today.
  let checkDate = new Date(year, monthIndex + 1, 0); 
  if (today < checkDate) checkDate = today;

  let currentStreak = 0;
  let tempDate = new Date(checkDate);

  // Simple streak calculation iterating backwards
  while (true) {
    const key = `${tempDate.getFullYear()}-${(tempDate.getMonth() + 1).toString().padStart(2, '0')}-${tempDate.getDate().toString().padStart(2, '0')}-${habit.id}`;
    if (logs[key]) {
      currentStreak++;
      tempDate.setDate(tempDate.getDate() - 1);
    } else {
      // If we are checking "today" and it's not done yet, don't break streak from yesterday
      if (tempDate.getTime() === today.setHours(0,0,0,0) && !logs[key]) {
         tempDate.setDate(tempDate.getDate() - 1);
         continue;
      }
      break;
    }
  }
  return currentStreak;
};

export const calculateCompletionRate = (
  habit: Habit,
  logs: Record<string, boolean>,
  year: number,
  monthName: string
) => {
  const daysInMonth = getDaysInMonth(monthName, year);
  const monthIndex = MONTH_NAMES.indexOf(monthName);
  let completed = 0;
  let totalDays = 0;
  
  const now = new Date();
  
  // Only count days passed so far if it's the current month
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === monthIndex;
  const daysToCount = isCurrentMonth ? now.getDate() : daysInMonth;

  for (let i = 1; i <= daysToCount; i++) {
    const key = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}-${habit.id}`;
    if (logs[key]) completed++;
    totalDays++;
  }

  return totalDays === 0 ? 0 : Math.round((completed / totalDays) * 100);
};
