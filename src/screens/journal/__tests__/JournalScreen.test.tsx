import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import JournalScreen from '../JournalScreen';
import { ThemeProvider } from '../../../context/ThemeContext';
import * as useJournalHook from '../../../hooks/useJournal';
import * as AuthContext from '../../../context/AuthContext';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('../../../lib/supabase', () => ({ supabase: {} }));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: (cb: () => void) => { cb(); },
}));
jest.mock('../../../services/socialAuth', () => ({
  configureGoogleSignIn: jest.fn(),
  getGoogleIdToken: jest.fn(),
  getGoogleTokens: jest.fn(),
  getFacebookAccessToken: jest.fn(),
}));
jest.mock('../../../services/calendar/CalendarService');
jest.mock('../../../services/journal/JournalService');

const navigation = { navigate: jest.fn() } as never;
const route = { key: 'k', name: 'JournalMain', params: undefined } as never;

const wrap = (ui: React.ReactElement) => <ThemeProvider>{ui}</ThemeProvider>;

beforeEach(() => {
  AsyncStorage.clear();
  jest.clearAllMocks();
  jest.spyOn(useJournalHook, 'useJournal').mockReturnValue({
    entries: [],
    loading: false,
    reload: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as never);
  jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
    user: { id: 'u1', email: 't@t.t', conceptionDate: '2026-01-01', partnerName: null, babyName1: null, babyName2: null, babyGender: null },
    loading: false,
  } as never);
});

describe('JournalScreen view toggle', () => {
  it('defaults to list view', async () => {
    const { getByText, queryByLabelText } = render(wrap(<JournalScreen navigation={navigation} route={route} />));
    expect(getByText('Wszystkie')).toBeTruthy();
    expect(queryByLabelText('Następny miesiąc')).toBeNull();
  });

  it('switches to calendar view when "Kalendarz" toggle pressed', async () => {
    const { getByText, getByLabelText } = render(wrap(<JournalScreen navigation={navigation} route={route} />));
    fireEvent.press(getByText('Kalendarz'));
    await waitFor(() => expect(getByLabelText('Następny miesiąc')).toBeTruthy());
  });

  it('persists toggle across remount via AsyncStorage', async () => {
    const { getByText, unmount } = render(wrap(<JournalScreen navigation={navigation} route={route} />));
    fireEvent.press(getByText('Kalendarz'));
    await waitFor(() => expect(AsyncStorage.getItem('journal_view_mode')).resolves.toBe('calendar'));
    unmount();

    const { getByLabelText } = render(wrap(<JournalScreen navigation={navigation} route={route} />));
    await waitFor(() => expect(getByLabelText('Następny miesiąc')).toBeTruthy());
  });
});
