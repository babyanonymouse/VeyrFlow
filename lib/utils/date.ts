/**
 * Calculates current streak based on an array of YYYY-MM-DD strings.
 * We must treat dates as purely logical (no timezones) since checking off
 * is based on the user's localized 'YYYY-MM-DD'.
 */

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return new Date();
  // using localized Date setup but forcibly setting 00:00:00 to avoid timezone shifts
  return new Date(year, month - 1, day);
}

export function isYesterday(date1Str: string, date2Str: string): boolean {
  const d1 = parseLocalDate(date1Str);
  const d2 = parseLocalDate(date2Str);
  
  // Calculate the difference in time (milliseconds)
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
  
  return diffDays === 1;
}

export function calculateStreak(completedDates: string[], todayStr: string): number {
  if (!completedDates || completedDates.length === 0) return 0;

  // Deduplicate and ensure dates are sorted oldest to newest
  const sorted = [...new Set(completedDates)].sort((a, b) => a.localeCompare(b));
  
  let currentStreak = 0;
  // let lastCheckedDate = "";

  // The logic: iterate backwards from the latest date.
  // If the latest date is TODAY or YESTERDAY, the streak is alive.
  // If the latest date is older than YESTERDAY, streak is 0.
  const latestDateStr = sorted[sorted.length - 1];
  if (!latestDateStr) return 0;
  
  if (latestDateStr !== todayStr && !isYesterday(latestDateStr, todayStr)) {
    return 0; // The streak is already dead before today
  }

  // Count backwards to find consecutive days
  currentStreak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (prev && curr && isYesterday(prev, curr)) {
      currentStreak++;
    } else {
      break;
    }
  }

  return currentStreak;
}
