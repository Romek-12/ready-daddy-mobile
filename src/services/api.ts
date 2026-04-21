/**
 * Data service – static data from bundled JSON, user data from Supabase.
 */
import { supabase } from '../lib/supabase';
import { CONCEPTION_OFFSET_WEEKS, MAX_PREGNANCY_WEEK, TRIMESTER_BOUNDARIES } from '../constants';

export interface WeekData {
  week_number: number;
  trimester: number;
  fetus_size_mm: number;
  fetus_weight_g: number;
  fetus_size_comparison: string;
  fetus_size_comparison_animal?: string;
  fetus_size_comparison_sweet?: string;
  fetus_description: string;
  partner_physical: string;
  partner_emotional: string;
  partner_hormonal: string;
  partner_tips: string;
  dad_symptoms: string;
  dad_tips: string;
  notification?: string;
  weekly_notification?: string;
}

export interface ActionCard {
  id: string;
  weekRange: string;
  emoji: string;
  title: string;
  herSide: string[];
  do: string[];
  dont: string[];
  trimester: string;
  week_min: number;
  week_max: number;
}

export interface CheckupItem {
  id: number;
  week_number: number;
  name: string;
  description: string;
  what_it_means?: string;
  questions_to_ask?: string;
  is_mandatory?: number;
}

interface ShoppingItem {
  trimester: number;
  category: string;
  is_essential: number;
  estimated_cost_pln: number;
  [key: string]: unknown;
}

// Bundled static data (shipped with the app – no network needed)
import weeksData from '../data/weeks.json';
import actionCardsData from '../data/action-cards.json';
import checkupsData from '../data/checkups.json';
import checkupVisitsData from '../data/checkup-visits.json';
import shoppingItemsData from '../data/shopping-items.json';
import birthPrepData from '../data/birth-preparation.json';
import bagChecklistData from '../data/bag-checklist.json';
import fourthTrimesterData from '../data/fourth-trimester.json';
import dadModuleData from '../data/dad-module.json';

// ---------------------------------------------------------------------------
// Helper: parse "Tygodnie 4–12" / "Tygodnie 4-12" / "Tydzień 8" → [min, max]
// ---------------------------------------------------------------------------
function parseWeekRange(weekRange: string): { week_min: number; week_max: number } {
  const nums = weekRange.match(/\d+/g);
  if (!nums || nums.length === 0) return { week_min: 1, week_max: MAX_PREGNANCY_WEEK };
  const a = parseInt(nums[0], 10);
  const b = nums.length > 1 ? parseInt(nums[1], 10) : a;
  return { week_min: Math.min(a, b), week_max: Math.max(a, b) };
}

// Hydrate action cards once at module load with computed numeric week range.
const actionCards: ActionCard[] = (actionCardsData as Omit<ActionCard, 'week_min' | 'week_max'>[]).map(c => ({
  ...c,
  ...parseWeekRange(c.weekRange),
}));

// ---------------------------------------------------------------------------
// Helper: calculate current pregnancy week from conception date
// ---------------------------------------------------------------------------
function getCurrentWeek(conceptionDate: string): number {
  const conception = new Date(conceptionDate);
  const now = new Date();
  const diffMs = now.getTime() - conception.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.min(Math.max(diffWeeks + CONCEPTION_OFFSET_WEEKS, 1), MAX_PREGNANCY_WEEK);
}

