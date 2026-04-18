jest.mock('../../services/socialAuth', () => ({
  configureGoogleSignIn: jest.fn(),
  getGoogleIdToken: jest.fn(),
  getGoogleTokens: jest.fn(),
  getFacebookAccessToken: jest.fn(),
  signOutGoogle: jest.fn().mockResolvedValue(undefined),
  signOutFacebook: jest.fn(),
}));

const mockInsert = jest.fn().mockResolvedValue({ error: null });
const mockSingle = jest.fn();
const mockEq = jest.fn().mockReturnThis();
const mockSelect = jest.fn().mockReturnThis();
const mockFrom = jest.fn(() => ({
  select: mockSelect,
  eq: mockEq,
  single: mockSingle,
  insert: mockInsert,
}));

const mockSignInWithIdToken = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue({ error: null });
const mockGetSession = jest.fn().mockResolvedValue({ data: { session: null } });
const mockOnAuthStateChange = jest.fn(() => ({
  data: { subscription: { unsubscribe: jest.fn() } },
}));
const mockLinkIdentity = jest.fn();

jest.mock('../../lib/supabase', () => {
  const mockAuth = {
    get signInWithIdToken() { return mockSignInWithIdToken; },
    get signOut() { return mockSignOut; },
    get getSession() { return mockGetSession; },
    get onAuthStateChange() { return mockOnAuthStateChange; },
    get linkIdentity() { return mockLinkIdentity; },
  };
  return {
    supabase: {
      get auth() { return mockAuth; },
      get from() { return mockFrom; },
    },
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../../utils/logError', () => ({ logError: jest.fn() }));

jest.mock('../../config/env', () => ({ GOOGLE_WEB_CLIENT_ID: 'test-web-client-id' }));

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import { getGoogleIdToken, getGoogleTokens, getFacebookAccessToken } from '../../services/socialAuth';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const mockProfile = {
  id: 'user-1',
  email: 'test@test.com',
  conception_date: '2025-01-01',
  partner_name: 'Anna',
  baby_name_1: null,
  baby_name_2: null,
  baby_gender: null,
  created_at: '2025-01-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSession.mockResolvedValue({ data: { session: null } });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  });
  mockSignInWithIdToken.mockResolvedValue({
    data: { user: { id: 'user-1', email: 'test@test.com' } },
    error: null,
  });
});

describe('signInWithGoogle', () => {
  it('calls signInWithIdToken with google provider and token', async () => {
    (getGoogleIdToken as jest.Mock).mockResolvedValue('google-token');
    mockSingle.mockResolvedValue({ data: mockProfile, error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockSignInWithIdToken).toHaveBeenCalledWith({
      provider: 'google',
      token: 'google-token',
    });
  });

  it('creates minimal profile and sets isFirstLogin for new social user', async () => {
    (getGoogleIdToken as jest.Mock).mockResolvedValue('google-token');
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.user?.conceptionDate).toBeNull();
    expect(result.current.isFirstLogin).toBe(true);
  });

  it('throws when getGoogleIdToken throws', async () => {
    (getGoogleIdToken as jest.Mock).mockRejectedValue(new Error('Anulowano'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(
      act(async () => { await result.current.signInWithGoogle(); })
    ).rejects.toThrow('Anulowano');
  });
});

describe('signInWithFacebook', () => {
  it('calls signInWithIdToken with facebook provider and token', async () => {
    (getFacebookAccessToken as jest.Mock).mockResolvedValue('fb-token');
    mockSingle.mockResolvedValue({ data: mockProfile, error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signInWithFacebook();
    });

    expect(mockSignInWithIdToken).toHaveBeenCalledWith({
      provider: 'facebook',
      token: 'fb-token',
    });
  });

  it('does nothing when user cancels Facebook login', async () => {
    (getFacebookAccessToken as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signInWithFacebook();
    });

    expect(mockSignInWithIdToken).not.toHaveBeenCalled();
  });
});

describe('linkGoogleAccount', () => {
  it('calls linkIdentity with google provider, idToken and accessToken', async () => {
    (getGoogleTokens as jest.Mock).mockResolvedValue({ idToken: 'g-id', accessToken: 'g-acc' });
    mockLinkIdentity.mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.linkGoogleAccount();
    });

    expect(mockLinkIdentity).toHaveBeenCalledWith({
      provider: 'google',
      token: 'g-id',
      access_token: 'g-acc',
    });
  });

  it('throws when linkIdentity returns error', async () => {
    (getGoogleTokens as jest.Mock).mockResolvedValue({ idToken: 'g-id', accessToken: 'g-acc' });
    mockLinkIdentity.mockResolvedValue({ data: {}, error: { message: 'Identity already linked' } });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(
      act(async () => { await result.current.linkGoogleAccount(); })
    ).rejects.toThrow('Identity already linked');
  });
});

describe('linkFacebookAccount', () => {
  it('calls linkIdentity with facebook provider and access token', async () => {
    (getFacebookAccessToken as jest.Mock).mockResolvedValue('fb-acc');
    mockLinkIdentity.mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.linkFacebookAccount();
    });

    expect(mockLinkIdentity).toHaveBeenCalledWith({
      provider: 'facebook',
      token: 'fb-acc',
    });
  });

  it('does nothing when user cancels Facebook', async () => {
    (getFacebookAccessToken as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.linkFacebookAccount();
    });

    expect(mockLinkIdentity).not.toHaveBeenCalled();
  });
});
