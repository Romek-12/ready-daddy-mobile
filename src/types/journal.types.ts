export type EntryType =
  | 'visit'      // wizyta lekarska
  | 'exam'       // badanie (krew, mocz, USG)
  | 'milestone'  // osiągnięcie (pierwszy ruch, usłyszenie serca)
  | 'note';      // zwykła notatka

export interface JournalEntry {
  id: string;
  type: EntryType;
  title: string;
  date: string;          // ISO date string (YYYY-MM-DD)
  week?: number;         // tydzień ciąży
  notes?: string;        // treść notatki
  photos?: string[];     // lokalne URI zdjęć
  linkedExamId?: string; // ID badania z roadmapy
  doctor?: string;       // imię/nazwisko lekarza
  location?: string;     // nazwa przychodni/szpitala
  reminder?: string;     // ISO datetime dla przypomnienia
  createdAt: string;
  updatedAt: string;
}

export interface JournalState {
  entries: JournalEntry[];
  lastUpdated: string;
}
