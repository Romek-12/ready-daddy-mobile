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

async function getOrCreateCalendarId(): Promise<string> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  // On Android: prefer existing "Ready Daddy" calendar, then any writable calendar
  if (Platform.OS === 'android') {
    const existing = calendars.find(c => c.title === CALENDAR_NAME && c.allowsModifications);
    if (existing) return existing.id;

    // Pick Google calendar by account type, fallback to any writable
    const writable = calendars.filter(c => c.allowsModifications);
    const google = writable.find(c =>
      c.source?.name?.toLowerCase().includes('google') ||
      c.source?.type?.toLowerCase().includes('google') ||
      c.ownerAccount?.includes('@gmail.com'),
    );
    if (google) return google.id;

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

    const notesParts: string[] = [];
    if (params.doctor) notesParts.push(`Lekarz: ${params.doctor}`);
    if (params.notes) notesParts.push(params.notes);
    const notesString = notesParts.join('\n') || undefined;

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

    const notesParts: string[] = [];
    if (params.doctor) notesParts.push(`Lekarz: ${params.doctor}`);
    if (params.notes) notesParts.push(params.notes);
    const notesString = notesParts.join('\n') || undefined;

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