// ---------------------------------------------------------------------------
// Public API – drop-in replacement for the old REST client
// ---------------------------------------------------------------------------
export const api = {
  // ---- User profile (Supabase) ----
  updateProfile: async (userId: string, data: { conceptionDate?: string; partnerName?: string; babyName1?: string | null; babyName2?: string | null; babyGender?: 'boy' | 'girl' | null }) => {
    const updates: Record<string, string | null | undefined> = {};
    if (data.conceptionDate !== undefined) updates.conception_date = data.conceptionDate;
    if (data.partnerName !== undefined) updates.partner_name = data.partnerName;
    if (data.babyName1 !== undefined) updates.baby_name_1 = data.babyName1;
    if (data.babyName2 !== undefined) updates.baby_name_2 = data.babyName2;
    if (data.babyGender !== undefined) updates.baby_gender = data.babyGender;
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw new Error(error.message);
  },

  forgotPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
  },

  // ---- Weeks (local computation + bundled data) ----
  getCurrentWeek: (conceptionDate: string) => {
    const currentWeek = getCurrentWeek(conceptionDate);
    const weekData = (weeksData as WeekData[]).find(w => w.week_number === currentWeek) || null;
    const cards = actionCards.filter(
      c => c.week_min <= currentWeek && c.week_max >= currentWeek
    );
    const totalWeeks = MAX_PREGNANCY_WEEK;
    const progress = Math.round((currentWeek / totalWeeks) * 100);
    const trimester = weekData
      ? weekData.trimester
      : currentWeek <= TRIMESTER_BOUNDARIES.first ? 1 : currentWeek <= TRIMESTER_BOUNDARIES.second ? 2 : 3;

    return { currentWeek, totalWeeks, progress, trimester, weekData, actionCards: cards };
  },

  getWeek: (weekNumber: number) => {
    const week = (weeksData as WeekData[]).find(w => w.week_number === weekNumber) || null;
    const cards = actionCards.filter(
      c => c.week_min <= weekNumber && c.week_max >= weekNumber
    );
    const checks = (checkupsData as CheckupItem[]).filter(c => c.week_number === weekNumber);
    return { week, actionCards: cards, checkups: checks };
  },

  getAllWeeks: (conceptionDate: string) => {
    const currentWeek = getCurrentWeek(conceptionDate);
    const weeks = (weeksData as WeekData[]).map(w => ({
      week_number: w.week_number,
      trimester: w.trimester,
      fetus_size_comparison: w.fetus_size_comparison,
      unlocked: w.week_number <= currentWeek,
    }));
    return { currentWeek, weeks };
  },

  // ---- Checkups (bundled) ----
  getCheckups: () => ({ checkups: checkupsData }),
  getCheckupVisits: () => ({ visits: checkupVisitsData }),

  // ---- Shopping (bundled) ----
  getShopping: () => {
    const items = shoppingItemsData as ShoppingItem[];
    const grouped: Record<number, ShoppingItem[]> = { 1: [], 2: [], 3: [] };
    items.forEach(item => {
      if (grouped[item.trimester]) grouped[item.trimester].push(item);
    });
    const totalCost = items.reduce((sum, i) => sum + (i.estimated_cost_pln || 0), 0);
    return { items: grouped, totalCost };
  },

  getCalculator: () => {
    const items = shoppingItemsData as ShoppingItem[];
    const essentialItems = items.filter(i => i.is_essential === 1);
    const essentialTotal = essentialItems.reduce((sum, i) => sum + (i.estimated_cost_pln || 0), 0);
    const fullTotal = items.reduce((sum, i) => sum + (i.estimated_cost_pln || 0), 0);
    const monthlyCosts = { pieluchy: 200, mleko_lub_jedzenie: 150, kosmetyki: 80, ubranka: 100, lekarz: 100 };
    const monthlyTotal = Object.values(monthlyCosts).reduce((a, b) => a + b, 0);
    return {
      oneTimeCosts: { essential: essentialTotal, full: fullTotal, savings: fullTotal - essentialTotal },
      monthlyCosts,
      monthlyTotal,
      firstYearEstimate: essentialTotal + monthlyTotal * 12,
    };
  },

  // ---- Birth (bundled) ----
  getBirthPreparation: () => ({ stages: birthPrepData }),
  getBagChecklist: () => ({ items: bagChecklistData }),

  // ---- Fourth trimester (bundled) ----
  getFourthTrimester: () => ({ weeks: fourthTrimesterData }),

  // ---- Action cards (bundled) ----
  getActionCardsDeck: () => ({ cards: actionCards }),

  // ---- Dad module (bundled) ----
  getDadModule: () => dadModuleData,
};
