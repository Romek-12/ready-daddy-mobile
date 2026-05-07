import * as Calendar from 'expo-calendar';
import { createExamEvent, deleteExamEvent } from '../CalendarService';

jest.mock('expo-calendar');

const mockedCalendar = Calendar as jest.Mocked<typeof Calendar>;

describe('CalendarService exam events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCalendar.requestCalendarPermissionsAsync.mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
      expires: 'never',
    } as never);
    mockedCalendar.getCalendarsAsync.mockResolvedValue([
      { id: 'cal-1', title: 'Ready Daddy', allowsModifications: true } as never,
    ]);
    mockedCalendar.createEventAsync.mockResolvedValue('evt-123' as never);
    mockedCalendar.deleteEventAsync.mockResolvedValue(undefined as never);
  });

  it('createExamEvent passes 3 alarms (-2880, -1440, -120)', async () => {
    const start = new Date(2026, 4, 10, 9, 0);
    const end = new Date(2026, 4, 10, 10, 0);
    const id = await createExamEvent({ title: 'USG', start, end, doctor: 'Dr X', location: 'Klinika' });
    expect(id).toBe('evt-123');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const callArgs = mockedCalendar.createEventAsync.mock.calls[0]![1]!;
    expect(callArgs.alarms).toEqual([
      { relativeOffset: -2880 },
      { relativeOffset: -1440 },
      { relativeOffset: -120 },
    ]);
    expect(callArgs.title).toBe('USG');
    expect(callArgs.startDate).toEqual(start);
    expect(callArgs.endDate).toEqual(end);
    expect(callArgs.location).toBe('Klinika');
    expect(callArgs.notes).toContain('Dr X');
  });

  it('createExamEvent returns null when permissions denied', async () => {
    mockedCalendar.requestCalendarPermissionsAsync.mockResolvedValueOnce({
      status: 'denied', granted: false, canAskAgain: false, expires: 'never',
    } as never);
    const id = await createExamEvent({
      title: 'USG',
      start: new Date(),
      end: new Date(),
    });
    expect(id).toBeNull();
    expect(mockedCalendar.createEventAsync).not.toHaveBeenCalled();
  });

  it('createExamEvent returns null when createEventAsync throws', async () => {
    mockedCalendar.createEventAsync.mockRejectedValueOnce(new Error('boom'));
    const id = await createExamEvent({
      title: 'USG',
      start: new Date(),
      end: new Date(),
    });
    expect(id).toBeNull();
  });

  it('deleteExamEvent swallows "not found" errors', async () => {
    mockedCalendar.deleteEventAsync.mockRejectedValueOnce(new Error('not found'));
    await expect(deleteExamEvent('evt-missing')).resolves.toBeUndefined();
  });

  it('deleteExamEvent calls Calendar.deleteEventAsync with id', async () => {
    await deleteExamEvent('evt-123');
    expect(mockedCalendar.deleteEventAsync).toHaveBeenCalledWith('evt-123');
  });
});
