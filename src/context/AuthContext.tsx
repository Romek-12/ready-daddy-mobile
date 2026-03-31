import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, type Profile } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

const PROFILE_CACHE_KEY = '@ready_daddy/profile';

export interface User {
  id: string;
  email: string;
  conceptionDate: string;
  partnerName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirstLogin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, conceptionDate: string, partnerName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  clearFirstLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function profileToUser(profile: Profile): User {
  return {
    id: profile.id,
    email: profile.email,
    conceptionDate: profile.conception_date,
    partnerName: profile.partner_name,
  };
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return data as Profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    // Load existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Fire both in parallel — don't wait for Supabase before reading cache
        const cachePromise = AsyncStorage.getItem(PROFILE_CACHE_KEY).catch(() => null);
        const supabasePromise = fetchProfile(session.user.id);

        // Show cached profile the moment AsyncStorage responds (fast, local)
        const cached = await cachePromise;
        if (cached) {
          setUser(profileToUser(JSON.parse(cached) as Profile));
          setLoading(false);
        }

        // Apply fresh Supabase data when it arrives (Supabase was already fetching in parallel)
        const profile = await supabasePromise;
        if (profile) {
          setUser(profileToUser(profile));
          AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile)).catch(() => {});
        }
        if (!cached) setLoading(false);
      } else {
        setLoading(false);
      }
    });

    // Listen to auth state changes (token refresh, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (profile) setUser(profileToUser(profile));
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const profile = await fetchProfile(data.user.id);
    if (!profile) throw new Error('Profil nie znaleziony');
    setIsFirstLogin(false);
    setUser(profileToUser(profile));
  };

  const register = async (email: string, password: string, conceptionDate: string, partnerName?: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Rejestracja nie powiodła się');

    // Create profile row
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      conception_date: conceptionDate,
      partner_name: partnerName || '',
    });
    if (profileError) throw new Error(profileError.message);

    setIsFirstLogin(true);
    setUser({
      id: data.user.id,
      email,
      conceptionDate,
      partnerName: partnerName || '',
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    AsyncStorage.removeItem(PROFILE_CACHE_KEY).catch(() => {});
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      // Keep cache in sync
      AsyncStorage.getItem(PROFILE_CACHE_KEY).then(cached => {
        if (!cached) return;
        const profile: Profile = JSON.parse(cached);
        if (data.conceptionDate !== undefined) profile.conception_date = data.conceptionDate;
        if (data.partnerName !== undefined) profile.partner_name = data.partnerName;
        AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile)).catch(() => {});
      }).catch(() => {});
      return updated;
    });
  };

  const clearFirstLogin = () => setIsFirstLogin(false);

  return (
    <AuthContext.Provider value={{ user, loading, isFirstLogin, login, register, logout, updateUser, clearFirstLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
