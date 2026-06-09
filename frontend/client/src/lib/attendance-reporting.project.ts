import { safeGetItem, safeSetItem } from './storage';

export type AttendanceWorkLocation = 'office' | 'wfh' | 'remote' | 'field';

export interface AttendanceFeedRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkInAt: string;
  checkOutAt?: string;
  workMode: AttendanceWorkLocation;
  workModeLabel: string;
  workLocationLabel: string;
  workStyleLabel: string;
  checkInNote?: string;
  checkOutNote?: string;
  breakDurationMs?: number;
  workDurationMs?: number;
  status: 'present' | 'late' | 'leave' | 'absent' | 'halfday';
}

interface SessionUser {
  email?: string;
  roleName?: string;
}

interface AttendanceActor {
  employeeId: string;
  employeeName: string;
  department: string;
}

export const ATTENDANCE_FEED_STORAGE_KEY = 'z_erp_attendance_feed_v1';

const ACTIVE_SESSION_STORAGE_KEY = 'z_erp_active_session';

export const workLocationMeta: Record<AttendanceWorkLocation, {
  modeLabel: string;
  locationLabel: string;
  workStyleLabel: string;
}> = {
  office: {
    modeLabel: 'Office',
    locationLabel: 'Office Premises',
    workStyleLabel: 'Onsite',
  },
  wfh: {
    modeLabel: 'Work From Home',
    locationLabel: 'Home Setup',
    workStyleLabel: 'Remote',
  },
  remote: {
    modeLabel: 'Remote',
    locationLabel: 'Anywhere',
    workStyleLabel: 'Flexible',
  },
  field: {
    modeLabel: 'Field Work',
    locationLabel: 'Client / Site Visit',
    workStyleLabel: 'On-ground',
  },
};

const getLocalDateKey = (date = new Date()) => date.toLocaleDateString('en-CA');

const getDisplayNameFromEmail = (email?: string) => {
  if (!email || !email.includes('@')) {
    return 'Current User';
  }

  const localPart = email.split('@')[0] || 'user';
  return localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((piece) => piece ? piece[0].toUpperCase() + piece.slice(1) : piece)
    .join(' ');
};

const getAttendanceActor = (): AttendanceActor => {
  const session = safeGetItem<SessionUser | null>(ACTIVE_SESSION_STORAGE_KEY, null);
  const email = session?.email || '';
  const roleName = session?.roleName || 'General';

  return {
    employeeId: email || 'current-user',
    employeeName: getDisplayNameFromEmail(email),
    department: roleName,
  };
};

export const readAttendanceFeed = () => {
  const raw = safeGetItem<AttendanceFeedRecord[]>(ATTENDANCE_FEED_STORAGE_KEY, []);
  return Array.isArray(raw) ? raw : [];
};

const saveAttendanceFeed = (records: AttendanceFeedRecord[]) => {
  return safeSetItem(ATTENDANCE_FEED_STORAGE_KEY, records);
};

export const formatHoursFromMs = (durationMs?: number) => {
  if (!durationMs || durationMs <= 0) {
    return '0h';
  }
  const hours = durationMs / (1000 * 60 * 60);
  return `${hours.toFixed(1)}h`;
};

export const startAttendanceRecord = (payload: {
  workMode: AttendanceWorkLocation;
  checkInAt: string;
  checkInNote?: string;
}) => {
  const actor = getAttendanceActor();
  const date = getLocalDateKey(new Date(payload.checkInAt));
  const meta = workLocationMeta[payload.workMode];
  const records = readAttendanceFeed();

  const existingOpenIndex = records.findIndex((record) => (
    record.employeeId === actor.employeeId &&
    record.date === date &&
    !record.checkOutAt
  ));

  const nextRecord: AttendanceFeedRecord = {
    id: existingOpenIndex >= 0 ? records[existingOpenIndex].id : `att_${Date.now()}`,
    employeeId: actor.employeeId,
    employeeName: actor.employeeName,
    department: actor.department,
    date,
    checkInAt: payload.checkInAt,
    workMode: payload.workMode,
    workModeLabel: meta.modeLabel,
    workLocationLabel: meta.locationLabel,
    workStyleLabel: meta.workStyleLabel,
    checkInNote: payload.checkInNote,
    status: 'present',
  };

  if (existingOpenIndex >= 0) {
    records[existingOpenIndex] = {
      ...records[existingOpenIndex],
      ...nextRecord,
      checkOutAt: undefined,
      checkOutNote: undefined,
      breakDurationMs: undefined,
      workDurationMs: undefined,
    };
  } else {
    records.unshift(nextRecord);
  }

  saveAttendanceFeed(records);
  return nextRecord;
};

export const finishAttendanceRecord = (payload: {
  checkOutAt: string;
  checkOutNote?: string;
  breakDurationMs: number;
  workDurationMs: number;
}) => {
  const actor = getAttendanceActor();
  const records = readAttendanceFeed();

  const openIndex = records.findIndex((record) => (
    record.employeeId === actor.employeeId &&
    !record.checkOutAt
  ));

  if (openIndex < 0) {
    return null;
  }

  records[openIndex] = {
    ...records[openIndex],
    checkOutAt: payload.checkOutAt,
    checkOutNote: payload.checkOutNote,
    breakDurationMs: payload.breakDurationMs,
    workDurationMs: payload.workDurationMs,
  };

  saveAttendanceFeed(records);
  return records[openIndex];
};
