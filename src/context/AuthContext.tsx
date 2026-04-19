import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, type Profile } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { logError } from '../utils/logError';

const PROFILE_CACHE_KEY = '@ready_daddy/profile';

export interface User {
  id: string;
  email: string;
  conceptionDate: string;
  partnerName: string;
  babyName1?: string | null;
  babyName2?: string | null;
  babyGender?: 'boy' | 'girl' | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirstLogin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, conceptionDate: string, partnerName?: string, babyName1?: string, babyName2?: string) => Promise<void>;
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
    babyName1: profile.baby_name_1 || null,
    babyName2: profile.baby_name_2 || null,
    babyGender: profile.baby_gender || null,
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

export const getBabyDisplayName = (user: User | null): string => {
  if (!user) return 'maluszek';
  if (user.babyGender && user.babyName1) {
    return user.babyName1;
  }
  if (user.babyName1 && user.babyName2) {
    return `${user.babyName1} lub ${user.babyName2}`;
  }
  return user.babyName1 || 'maluszek';
};

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

        // Apply fresh Supabase data when it arrives
        const profile = await supabasePromise;
        if (profile) {
          setUser(profileToUser(profile));
          AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile)).catch((e) => logError('AuthContext:cacheWrite', e));
        }
        if (!cached) setLoading(false);
      } else {
        setLoading(false);
      }
    });

    // POPRAWKA: Ignorujemy TOKEN_REFRESHED — to zdarzenie strzelało co kilka minut
    // i nadpisywało lokalny stan danymi z Supabase, przez co zapis ustawień
    // (imię, płeć) wyglądał jakby przepadał (race condition).
    // Reagujemy wyłącznie na SIGNED_IN (nowe logowanie) i SIGNED_OUT.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (profile) {
            setUser(profileToUser(profile));
            AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile)).catch((e) => logError('AuthContext:cacheWrite', e));
          }
        }
        // TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY itp. — celowo pomijamy
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

  const register = async (email: string, password: string, conceptionDate: string, partnerName?: string, babyName1?: string, babyName2?: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Rejestracja nie powiodła się');

    // Create profile row
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      conception_date: conceptionDate,
      partner_name: partnerName || '',
      baby_name_1: babyName1 || null,
      baby_name_2: babyName2 || null,
    });
    if (profileError) throw new Error(profileError.message);

    setIsFirstLogin(true);
    setUser({
      id: data.user.id,
      email,
      conceptionDate,
      partnerName: partnerName || '',
      babyName1: babyName1 || null,
      babyName2: babyName2 || null,
      babyGender: null,
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    AsyncStorage.removeItem(PROFILE_CACHE_KEY).catch((e) => logError('AuthContext:cacheRemove', e));
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
        if (data.babyName1 !== undefined) profile.baby_name_1 = data.babyName1;
        if (data.babyName2 !== undefined) profile.baby_name_2 = data.babyName2;
        if (data.babyGender !== undefined) profile.baby_gender = data.babyGender;
        AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile)).catch((e) => logError('AuthContext:cacheUpdate', e));
      }).catch((e) => logError('AuthContext:cacheRead', e));
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
