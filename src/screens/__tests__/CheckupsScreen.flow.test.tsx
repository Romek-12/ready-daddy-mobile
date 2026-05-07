import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckupsScreen from '../CheckupsScreen';
import { ThemeProvider } from '../../context/ThemeContext';
import * as CalendarService from '../../services/calendar/CalendarService';
import * as JournalService from '../../services/journal/JournalService';
import * as useAppData from '../../hooks/useAppData';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('../../lib/supabase', () => ({ supabase: {} }));
jest.mock('../../services/calendar/CalendarService');
jest.mock('../../services/journal/JournalService');

const mockedCalendar = CalendarService as jest.Mocked<typeof CalendarService>;
const mockedJournal = JournalService as jest.Mocked<typeof JournalService>;

const FAKE_VISITS = {
  visits: [{
    id: 1, weekRange: '12 tc', title: 'Wizyta 1', subtitle: '', colorKey: 'primary',
    categories: [{
      id: 1, title: 'Badania', icon: 'lab', colorKey: 'primary',
      items: [{ id: 1, name: 'USG genetyczne' }],
    }],
  }],
};

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  jest.spyOn(useAppData, 'useCheckupVisits').mockReturnValue({ data: FAKE_VISITS } as never);
  mockedCalendar.createExamEvent.mockResolvedValue('evt-1');
  mockedCalendar.deleteExamEvent.mockResolvedValue(undefined);
  mockedJournal.addEntry.mockResolvedValue({ id: 'j-1' } as never);
});

afterEach(() => {
  jest.restoreAllMocks();
});

const wrap = (ui: React.ReactElement) => <ThemeProvider>{ui}</ThemeProvider>;

describe('CheckupsScreen flow', () => {
  it('clicking unchecked item shows "add to calendar?" dialog', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText, getByLabelText } = render(wrap(<CheckupsScreen />));
    fireEvent.press(getByText('Wizyta 1'));
    await waitFor(() => getByLabelText('USG genetyczne'));
    fireEvent.press(getByLabelText('USG genetyczne'));
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringMatching(/kalendarz/i),
      expect.any(String),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Tak' }),
        expect.objectContaining({ text: 'Nie' }),
      ]),
    );
  });

  it('"Nie" → checks item without opening sheet or creating entries', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText, getByLabelText } = render(wrap(<CheckupsScreen />));
    fireEvent.press(getByText('Wizyta 1'));
    await waitFor(() => getByLabelText('USG genetyczne'));
    fireEvent.press(getByLabelText('USG genetyczne'));
    const buttons = alertSpy.mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>;
    const nieBtn = buttons.find(b => b.text === 'Nie');
    nieBtn?.onPress?.();
    await waitFor(() => {
      expect(getByLabelText('USG genetyczne').props.accessibilityState.checked).toBe(true);
    });
    expect(mockedCalendar.createExamEvent).not.toHaveBeenCalled();
    expect(mockedJournal.addEntry).not.toHaveBeenCalled();
  });

  it('"Tak" → opens AddExamSheet; "Zapisz" creates event + journal entry', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText, getByLabelText } = render(wrap(<CheckupsScreen />));
    fireEvent.press(getByText('Wizyta 1'));
    await waitFor(() => getByLabelText('USG genetyczne'));
    fireEvent.press(getByLabelText('USG genetyczne'));
    const buttons = alertSpy.mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>;
    buttons.find(b => b.text === 'Tak')?.onPress?.();
    await waitFor(() => getByText('Dodaj badanie'));
    fireEvent.press(getByText('Zapisz'));
    await waitFor(() => expect(mockedCalendar.createExamEvent).toHaveBeenCalled());
    expect(mockedJournal.addEntry).toHaveBeenCalledWith(expect.objectContaining({
      type: 'exam',
      title: 'USG genetyczne',
      linkedExamId: expect.stringContaining('checkup-v0'),
    }));
  });

  it('clicking checked item with calendar meta shows "remove from calendar?" dialog', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText, getByLabelText } = render(wrap(<CheckupsScreen />));
    fireEvent.press(getByText('Wizyta 1'));
    await waitFor(() => getByLabelText('USG genetyczne'));
    // First check + save → meta is set
    fireEvent.press(getByLabelText('USG genetyczne'));
    const addButtons = alertSpy.mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>;
    addButtons.find(b => b.text === 'Tak')?.onPress?.();
    await waitFor(() => getByText('Dodaj badanie'));
    fireEvent.press(getByText('Zapisz'));
    await waitFor(() => expect(mockedCalendar.createExamEvent).toHaveBeenCalled());

    alertSpy.mockClear();
    // Now click again (checked) — should ask about calendar removal
    fireEvent.press(getByLabelText('USG genetyczne'));
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringMatching(/usun|usunąć/i),
      expect.any(String),
      expect.any(Array),
    );
    const removeButtons = alertSpy.mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>;
    removeButtons.find(b => b.text === 'Tak')?.onPress?.();
    await waitFor(() => expect(mockedCalendar.deleteExamEvent).toHaveBeenCalledWith('evt-1'));
  });

  it('clicking checked item without calendar meta unchecks immediately, no dialog', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText, getByLabelText } = render(wrap(<CheckupsScreen />));
    fireEvent.press(getByText('Wizyta 1'));
    await waitFor(() => getByLabelText('USG genetyczne'));
    // Check via "Nie" path — no calendar meta
    fireEvent.press(getByLabelText('USG genetyczne'));
    const buttons = alertSpy.mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>;
    buttons.find(b => b.text === 'Nie')?.onPress?.();
    await waitFor(() => {
      expect(getByLabelText('USG genetyczne').props.accessibilityState.checked).toBe(true);
    });

    alertSpy.mockClear();
    fireEvent.press(getByLabelText('USG genetyczne'));
    expect(alertSpy).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(getByLabelText('USG genetyczne').props.accessibilityState.checked).toBe(false);
    });
  });
});
