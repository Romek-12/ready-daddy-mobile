import type { VaccineScheduleEntry } from '../types/first-year.types';

// This file is a comprehensive reference schedule for the full vaccination calendar.
// Per-month vaccines shown in the UI come from first-year-content.ts (MonthContent.vaccines[]).
// The 6w1 combo vaccine covers DTP+Hib+IPV+WZW B simultaneously — WZW B 3rd dose
// at month 6 is included in the 6w1 entry in first-year-content.ts.

/**
 * Polski Program Szczepień Ochronnych (PSO) — pierwszy rok życia.
 * Źródło: Rozporządzenie Ministra Zdrowia w sprawie obowiązkowych szczepień ochronnych.
 */
export const VACCINE_SCHEDULE: VaccineScheduleEntry[] = [
  {
    name: 'WZW B (Wirusowe Zapalenie Wątroby typu B)',
    doses: ['24h po porodzie', '1. miesiąc', '6. miesiąc'],
    description:
      'Chroni przed wirusowym zapaleniem wątroby typu B, które może prowadzić do marskości i raka wątroby. Pierwsza dawka podawana jest niemal natychmiast po urodzeniu.',
    mandatory: true,
  },
  {
    name: 'BCG (Gruźlica)',
    doses: ['W ciągu pierwszych dni życia'],
    description:
      'Szczepienie przeciw gruźlicy — jednorazowe, podawane śródskórnie w okolicę lewego ramienia. Chroni przede wszystkim przed ciężkimi postaciami gruźlicy u dzieci.',
    mandatory: true,
  },
  {
    name: 'DTP — Błonica, Tężec, Krztusiec',
    doses: ['2. miesiąc', '3–4. miesiąc', '6. miesiąc'],
    description:
      'Szczepionka skojarzona chroniąca przed trzema groźnymi chorobami bakteryjnymi. Krztusiec (koklusz) jest szczególnie niebezpieczny dla niemowląt — może być śmiertelny. Podawana w ramach szczepionki 6w1.',
    mandatory: true,
  },
  {
    name: 'Hib (Haemophilus influenzae typu b)',
    doses: ['2. miesiąc', '3–4. miesiąc', '6. miesiąc'],
    description:
      'Chroni przed zakażeniami bakterią Hib, które mogą powodować zapalenie opon mózgowych, zapalenie nagłośni i sepsę. Podawana w ramach szczepionki 6w1.',
    mandatory: true,
  },
  {
    name: 'IPV (Inaktywowana szczepionka przeciw polio)',
    doses: ['2. miesiąc', '3–4. miesiąc', '6. miesiąc'],
    description:
      'Chroni przed poliomyelitis (chorobą Heinego-Medina), która może powodować trwałe porażenia. Podawana w ramach szczepionki 6w1 lub osobno.',
    mandatory: true,
  },
  {
    name: 'PCV13 (Pneumokoki)',
    doses: ['2. miesiąc', '3–4. miesiąc', '6. miesiąc'],
    description:
      'Chroni przed zakażeniami pneumokokami — najczęstszą przyczyną bakteryjnego zapalenia płuc, opon mózgowych i sepsy u dzieci poniżej 2. roku życia.',
    mandatory: true,
  },
  {
    name: 'MMR (Odra, Świnka, Różyczka)',
    doses: ['13–15. miesiąc', '6. rok życia'],
    description:
      'Trójskładnikowa szczepionka chroniąca przed odrą, świnką i różyczką. Odra jest wysoce zakaźna i może prowadzić do ciężkich powikłań, w tym zapalenia mózgu. Pierwsza dawka zalecana po ukończeniu roku.',
    mandatory: true,
  },
  {
    name: 'Varicella (Ospa wietrzna)',
    doses: ['13–15. miesiąc'],
    description:
      'Chroni przed ospą wietrzną wywoływaną przez wirus VZV. Choroba może powodować nadkażenia bakteryjne, zapalenie płuc i mózgu. Od 2024 roku szczepionka jest obowiązkowa w PSO.',
    mandatory: true,
  },
  {
    name: 'Rotavirus (Rotawirusy)',
    doses: ['2. miesiąc', '3–4. miesiąc'],
    description:
      'Chroni przed rotawirusowym zapaleniem żołądka i jelit — najczęstszą przyczyną ciężkich biegunek u niemowląt wymagających hospitalizacji. Szczepionka doustna. Zalecana, ale nie obowiązkowa.',
    mandatory: false,
  },
  {
    name: 'WZW A (Wirusowe Zapalenie Wątroby typu A)',
    doses: ['12. miesiąc', '6–12 mies. po 1. dawce'],
    description:
      'Chroni przed wirusowym zapaleniem wątroby typu A przenoszonego drogą pokarmową. Zalecana szczególnie przed podróżami do krajów o wyższej zachorowalności.',
    mandatory: false,
  },
  {
    name: 'Meningokoki grupy B (MenB)',
    doses: ['2. miesiąc', '4. miesiąc', '12. miesiąc'],
    description:
      'Chroni przed inwazyjną chorobą meningokokową grupy B — najczęstszą przyczyną bakteryjnego zapalenia opon mózgowych u niemowląt. Szczepionka zalecana, choć nie obowiązkowa.',
    mandatory: false,
  },
  {
    name: 'Meningokoki grupy C/ACWY',
    doses: ['2. rok życia (lub wcześniej — wg wskazań)'],
    description:
      'Chroni przed zakażeniami meningokokami grupy C i innymi serotypami. Zalecana szczególnie w rejonach o podwyższonej zachorowalności.',
    mandatory: false,
  },
  {
    name: 'Grypa',
    doses: [
      'Od 6. miesiąca życia — co roku (przed sezonem jesienno-zimowym)',
    ],
    description:
      'Szczepionka przeciw grypie sezonowej. Zalecana niemowlętom powyżej 6. miesiąca — szczególnie tym z chorobami przewlekłymi. Skład aktualizowany każdego roku.',
    mandatory: false,
  },
];
