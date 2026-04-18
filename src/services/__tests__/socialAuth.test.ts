jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getTokens: jest.fn(),
  },
}));

jest.mock('react-native-fbsdk-next', () => ({
  LoginManager: {
    logInWithPermissions: jest.fn(),
    logOut: jest.fn(),
  },
  AccessToken: {
    getCurrentAccessToken: jest.fn(),
  },
}));

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { getGoogleIdToken, getGoogleTokens, getFacebookAccessToken } from '../socialAuth';

describe('getGoogleIdToken', () => {
  it('returns idToken on successful sign in', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      data: { idToken: 'mock-google-token' },
    });
    const token = await getGoogleIdToken();
    expect(token).toBe('mock-google-token');
  });

  it('throws when sign in returns no idToken', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({ data: { idToken: null } });
    await expect(getGoogleIdToken()).rejects.toThrow('Brak tokenu Google');
  });

  it('propagates sign in error', async () => {
    (GoogleSignin.signIn as jest.Mock).mockRejectedValue(new Error('Anulowano'));
    await expect(getGoogleIdToken()).rejects.toThrow('Anulowano');
  });
});

describe('getGoogleTokens', () => {
  it('returns both idToken and accessToken after sign in', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({ data: { idToken: 'id-tok' } });
    (GoogleSignin.getTokens as jest.Mock).mockResolvedValue({
      idToken: 'id-tok',
      accessToken: 'acc-tok',
    });
    const tokens = await getGoogleTokens();
    expect(tokens.idToken).toBe('id-tok');
    expect(tokens.accessToken).toBe('acc-tok');
  });

  it('throws when getTokens returns no idToken', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({ data: { idToken: 'id-tok' } });
    (GoogleSignin.getTokens as jest.Mock).mockResolvedValue({ idToken: null, accessToken: 'acc' });
    await expect(getGoogleTokens()).rejects.toThrow('Brak tokenu Google');
  });
});

describe('getFacebookAccessToken', () => {
  it('returns access token on successful login', async () => {
    (LoginManager.logInWithPermissions as jest.Mock).mockResolvedValue({ isCancelled: false });
    (AccessToken.getCurrentAccessToken as jest.Mock).mockResolvedValue({
      accessToken: 'mock-fb-token',
    });
    const token = await getFacebookAccessToken();
    expect(token).toBe('mock-fb-token');
  });

  it('returns null when user cancels', async () => {
    (LoginManager.logInWithPermissions as jest.Mock).mockResolvedValue({ isCancelled: true });
    const token = await getFacebookAccessToken();
    expect(token).toBeNull();
  });

  it('throws when no access token after login', async () => {
    (LoginManager.logInWithPermissions as jest.Mock).mockResolvedValue({ isCancelled: false });
    (AccessToken.getCurrentAccessToken as jest.Mock).mockResolvedValue(null);
    await expect(getFacebookAccessToken()).rejects.toThrow('Brak tokenu Facebook');
  });
});
