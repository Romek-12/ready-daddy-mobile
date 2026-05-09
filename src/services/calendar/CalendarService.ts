import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { logError } from '../../utils/logError';

const CALENDAR_NAME = 'Ready Daddy';

interface AddEventParams {
  title: string;
  date: string;          // YYYY-MM-DD
  time?: string;         // HH:MM — brak → allDay
  durationMinutes: number;
  location?: string;
  doctor?: string;
  notes?: string;
}

function buildNotesString(doctor?: string, notes?: string): string | undefined {
  const parts: string[] = [];
  if (doctor) parts.push(`Lekarz: ${doctor}`);
  if (notes) parts.push(notes);
  return parts.join('\n') || undefined;
}

function isGoogleCalendar(c: Calendar.Calendar): boolean {
  const sourceName = c.source?.name?.toLowerCase() ?? '';
  const sourceType = c.source?.type?.toLowerCase() ?? '';
  const owner = c.ownerAccount?.toLowerCase() ?? '';
  return (
    sourceName.includes('google') ||
    sourceType.includes('google') ||
    sourceType === 'com.google' ||
    owner.includes('@gmail.com') ||
    owner.includes('@googlemail.com')
  );
}

async function getOrCreateCalendarId(): Promise<string> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  // On Android: ALWAYS prefer a writable Google calendar (syncs to Google account
  // and shows up on other devices). Only fall back to any writable calendar if no
  // Google account is present on the device.
  if (Platform.OS === 'android') {
    const writable = calendars.filter(c => c.allowsModifications);

    // Prefer the user's primary Google calendar (isPrimary === true), then any Google calendar
    const googlePrimary = writable.find(c => isGoogleCalendar(c) && c.isPrimary);
    if (googlePrimary) return googlePrimary.id;

    const googleAny = writable.find(c => isGoogleCalendar(c));
    if (googleAny) return googleAny.id;

    if (writable.length > 0) return writable[0].id;

    throw new Error('Brak dostępnego kalendarza na tym urządzeniu');
  }

  // iOS: use existing or create new
  const existing = calendars.find(c => c.title === CALENDAR_NAME);
  if (existing) return existing.id;

  const defaultCalendarSource = await getIosDefaultSource();
  return Calendar.createCalendarAsync({
    title: CALENDAR_NAME,
    color: '#00E5CC',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: defaultCalendarSource.id,
    source: defaultCalendarSource,
    name: 'readydaddy',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
}

async function getIosDefaultSource(): Promise<Calendar.Source> {
  const sources = await Calendar.getSourcesAsync();
  if (sources.length === 0) {
    throw new Error('No calendar sources available on this device');
  }
  return sources.find(s => s.type === Calendar.SourceType.LOCAL) ?? sources[0];
}

export async function addCalendarEvent(params: AddEventParams): Promise<string | null> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return null;

  try {
    const calendarId = await getOrCreateCalendarId();

    const [year, month, day] = params.date.split('-').map(Number);
    let startDate: Date;
    let allDay = false;

    if (params.time) {
      const [hour, minute] = params.time.split(':').map(Number);
      startDate = new Date(year, month - 1, day, hour, minute);
    } else {
      startDate = new Date(year, month - 1, day);
      allDay = true;
    }

    const endDate = new Date(startDate.getTime() + params.durationMinutes * 60 * 1000);

    const notesString = buildNotesString(params.doctor, params.notes);

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: params.title,
      startDate,
      endDate,
      allDay,
      location: params.location,
      notes: notesString,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    return eventId;
  } catch (err: unknown) {
    logError('CalendarService.addCalendarEvent', err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

interface CreateExamEventParams {
  title: string;
  start: Date;
  end: Date;
  doctor?: string;
  location?: string;
  notes?: string;
}

const EXAM_ALARMS = [
  { relativeOffset: -2880 }, // 2 days before
  { relativeOffset: -1440 }, // 1 day before
  { relativeOffset: -120 },  // 2 hours before
];

export async function createExamEvent(params: CreateExamEventParams): Promise<string | null> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return null;

  try {
    const calendarId = await getOrCreateCalendarId();

    const notesString = buildNotesString(params.doctor, params.notes);

    return await Calendar.createEventAsync(calendarId, {
      title: params.title,
      startDate: params.start,
      endDate: params.end,
      location: params.location,
      notes: notesString,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      alarms: EXAM_ALARMS,
    });
  } catch (err: unknown) {
    logError('CalendarService.createExamEvent', err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

export async function deleteExamEvent(eventId: string): Promise<void> {
  try {
    await Calendar.deleteEventAsync(eventId);
  } catch (err: unknown) {
    logError('CalendarService.deleteExamEvent', err instanceof Error ? err : new Error(String(err)));
  }
}
