import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Profile = {
  id: string;
  email: string;
  conception_date: string;
  partner_name: string;
  baby_name_1?: string | null;
  baby_name_2?: string | null;
  baby_gender?: 'boy' | 'girl' | null;
  created_at: string;
};
