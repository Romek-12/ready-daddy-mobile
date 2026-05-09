const mockSignInWithGoogle = jest.fn();
const mockSignInWithFacebook = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    signInWithGoogle: mockSignInWithGoogle,
    signInWithFacebook: mockSignInWithFacebook,
  })),
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    theme: {
      colors: { cardBorder: '#e0e0e0', textSecondary: '#888', surface: '#fff', text: '#000' },
      spacing: { sm: 8, md: 16, xs: 4 },
      fontSize: { sm: 12, md: 16 },
      borderRadius: { sm: 8, md: 12, lg: 16, xl: 28, xxl: 32, full: 9999 },
    },
  })),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SocialAuthButtons from '../SocialAuthButtons';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SocialAuthButtons', () => {
  it('renders Google and Facebook buttons', () => {
    const { getByText } = render(<SocialAuthButtons />);
    expect(getByText('Kontynuuj z Google')).toBeTruthy();
    expect(getByText('Kontynuuj z Facebook')).toBeTruthy();
  });

  it('calls signInWithGoogle on Google button press', async () => {
    mockSignInWithGoogle.mockResolvedValue(undefined);
    const { getByText } = render(<SocialAuthButtons />);
    fireEvent.press(getByText('Kontynuuj z Google'));
    await waitFor(() => expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1));
  });

  it('calls signInWithFacebook on Facebook button press', async () => {
    mockSignInWithFacebook.mockResolvedValue(undefined);
    const { getByText } = render(<SocialAuthButtons />);
    fireEvent.press(getByText('Kontynuuj z Facebook'));
    await waitFor(() => expect(mockSignInWithFacebook).toHaveBeenCalledTimes(1));
  });

  it('shows error alert when Google sign-in throws', async () => {
    jest.spyOn(Alert, 'alert');
    mockSignInWithGoogle.mockRejectedValue(new Error('Sieć niedostępna'));
    const { getByText } = render(<SocialAuthButtons />);
    fireEvent.press(getByText('Kontynuuj z Google'));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Błąd logowania', 'Sieć niedostępna')
    );
  });

  it('does not show error alert when Facebook login is cancelled (null token)', async () => {
    jest.spyOn(Alert, 'alert');
    mockSignInWithFacebook.mockResolvedValue(undefined); // no throw = user cancelled
    const { getByText } = render(<SocialAuthButtons />);
    fireEvent.press(getByText('Kontynuuj z Facebook'));
    await waitFor(() => expect(mockSignInWithFacebook).toHaveBeenCalled());
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});
