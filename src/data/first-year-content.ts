import type { MonthContent } from '../types/first-year.types';

// UI-facing monthly content. Vaccines listed here are the key vaccines per month shown to users.
// For the complete vaccination reference schedule, see first-year-vaccines.ts.
// Note: WZW B 3rd dose at month 6 is part of the 6w1 combination vaccine.

export const FIRST_YEAR_CONTENT: MonthContent[] = [
  {
    month: 0,
    title: 'Noworodek — Pierwsze Dni',
    babyDevelopment: [
      'Reaguje na głos rodziców — słyszy Cię od 18. tygodnia ciąży',
      'Widzi twarze z odległości ~25 cm',
      'Śpi 16–18 godzin dziennie w cyklach 2–4h',
    ],
    dadRole: [
      'Kontakt skóra-do-skóry (kangurowanie) reguluje temperaturę i bicie serca dziecka',
      'Przejąć kąpiele i przewijanie — to Twój czas na bonding',
      'Chronić partnerkę przed niechcianymi gośćmi',
    ],
    milestones: [
      {
        id: 'm0_grip',
        title: 'Odruch chwytny',
        description: 'Zaciśnie piąstkę na Twoim palcu — odruch bezwarunkowy.',
        forDad: 'Włóż palec w dłoń dziecka i poczekaj.',
      },
    ],
    vaccines: [
      {
        name: 'WZW B (1. dawka)',
        description: 'Wirusowe zapalenie wątroby typu B',
        when: 'W ciągu 24h po porodzie',
        mandatory: true,
      },
      {
        name: 'BCG (gruźlica)',
        description: 'Szczepienie przeciw gruźlicy',
        when: 'W ciągu pierwszych dni',
        mandatory: true,
      },
    ],
    tipOfMonth:
      'Nie musisz robić wszystkiego perfekcyjnie. Musisz być obecny.',
    emotionalNote:
      'Baby blues u mam to norma (do 2 tyg.). Depresja poporodowa u ojców występuje u ok. 10% — mów o tym głośno.',
  },
  {
    month: 1,
    title: 'Miesiąc 1 — Budzenie Się',
    babyDevelopment: [
      'Zaczyna śledzić twarze wzrokiem',
      'Pierwsze dźwięki poza płaczem — gruchanie',
      'Rozróżnia zapach mamy',
    ],
    dadRole: [
      'Stwórz swój rytuał — np. wieczorna kąpiel należy do Ciebie',
      'Czytaj na głos — dziecko reaguje na znajomy głos',
    ],
    milestones: [],
    vaccines: [
      {
        name: 'WZW B (2. dawka)',
        description: '2. dawka szczepienia przeciw WZW B',
        when: '1. miesiąc życia',
        mandatory: true,
      },
    ],
    tipOfMonth:
      'Twoja partnerka potrzebuje snu bardziej niż pomocy. Przejmij jedną noc w tygodniu.',
    emotionalNote:
      'Uczucie "nie wiem co robię" to norma. Każdy ojciec tak ma.',
  },
  {
    month: 2,
    title: 'Miesiąc 2 — Pierwszy Uśmiech',
    babyDevelopment: [
      'Pojawia się pierwszy społeczny uśmiech — reaguje na Twoją twarz',
      'Unosi główkę leżąc na brzuchu przez kilka sekund',
      'Śledzi wzrokiem poruszające się przedmioty',
      'Wydaje więcej dźwięków — pierwsze "rozmowy"',
    ],
    dadRole: [
      'Czas na brzuszku (tummy time) — połóż na swoim torsie, to najlepsze ćwiczenie',
      'Rozmawiaj do dziecka podczas każdej czynności pielęgnacyjnej',
      'Naśladuj jego dźwięki — uczysz go dialogu',
    ],
    milestones: [
      {
        id: 'm2_smile',
        title: 'Pierwszy uśmiech społeczny',
        description:
          'Dziecko uśmiecha się w odpowiedzi na Twój uśmiech — to nie gazy.',
        forDad: 'Pochyl się nad dzieckiem, uśmiechnij szeroko i czekaj. Powtórz.',
      },
      {
        id: 'm2_headlift',
        title: 'Unoszenie główki',
        description: 'Na brzuszku unosi głowę pod kątem 45°.',
        forDad:
          'Kładź dziecko na brzuszku na swoim torsie kilka razy dziennie po 2–3 minuty.',
      },
    ],
    vaccines: [
      {
        name: 'DTP + Hib + IPV (6w1, 1. dawka)',
        description:
          'Błonica, tężec, krztusiec, Haemophilus influenzae, polio, WZW B',
        when: '2. miesiąc życia',
        mandatory: true,
      },
      {
        name: 'PCV13 (1. dawka)',
        description: 'Pneumokoki — zapalenie płuc, opon mózgowych',
        when: '2. miesiąc życia',
        mandatory: true,
      },
      {
        name: 'Rotarix (1. dawka)',
        description: 'Rotawirusy — ciężkie biegunki niemowlęce',
        when: '2. miesiąc życia',
        mandatory: false,
      },
    ],
    tipOfMonth:
      'Każda zmiana pieluchy to okazja do kontaktu. Rozmawiaj, śpiewaj, naśladuj miny.',
    emotionalNote:
      'Widzisz pierwszy uśmiech swojego dziecka skierowany do Ciebie — ten moment zmienia wszystko.',
  },
  {
    month: 3,
    title: 'Miesiąc 3 — Odkrywanie Rąk',
    babyDevelopment: [
      'Odkrywa własne ręce — ogląda je z fascynacją',
      'Głośno rechocze i śmieje się',
      'Trzyma główkę stabilnie w pozycji pionowej',
      'Reaguje na znane twarze wyraźnym ożywieniem',
    ],
    dadRole: [
      'Pokaż dziecku kolorowe zabawki i pozwól mu je dotknąć',
      'Czas na pierwsze wspólne zabawy — "lecisz samolotem", delikatne podrzucanie',
      'Stwórzcie razem rytuał dobranoc — ta sama piosenka co wieczór',
    ],
    milestones: [
      {
        id: 'm3_laugh',
        title: 'Pierwszy śmiech',
        description: 'Głośny rechot w odpowiedzi na zabawę — nie łaskotanie.',
        forDad:
          'Rób śmieszne miny lub dźwięki. Dziecko zapamiętuje, co go rozśmiesza.',
      },
    ],
    vaccines: [
      {
        name: 'DTP + Hib + IPV (6w1, 2. dawka)',
        description: '2. dawka szczepienia skojarzonego',
        when: '3–4. miesiąc życia',
        mandatory: true,
      },
      {
        name: 'PCV13 (2. dawka)',
        description: '2. dawka przeciw pneumokokom',
        when: '3–4. miesiąc życia',
        mandatory: true,
      },
      {
        name: 'Rotarix (2. dawka)',
        description: '2. dawka przeciw rotawirusom',
        when: '3–4. miesiąc życia',
        mandatory: false,
      },
    ],
    tipOfMonth:
      'Rutyna uspokaja. Stałe pory karmienia, snu i zabawy to fundament bezpieczeństwa dziecka.',
    emotionalNote:
      'Możesz czuć, że zaczynasz "ogarniać" ojcostwo. To nie znaczy, że skończyły się wyzwania — właśnie zaczyna się najlepsza część.',
  },
  {
    month: 4,
    title: 'Miesiąc 4 — Eksploracja',
    babyDevelopment: [
      'Chwyta przedmioty i wkłada je do buzi',
      'Obraca się z pleców na bok',
      'Rozpoznaje imię — odwraca głowę na swoje imię',
      'Wyraźnie różnicuje emocje — radość, zdziwienie, niezadowolenie',
    ],
    dadRole: [
      'Dawaj różne faktury do dotykania — tkaniny, plastik, drewno',
      'Mów do dziecka po imieniu jak najczęściej',
      'Czytaj proste książeczki z kontrastowymi ilustracjami',
    ],
    milestones: [
      {
        id: 'm4_grab',
        title: 'Celowe chwytanie',
        description:
          'Dziecko świadomie sięga po przedmiot i chwyta go — wielki krok w rozwoju motorycznym.',
        forDad:
          'Trzymaj grzechotkę w zasięgu i pozwól mu samodzielnie sięgać — nie wkładaj do ręki.',
      },
    ],
    vaccines: [],
    tipOfMonth:
      'Bezpieczna eksploracja to klucz. Zadbaj, żeby przestrzeń zabawy była wolna od małych przedmiotów.',
    emotionalNote:
      'Pierwsze "nie chcę" od dziecka bywa frustrujące. Pamiętaj — to nie bunt, to komunikacja.',
  },
  {
    month: 5,
    title: 'Miesiąc 5 — Coraz Głośniej',
    babyDevelopment: [
      'Gaworzenie — łańcuchy sylab, np. "ba-ba", "da-da"',
      'Siedzi z podparciem przez kilka minut',
      'Rozpoznaje swój obraz w lustrze',
      'Przenosi przedmioty z ręki do ręki',
    ],
    dadRole: [
      'Odpowiadaj na gaworzenie jak na prawdziwą rozmowę — to nauka dialogu',
      'Ćwicz siadanie — siadaj razem na podłodze, otoczony poduszkami',
      'Wprowadź zabawę "peek-a-boo" (ku-ku) — uczy stałości obiektu',
    ],
    milestones: [
      {
        id: 'm5_babble',
        title: 'Gaworzenie sylab',
        description:
          'Dziecko łączy spółgłoski z samogłoskami: "ba", "ma", "da". Brzmi jak mówienie.',
        forDad:
          'Powtarzaj jego sylaby z powrotem. Mów powoli i wyraźnie, patrząc w oczy.',
      },
    ],
    vaccines: [],
    tipOfMonth:
      'Śpiewaj. Mózg niemowlęcia kocha rytm i melodię — to jedna z najstarszych form komunikacji.',
    emotionalNote:
      'Może Ci się zdawać, że dziecko woli mamę. To faza — bądź cierpliwy i konsekwentnie obecny.',
  },
  {
    month: 6,
    title: 'Miesiąc 6 — Pół Roku!',
    babyDevelopment: [
      'Siedzi samodzielnie przez chwilę bez podparcia',
      'Zaczyna rozgryzać dziąsłami — ząbkowanie się zbliża',
      'Reaguje na "nie" — rozumie ton głosu',
      'Interesuje się jedzeniem dorosłych',
    ],
    dadRole: [
      'Rozszerzanie diety — możesz podawać pierwsze warzywa i owoce',
      'Daj dziecku łyżeczkę do trzymania podczas karmienia',
      'Masuj dziąsła czystym palcem — przynosi ulgę przy ząbkowaniu',
    ],
    milestones: [
      {
        id: 'm6_sit',
        title: 'Samodzielne siedzenie',
        description: 'Siedzi bez podparcia przez kilka sekund, opierając się na rękach.',
        forDad:
          'Siadaj naprzeciwko na podłodze i toczcie piłkę tam i z powrotem.',
      },
    ],
    vaccines: [
      // WZW B 3rd dose is included in the 6w1 combo vaccine below
      { name: 'WZW B (3. dawka)', description: 'Trzecia dawka — zawarta w szczepionce 6w1', when: '6. miesiąc życia', mandatory: true },
      {
        name: 'DTP + Hib + IPV (6w1, 3. dawka)',
        description: '3. dawka szczepienia skojarzonego',
        when: '6. miesiąc życia',
        mandatory: true,
      },
      {
        name: 'PCV13 (3. dawka)',
        description: '3. dawka przeciw pneumokokom',
        when: '6. miesiąc życia',
        mandatory: true,
      },
    ],
    tipOfMonth:
      'Pół roku — czas na przegląd bilansowy u pediatry. Sprawdzą wzrok, słuch i rozwój motoryczny.',
    emotionalNote:
      'Sześć miesięcy temu byłeś w szoku. Teraz wiesz, jak trzymać, kołysać, uspokajać. To wiedza, której nikt Ci nie odebrze.',
  },
  {
    month: 7,
    title: 'Miesiąc 7 — Ruch i Ciekawość',
    babyDevelopment: [
      'Pełza lub raczkuje — zaczyna się samodzielne przemieszczanie',
      'Wskazuje palcem na interesujące rzeczy',
      'Naśladuje gesty i proste czynności',
      'Lęk separacyjny — płacze gdy odchodzisz',
    ],
    dadRole: [
      'Zabezpiecz dom — gniazdka, szafki, ostre kanty',
      'Czytaj razem książeczki i wskazuj obrazki palcem',
      'Gdy wychodzisz, żegnaj się wyraźnie — nie znikaj po cichu',
    ],
    milestones: [
      {
        id: 'm7_crawl',
        title: 'Pierwsze pełzanie',
        description:
          'Dziecko samodzielnie przemieszcza się — pełzanie, raczkowanie lub bum-shuffling.',
        forDad:
          'Połóż się na podłodze i wołaj do siebie — bądź celem, do którego warto doczołgać.',
      },
    ],
    vaccines: [],
    tipOfMonth:
      'Teraz naprawdę musisz patrzeć. Mobilne niemowlę znajdzie zagrożenie szybciej niż myślisz.',
    emotionalNote:
      'Lęk separacyjny to znak przywiązania — dziecko rozumie, że jesteś kimś ważnym. To dobra wiadomość.',
  },
  {
    month: 8,
    title: 'Miesiąc 8 — Komunikacja',
    babyDevelopment: [
      'Mówi "mama" i "dada" — często bez przypisania do osoby',
      'Rozumie proste polecenia: "daj", "nie", "chodź"',
      'Wstaje przy meblach, trzymając się',
      'Bawi się w chowanego — rozumie, że przedmioty istnieją poza polem widzenia',
    ],
    dadRole: [
      'Używaj prostych, krótkich zdań i powtarzaj słowa kluczowe',
      'Naucz "pa pa" — machanie na pożegnanie to ważny krok komunikacyjny',
      'Daj możliwość bezpiecznego stania przy kanapie lub stoliku',
    ],
    milestones: [
      {
        id: 'm8_dada',
        title: 'Pierwsze "tata"',
        description:
          'Dziecko może powiedzieć "tata" lub "dada" — nawet jeśli nie zawsze wie, do kogo.',
        forDad:
          'Wskazuj na siebie i mów wyraźnie "tata". Powtarzaj. Bądź cierpliwy.',
      },
    ],
    vaccines: [],
    tipOfMonth:
      'Zacznij ograniczać czas przy ekranach wokół dziecka. Jego mózg uczy się z twarzy, nie z ekranów.',
    emotionalNote:
      'Kiedy usłyszysz "tata" po raz pierwszy — nie ważne, czy to do Ciebie — to jeden z tych momentów.',
  },
  {
    month: 9,
    title: 'Miesiąc 9 — Stanie i Charakter',
    babyDevelopment: [
      'Staje samodzielnie przez chwilę bez trzymania',
      'Pokazuje wyraźny charakter — upór, radość, frustracja',
      'Naśladuje proste czynności: klaszcze, macha',
      'Pije z kubka niekapka z pomocą',
    ],
    dadRole: [
      'Ucz przez naśladownictwo — rób razem proste rzeczy: mieszanie w garnku, odkładanie zabawek',
      'Ustal granice łagodnie i konsekwentnie',
      'Śpiewaj piosenki z gestami (np. "Kółko Graniaste")',
    ],
    milestones: [
      {
        id: 'm9_clap',
        title: 'Klaskanie',
        description: 'Dziecko klaszcze w ręce na widok ulubionego dźwięku lub osoby.',
        forDad: 'Klaszcz razem z dzieckiem — naśladownictwo to najszybsza nauka.',
      },
    ],
    vaccines: [],
    tipOfMonth:
      'Dziecko rozumie znacznie więcej, niż mówi. Mów do niego pełnymi zdaniami, opisuj to, co robisz.',
    emotionalNote:
      'Zaczyna być widać osobowość Twojego dziecka. To jest człowiek — i Ty masz wpływ na to, jaki.',
  },
  {
    month: 10,
    title: 'Miesiąc 10 — Pierwsze Kroki',
    babyDevelopment: [
      'Chodzi wzdłuż mebli (cruising)',
      'Wskazuje precyzyjnie palcem wskazującym (pincer grasp)',
      'Mówi 1–3 słowa ze zrozumieniem',
      'Naśladuje odgłosy zwierząt i otoczenia',
    ],
    dadRole: [
      'Trzymaj za obie ręce i chodź razem — daje pewność i wzmacnia nogi',
      'Rozmawiaj o tym, co widzisz na spacerze — każde drzewo, pies, auto ma nazwę',
      'Daj kredki lub grubą kredę — bazgranie to ćwiczenie motoryki małej',
    ],
    milestones: [
      {
        id: 'm10_pincer',
        title: 'Chwyt pęsetkowy',
        description:
          'Dziecko chwyta małe przedmioty kciukiem i palcem wskazującym.',
        forDad:
          'Daj kawałki miękkiego banana lub gotowanej marchewki — niech samo sięga i je.',
      },
    ],
    vaccines: [],
    tipOfMonth:
      'Pierwsze kroki są blisko. Nie popędzaj — każde dziecko ma swój rytm. Twoja rola to dawać przestrzeń i bezpieczeństwo.',
    emotionalNote:
      'Obserwujesz dziecko, które za chwilę ruszy w świat na własnych nogach. Jesteś gotowy?',
  },
  {
    month: 11,
    title: 'Miesiąc 11 — Samodzielność',
    babyDevelopment: [
      'Stawia pierwsze niezależne kroki lub jest tuż przed tym',
      'Je samodzielnie palcami, próbuje łyżeczki',
      'Rozumie i wykonuje proste polecenia',
      'Mówi 2–4 słowa znaczące, rozumie wiele więcej',
    ],
    dadRole: [
      'Pozwól brać udział w prostych czynnościach — podawanie rzeczy, odkładanie',
      'Chwal konkretne zachowania, nie ogólnie',
      'Zacznij wieczorny rytuał z książeczką — 10 minut przed snem',
    ],
    milestones: [
      {
        id: 'm11_steps',
        title: 'Samodzielne kroki',
        description: 'Kilka kroków bez trzymania — wielki moment niezależności.',
        forDad:
          'Klęknij parę kroków dalej i wyciągnij ręce. Bądź celem, nie podporą.',
      },
    ],
    vaccines: [],
    tipOfMonth:
      'Samodzielność w jedzeniu jest brudna i wolna. Nie przejmuj kontroli — dziecko uczy się przez próby.',
    emotionalNote:
      'Za miesiąc — pierwsze urodziny. Rok temu zaczynałeś tę przygodę. Pamiętaj tamten dzień?',
  },
  {
    month: 12,
    title: 'Miesiąc 12 — Pierwsze Urodziny!',
    babyDevelopment: [
      'Chodzi samodzielnie lub jest gotowe do pierwszych kroków',
      'Mówi kilka słów znaczących: mama, tata, baba, daj',
      'Rozumie "nie", reaguje na proste polecenia',
      'Naśladuje dorosłych — próbuje "rozmawiać" przez telefon, szczotkować włosy',
    ],
    dadRole: [
      'Świętuj — zrób album lub wideo z pierwszego roku',
      'Teraz zaczyna się etap toddlera — przygotuj się na "nie" i "sam!"',
      'Kontynuuj rytuały — stały czas kąpieli, czytania, spaceru',
    ],
    milestones: [
      {
        id: 'm12_walk',
        title: 'Samodzielne chodzenie',
        description: 'Dziecko chodzi bez trzymania — świat stoi otworem.',
        forDad:
          'Chodź razem na spacery i pozwól eksplorować w bezpiecznej przestrzeni.',
      },
      {
        id: 'm12_words',
        title: 'Pierwsze słowa',
        description: 'Minimum 1–3 słowa z pełnym rozumieniem znaczenia.',
        forDad: 'Czytaj, rozmawiaj, śpiewaj — Twój głos to najlepszy nauczyciel języka.',
      },
    ],
    vaccines: [
      {
        name: 'MMR (1. dawka)',
        description: 'Odra, świnka, różyczka',
        when: '13–15. miesiąc życia',
        mandatory: true,
      },
      {
        name: 'Varicella (1. dawka)',
        description: 'Ospa wietrzna',
        when: '13–15. miesiąc życia',
        mandatory: true,
      },
      {
        name: 'WZW A (1. dawka)',
        description: 'Wirusowe zapalenie wątroby typu A',
        when: '12. miesiąc życia',
        mandatory: false,
      },
    ],
    tipOfMonth:
      'Nie oceniaj swojego pierwszego roku jako ojca zbyt surowo. Zrobiłeś to — jesteś tu, byłeś obecny.',
    emotionalNote:
      'Rok temu trzymałeś w ramionach coś tak małego, że się bałeś. Dziś to osoba — z charakterem, śmiechem i preferencjami. Byłeś częścią tego cudu.',
  },
];
