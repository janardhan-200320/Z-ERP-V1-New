import { safeGetItem, safeSetItem } from '@/lib/storage';

export const ANNOUNCEMENT_STORAGE_KEY = 'z_erp_announcements';
export const ANNOUNCEMENT_UPDATED_EVENT = 'z_erp_announcements_updated';

export type AnnouncementPriority = 'high' | 'medium' | 'low';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  createdAt: string;
  expiresAt?: string;
  createdBy?: string;
}

interface CreateAnnouncementInput {
  title: string;
  message: string;
  priority: AnnouncementPriority;
  expiresAt?: string;
  createdBy?: string;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [];

function sortAnnouncements(items: Announcement[]): Announcement[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });
}

function isExpired(announcement: Announcement): boolean {
  if (!announcement.expiresAt) return false;
  const endOfExpiry = new Date(announcement.expiresAt);
  endOfExpiry.setHours(23, 59, 59, 999);
  return Date.now() > endOfExpiry.getTime();
}

function notifyAnnouncementChange() {
  window.dispatchEvent(new Event(ANNOUNCEMENT_UPDATED_EVENT));
}

export function getAnnouncements(): Announcement[] {
  const stored = safeGetItem<Announcement[]>(ANNOUNCEMENT_STORAGE_KEY, DEFAULT_ANNOUNCEMENTS);
  return sortAnnouncements(stored);
}

export function getActiveAnnouncements(limit?: number): Announcement[] {
  const active = getAnnouncements().filter((announcement) => !isExpired(announcement));
  if (!limit || limit <= 0) return active;
  return active.slice(0, limit);
}

export function createAnnouncement(input: CreateAnnouncementInput): Announcement {
  const next: Announcement = {
    id: `ANN-${Date.now()}`,
    title: input.title.trim(),
    message: input.message.trim(),
    priority: input.priority,
    createdAt: new Date().toISOString(),
    expiresAt: input.expiresAt,
    createdBy: input.createdBy,
  };

  const current = getAnnouncements();
  safeSetItem(ANNOUNCEMENT_STORAGE_KEY, [next, ...current]);
  notifyAnnouncementChange();
  return next;
}

export function deleteAnnouncement(id: string): void {
  const filtered = getAnnouncements().filter((announcement) => announcement.id !== id);
  safeSetItem(ANNOUNCEMENT_STORAGE_KEY, filtered);
  notifyAnnouncementChange();
}

export function isAnnouncementExpired(announcement: Announcement): boolean {
  return isExpired(announcement);
}
