import type { NotificationTemplate } from '../types/notifications.types';

// Szablony dla kluczowych tygodni ciąży
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // Tydzień 8 — pierwsze bicie serca
  {
    week: 8,
    daysBefore: 3,
    title: '⏳ Za 3 dni: Tydzień 8',
    body: 'Niedługo tydzień 8 — serce maluszka bije już ok. 160 razy na minutę!',
  },
  {
    week: 8,
    daysBefore: 0,
    title: '❤️ Tydzień 8 — bicie serca!',
    body: 'Serce Waszego dziecka pracuje pełną parą. Czas na pierwsze USG, jeśli jeszcze nie było.',
  },
  // Tydzień 12 — koniec I trymestru + badania
  {
    week: 12,
    daysBefore: 3,
    title: '⏳ Za 3 dni: Tydzień 12',
    body: 'Zbliża się koniec I trymestru! USG genetyczne i badania prenatalne to teraz priorytet.',
  },
  {
    week: 12,
    daysBefore: 0,
    title: '🎉 Tydzień 12 — koniec I trymestru!',
    body: 'Największe ryzyko za wami. Czas poinformować rodzinę i zaplanować badania prenatalne.',
  },
  // Tydzień 13 — II trymestr
  {
    week: 13,
    daysBefore: 3,
    title: '⏳ Za 3 dni: Tydzień 13',
    body: 'Drugi trymestr tuż tuż — "złoty okres" ciąży dla partnerki.',
  },
  {
    week: 13,
    daysBefore: 0,
    title: '✨ Tydzień 13 — II trymestr!',
    body: 'Zaczyna się drugi trymestr. Partnerka może poczuć się znacznie lepiej. Czas na aktywność razem!',
  },
  // Tydzień 16 — pierwsze ruchy
  {
    week: 16,
    daysBefore: 3,
    title: '⏳ Za 3 dni: Tydzień 16',
    body: 'Niedługo możliwe pierwsze ruchy! Partnerka może zacząć czuć delikatne poruszenia.',
  },
  {
    week: 16,
    daysBefore: 0,
    title: '👶 Tydzień 16 — może poczuć ruchy!',
    body: 'Maluszek kopie i obraca się. Partnerka może wkrótce poczuć pierwsze poruszenia — bądź przy niej.',
  },
  // Tydzień 20 — USG połówkowe
  {
    week: 20,
    daysBefore: 3,
    title: '📅 Za 3 dni: Tydzień 20',
    body: 'Zbliża się przełomowy moment — USG połówkowe. Czy macie już umówiony termin?',
  },
  {
    week: 20,
    daysBefore: 0,
    title: '🔬 Tydzień 20 — USG połówkowe!',
    body: 'To najważniejsze badanie prenatalne. Jedź razem z partnerką i przygotuj pytania do lekarza.',
  },
  // Tydzień 24 — wizyta kontrolna
  {
    week: 24,
    daysBefore: 3,
    title: '⏳ Za 3 dni: Tydzień 24',
    body: 'Tydzień 24 to czas na badanie poziomu cukru (test obciążenia glukozą).',
  },
  {
    week: 24,
    daysBefore: 0,
    title: '🩺 Tydzień 24 — test cukrzycy ciążowej',
    body: 'Partnerka powinna mieć skierowanie na test obciążenia glukozą. Umów wizytę jeśli jeszcze nie ma.',
  },
  // Tydzień 28 — III trymestr
  {
    week: 28,
    daysBefore: 3,
    title: '⏳ Za 3 dni: Tydzień 28',
    body: 'Za 3 dni zaczyna się III trymestr — czas przyspieszyć przygotowania!',
  },
  {
    week: 28,
    daysBefore: 0,
    title: '🚀 Tydzień 28 — III trymestr!',
    body: 'Ostatnia prosta! Czas zapisać się na szkołę rodzenia, skompletować torbę do szpitala.',
  },
  // Tydzień 32 — szkoła rodzenia
  {
    week: 32,
    daysBefore: 3,
    title: '⏳ Za 3 dni: Tydzień 32',
    body: 'Tydzień 32 — ostatni dzwonek na szkołę rodzenia i wybór szpitala.',
  },
  {
    week: 32,
    daysBefore: 0,
    title: '🏥 Tydzień 32 — wybierz szpital!',
    body: 'Czas wybrać szpital, odwiedzić izbę przyjęć i zaplanować trasę na poród.',
  },
  // Tydzień 36 — torba do szpitala
  {
    week: 36,
    daysBefore: 3,
    title: '⏳ Za 3 dni: Tydzień 36',
    body: 'Torba do szpitala powinna być gotowa! Sprawdź listę w aplikacji.',
  },
  {
    week: 36,
    daysBefore: 0,
    title: '🎒 Tydzień 36 — torba gotowa?',
    body: 'Od teraz maluszek może przyjść o każdej porze. Sprawdź czy masz wszystko spakowane.',
  },
  // Tydzień 38 — gotowość
  {
    week: 38,
    daysBefore: 3,
    title: '⏳ Za 3 dni: Tydzień 38',
    body: 'Tydzień 38 — dziecko jest już w pełni gotowe do życia poza brzuchem.',
  },
  {
    week: 38,
    daysBefore: 0,
    title: '⚡ Tydzień 38 — lada moment!',
    body: 'Bądź w zasięgu telefonu i z naładowanym autem. Możesz zostać tatą każdej chwili!',
  },
  // Tydzień 40 — termin porodu
  {
    week: 40,
    daysBefore: 3,
    title: '⏳ Za 3 dni: Termin porodu!',
    body: 'Obliczony termin porodu zbliża się. Bądź gotowy na każde wezwanie.',
  },
  {
    week: 40,
    daysBefore: 0,
    title: '🎊 Tydzień 40 — Termin porodu!',
    body: 'Dziś obliczony termin! Pamiętaj: to tylko data orientacyjna. Bądź spokojny i gotowy.',
  },
];

// Fallback — generyczny szablon dla tygodnia bez specjalnego eventu
export function getGenericTemplate(week: number, daysBefore: number): NotificationTemplate {
  if (daysBefore === 3) {
    return {
      week,
      daysBefore: 3,
      title: `⏳ Za 3 dni: Tydzień ${week}`,
      body: `Już niedługo nowy tydzień ciąży. Sprawdź co czeka Ciebie i partnerkę.`,
    };
  }
  return {
    week,
    daysBefore: 0,
    title: `👶 Tydzień ${week} — nowy rozdział!`,
    body: `Zaczął się tydzień ${week}. Otwórz aplikację i zobacz co dzieje się z Waszym dzieckiem.`,
  };
}
