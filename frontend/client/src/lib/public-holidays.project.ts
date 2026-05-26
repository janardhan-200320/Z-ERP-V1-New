import { safeGetItem, safeSetItem } from '@/lib/storage';

export const PUBLIC_HOLIDAY_STORAGE_KEY = 'z_erp_public_holidays';
export const PUBLIC_HOLIDAY_UPDATED_EVENT = 'z_erp_public_holidays_updated';

export interface PublicHoliday {
  id: string;
  name: string;
  date: string;
  description?: string;
  createdAt: string;
  createdBy?: string;
}

interface CreatePublicHolidayInput {
  name: string;
  date: string;
  description?: string;
  createdBy?: string;
}

const DEFAULT_PUBLIC_HOLIDAYS: PublicHoliday[] = [];

function sortHolidays(items: PublicHoliday[]): PublicHoliday[] {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.date).getTime();
    const bDate = new Date(b.date).getTime();
    return aDate - bDate;
  });
}

function notifyHolidayChange() {
  window.dispatchEvent(new Event(PUBLIC_HOLIDAY_UPDATED_EVENT));
}

export function getPublicHolidays(): PublicHoliday[] {
  const stored = safeGetItem<PublicHoliday[]>(PUBLIC_HOLIDAY_STORAGE_KEY, DEFAULT_PUBLIC_HOLIDAYS);
  return sortHolidays(stored);
}

export function getUpcomingPublicHolidays(limit?: number): PublicHoliday[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = getPublicHolidays().filter((holiday) => {
    const holidayDate = new Date(holiday.date);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate.getTime() >= today.getTime();
  });

  if (!limit || limit <= 0) return upcoming;
  return upcoming.slice(0, limit);
}

export function createPublicHoliday(input: CreatePublicHolidayInput): PublicHoliday {
  const next: PublicHoliday = {
    id: `HOL-${Date.now()}`,
    name: input.name.trim(),
    date: input.date,
    description: input.description?.trim(),
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
  };

  const current = getPublicHolidays();
  safeSetItem(PUBLIC_HOLIDAY_STORAGE_KEY, sortHolidays([...current, next]));
  notifyHolidayChange();
  return next;
}

export function deletePublicHoliday(id: string): void {
  const filtered = getPublicHolidays().filter((holiday) => holiday.id !== id);
  safeSetItem(PUBLIC_HOLIDAY_STORAGE_KEY, filtered);
  notifyHolidayChange();
}
