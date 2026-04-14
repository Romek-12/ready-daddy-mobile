export interface DevelopmentMilestone {
  id: string;
  title: string;
  description: string;
  forDad: string; // co może robić tata
}

export interface VaccineInfo {
  name: string;
  description: string;
  when: string; // np. "2. miesiąc życia"
  mandatory: boolean;
}

export interface MonthContent {
  month: number; // 0 = noworodek, 1–12 = miesiące
  title: string; // np. "Miesiąc 1 — Nowy świat"
  babyDevelopment: string[]; // co potrafi dziecko
  dadRole: string[]; // rola taty w tym miesiącu
  milestones: DevelopmentMilestone[];
  vaccines: VaccineInfo[];
  tipOfMonth: string; // główna wskazówka
  emotionalNote: string; // emocjonalny kontekst
}

export interface VaccineScheduleEntry {
  name: string;
  doses: [string, ...string[]];   // at least one dose required
  description: string;
  mandatory: boolean;
}
