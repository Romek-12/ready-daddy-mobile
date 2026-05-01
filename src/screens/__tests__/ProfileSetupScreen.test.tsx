jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#0A0E1A',
        surface: '#141928',
        surfaceLight: '#1E2540',
        card: '#1E2540',
        cardBorder: 'rgba(255,255,255,0.05)',
        primary: '#00D9A6',
        danger: '#FF5C5C',
        text: '#FFFFFF',
        textSecondary: '#8B95B5',
        textMuted: '#5A6480',
        black: '#000000',
        white: '#FFFFFF',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
      fontSize: { xs: 11, sm: 13, md: 15, lg: 17, xl: 22, xxl: 28 },
      fontWeight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      borderRadius: { sm: 8, md: 12, lg: 16, xl: 28 },
      fonts: { title: 'System' },
    },
  }),
}));

jest.mock('../../lib/supabase', () => {
  const mockEq = jest.fn().mockResolvedValue({ error: null });
  const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
  const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });
  return { supabase: { from: mockFrom } };
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileSetupScreen from '../ProfileSetupScreen';
import { useAuth } from '../../context/AuthContext';

// Mock navigation
const mockNavigation = { navigate: jest.fn(), replace: jest.fn() };

const mockUpdateUser = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  jest.clearAllMocks();
  (useAuth as jest.Mock).mockReturnValue({
    user: { id: 'user-1', email: 'test@test.com', conceptionDate: null },
    updateUser: mockUpdateUser,
  });
});

describe('ProfileSetupScreen', () => {
  it('renders conception date input and submit button', () => {
    const { getByPlaceholderText, getByText } = render(
      <ProfileSetupScreen navigation={mockNavigation as any} route={{} as any} />
    );
    expect(getByPlaceholderText('RRRR-MM-DD')).toBeTruthy();
    expect(getByText('Dalej')).toBeTruthy();
  });

  it('shows validation error for invalid date format', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ProfileSetupScreen navigation={mockNavigation as any} route={{} as any} />
    );
    fireEvent.changeText(getByPlaceholderText('RRRR-MM-DD'), 'bad-date');
    fireEvent.press(getByText('Dalej'));
    await waitFor(() => {
      expect(getByText('Podaj datę w formacie RRRR-MM-DD')).toBeTruthy();
    });
  });

  it('submits valid form and calls updateUser', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ProfileSetupScreen navigation={mockNavigation as any} route={{} as any} />
    );
    fireEvent.changeText(getByPlaceholderText('RRRR-MM-DD'), '2025-06-15');
    fireEvent.press(getByText('Dalej'));
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        conceptionDate: '2025-06-15',
        partnerName: null,
      });
    });
  });

  it('accepts optional partner name', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ProfileSetupScreen navigation={mockNavigation as any} route={{} as any} />
    );
    fireEvent.changeText(getByPlaceholderText('RRRR-MM-DD'), '2025-06-15');
    fireEvent.changeText(getByPlaceholderText('np. Ania'), 'Marta');
    fireEvent.press(getByText('Dalej'));
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        conceptionDate: '2025-06-15',
        partnerName: 'Marta',
      });
    });
  });

  it('shows error message when Supabase update fails', async () => {
    const mockEq = jest.fn().mockResolvedValue({ error: { message: 'Błąd serwera' } });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    (require('../../lib/supabase').supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

    const { getByPlaceholderText, getByText } = render(
      <ProfileSetupScreen navigation={mockNavigation as any} route={{} as any} />
    );
    fireEvent.changeText(getByPlaceholderText('RRRR-MM-DD'), '2025-06-15');
    fireEvent.press(getByText('Dalej'));

    await waitFor(() => {
      expect(getByText('Błąd serwera')).toBeTruthy();
    });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });
});
