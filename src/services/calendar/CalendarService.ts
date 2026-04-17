// mobile/src/services/calendar/CalendarService.ts
import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

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
  const existing = calendars.find(c => c.title === CALENDAR_NAME);
  if (existing) return existing.id;

  const defaultCalendarSource =
    Platform.OS === 'ios'
      ? await getIosDefaultSource()
      : { isLocalAccount: true, name: CALENDAR_NAME, type: Calendar.SourceType.LOCAL };

  return Calendar.createCalendarAsync({
    title: CALENDAR_NAME,
    color: '#00E5CC',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: (defaultCalendarSource as Calendar.Source).id,
    source: defaultCalendarSource as Calendar.Source,
    name: 'readydaddy',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
}

async function getIosDefaultSource(): Promise<Calendar.Source> {
  const sources = await Calendar.getSourcesAsync();
  return sources.find(s => s.type === Calendar.SourceType.LOCAL) ?? sources[0];
}

export async function addCalendarEvent(params: AddEventParams): Promise<string | null> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return null;

  const calendarId = await getOrCreateCalendarId();

  const [year, month, day] = params.date.split('-').map(Number);
  let startDate: Date;
  let allDay = false;

  if (params.time) {
    const [hour, minute] = params.time.split(':').map(Number);
    startDate = new Date(year, month - 1, day, hour, minute);
  } else {
    startDate = new Date(year, month - 1, day, 9, 0);
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
}
