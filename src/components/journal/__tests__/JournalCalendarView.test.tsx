import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import JournalCalendarView from '../JournalCalendarView';
import { ThemeProvider } from '../../../context/ThemeContext';
import * as useJournalHook from '../../../hooks/useJournal';
import * as AuthContext from '../../../context/AuthContext';
import * as CalendarService from '../../../services/calendar/CalendarService';
import * as JournalService from '../../../services/journal/JournalService';
import type { JournalEntry } from '../../../types/journal.types';

jest.mock('../../../lib/supabase', () => ({ supabase: {} }));
jest.mock('../../../services/socialAuth', () => ({
  configureGoogleSignIn: jest.fn(),
  getGoogleIdToken: jest.fn(),
  getGoogleTokens: jest.fn(),
  getFacebookAccessToken: jest.fn(),
}));
jest.mock('../../../services/calendar/CalendarService');
jest.mock('../../../services/journal/JournalService');

const wrap = (ui: React.ReactElement) => <ThemeProvider>{ui}</ThemeProvider>;

const mockEntry = (overrides: Partial<JournalEntry>): JournalEntry => ({
  id: 'e1',
  type: 'exam',
  title: 'USG',
  date: '2026-05-07',
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
  ...overrides,
});

const reload = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(useJournalHook, 'useJournal').mockReturnValue({
    entries: [mockEntry({ id: 'e1', date: '2026-05-07', title: 'USG' })],
    loading: false,
    reload,
    add: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as never);
  jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
    user: { id: 'u1', email: 't@t.t', conceptionDate: '2026-01-01', partnerName: null, babyName1: null, babyName2: null, babyGender: null },
    loading: false,
  } as never);
  (CalendarService.createExamEvent as jest.Mock).mockResolvedValue('evt-1');
  (JournalService.addEntry as jest.Mock).mockResolvedValue(mockEntry({ id: 'e2' }));
});

describe('JournalCalendarView', () => {
  it('renders the current month by default', () => {
    const now = new Date();
    const monthName = now.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    const { getByText } = render(wrap(<JournalCalendarView />));
    expect(getByText(new RegExp(monthName, 'i'))).toBeTruthy();
  });

  it('navigates to next month when ▶ pressed', () => {
    const { getByLabelText, getByText } = render(wrap(<JournalCalendarView />));
    fireEvent.press(getByLabelText('Następny miesiąc'));
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    const monthName = next.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    expect(getByText(new RegExp(monthName, 'i'))).toBeTruthy();
  });

  it('navigates to previous month when ◀ pressed', () => {
    const { getByLabelText, getByText } = render(wrap(<JournalCalendarView />));
    fireEvent.press(getByLabelText('Poprzedni miesiąc'));
    const prev = new Date();
    prev.setMonth(prev.getMonth() - 1);
    const monthName = prev.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    expect(getByText(new RegExp(monthName, 'i'))).toBeTruthy();
  });

  it('shows entries for the selected day in the inline expansion', () => {
    const { getByTestId, getByText } = render(wrap(<JournalCalendarView initialMonthDate={new Date(2026, 4, 1)} initialSelectedDate={new Date(2026, 4, 7)} />));
    expect(getByTestId('day-cell-2026-05-07')).toBeTruthy();
    expect(getByText('USG')).toBeTruthy();
  });

  it('opens AddExamSheet with prefilled date when "Dodaj wizytę" pressed', () => {
    const { getByText } = render(wrap(<JournalCalendarView initialMonthDate={new Date(2026, 4, 1)} initialSelectedDate={new Date(2026, 4, 15)} />));
    fireEvent.press(getByText('+ Dodaj wizytę'));
    // Sheet renders header
    expect(getByText('Dodaj badanie')).toBeTruthy();
  });

  it('on sheet submit creates exam event + journal entry and reloads', async () => {
    const { getByText, getByPlaceholderText } = render(wrap(<JournalCalendarView initialMonthDate={new Date(2026, 4, 1)} initialSelectedDate={new Date(2026, 4, 15)} />));
    fireEvent.press(getByText('+ Dodaj wizytę'));
    fireEvent.changeText(getByPlaceholderText('Nazwa badania'), 'Morfologia');
    fireEvent.press(getByText('Zapisz'));
    await waitFor(() => expect(CalendarService.createExamEvent).toHaveBeenCalled());
    expect(JournalService.addEntry).toHaveBeenCalledWith(expect.objectContaining({
      type: 'exam',
      title: 'Morfologia',
      date: '2026-05-15',
    }));
    await waitFor(() => expect(reload).toHaveBeenCalled());
  });
});
