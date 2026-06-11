import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/Icon';
import AuroraBackground from '../components/ui/AuroraBackground';
import GradientText from '../components/ui/GradientText';
import Kicker from '../components/ui/Kicker';
import type { Theme } from '../theme';
import type { AppNavigation } from '../types/navigation';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

interface Item { text: string }
interface TableRow { col1: string; col2: string; col3?: string }

interface Section {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  borderColor: string;
  items?: Item[];
  table?: { headers: string[]; rows: TableRow[] };
}

const AVOID_SECTIONS: Section[] = [
  {
    id: 'meat',
    title: 'Mięso i ryby',
    icon: 'yakitori',
    iconColor: '#FF5A4A',
    borderColor: '#FF5A4A',
    items: [
      { text: 'Surowe lub niedogotowane mięso (tatar, carpaccio, krwiste steki) — ryzyko toksoplazmozy i salmonellozy' },
      { text: 'Sushi, surowy łosoś, ostrygi, małże — bakterie Listeria i Vibrio' },
      { text: 'Wędliny dojrzewające bez obróbki cieplnej (salami, chorizo, szynka parmeńska, bresaola)' },
      { text: 'Rekan, miecznik, tuńczyk bigeye, makrela królewska, orange roughy, marlin — kumulują rtęć, która niszczy mózg dziecka' },
      { text: 'Wątroba i pasztety — za dużo witaminy A (retinolu), który uszkadza rozwój, plus ryzyko listeriozy' },
    ],
  },
  {
    id: 'dairy',
    title: 'Nabiał i jaja',
    icon: 'egg-alt',
    iconColor: '#FF5A4A',
    borderColor: '#FF5A4A',
    items: [
      { text: 'Sery pleśniowe: brie, camembert, gorgonzola, roquefort, stilton — Listeria' },
      { text: 'Niepasteryzowane mleko i sery z niepasteryzowanego mleka' },
      { text: 'Surowe jaja i produkty z surowych jaj: domowy majonez, mousse, tiramisu, lody domowe — salmonelloza' },
    ],
  },
  {
    id: 'other',
    title: 'Inne produkty',
    icon: 'grocery',
    iconColor: '#FF5A4A',
    borderColor: '#FF5A4A',
    items: [
      { text: 'Kiełki (lucerna, rzodkiewka, fasola mung) — ryzyko Listeria, E. coli, Salmonella' },
      { text: 'Surowe lub słabo ugotowane kiełki' },
      { text: 'Niepasteryzowane soki warzywne i owocowe' },
    ],
  },
  {
    id: 'substances',
    title: 'Używki',
    icon: 'liquor',
    iconColor: '#FF5A4A',
    borderColor: '#FF5A4A',
    items: [
      { text: 'Alkohol — każda ilość może uszkodzić mózg i serce dziecka; ryzyko FAS (Płodowy Zespół Alkoholowy)' },
      { text: 'Papierosy i tytoń — kurczą naczynia łożyska; dziecko będzie ważyć mniej i urodzi się wcześniej' },
      { text: 'Bierne palenie — działa tak samo jak czynne' },
      { text: 'Marihuana i inne narkotyki — zaburzają neurologiczny rozwój dziecka, ryzyko przedwczesnego porodu' },
      { text: 'Kofeina > 200 mg/dobę (ponad 1–2 kawy dziennie) — zwiększa ryzyko poronienia i małej masy urodzeniowej' },
    ],
  },
  {
    id: 'meds_banned',
    title: 'Leki bezwzględnie zakazane',
    icon: 'pill',
    iconColor: '#FF5A4A',
    borderColor: '#FF5A4A',
    table: {
      headers: ['Lek', 'Czym jest', 'Czym grozi'],
      rows: [
        { col1: 'Izotretynoina (Roaccutane)', col2: 'Lek na trądzik', col3: 'Wady twarzoczaszki, serca, mózgu' },
        { col1: 'Kwas walproinowy (Depakine)', col2: 'Padaczka, ChAD', col3: 'Wady cewy nerwowej, serca' },
        { col1: 'Warfaryna', col2: 'Antykoagulant', col3: 'Embriopatia, wady mózgu, krwotok' },
        { col1: 'Metotreksat', col2: 'Nowotwory, RZS', col3: 'Poronienie, wady czaszki i kończyn' },
        { col1: 'Lit', col2: 'Choroba dwubiegunowa', col3: 'Wada serca (anomalia Ebsteina)' },
        { col1: 'Acytretyna, retinoidy', col2: 'Łuszczyca', col3: 'Wady CNS, twarzoczaszki, serca' },
        { col1: 'Statyny (atorwastatyna)', col2: 'Cholesterol', col3: 'Wady wrodzone' },
        { col1: 'Topiramat', col2: 'Padaczka, migrena', col3: 'Rozszczep wargi i podniebienia' },
        { col1: 'Mykofenolan', col2: 'Immunosupresja', col3: 'Wady uszu, rozszczep podniebienia' },
        { col1: 'Talidomid', col2: '(historyczny)', col3: 'Brak/skrócenie kończyn' },
      ],
    },
  },
  {
    id: 'herbs_banned',
    title: 'Zioła zakazane',
    icon: 'cannabis',
    iconColor: '#FF5A4A',
    borderColor: '#FF5A4A',
    items: [
      { text: 'Czarny cohosh — wywołuje skurcze macicy' },
      { text: 'Niebieski cohosh — silne działanie poronne' },
      { text: 'Piołun — silnie poronny' },
      { text: 'Lubczyk — rozkurcza macicę, ryzyko poronienia' },
      { text: 'Aloes doustnie — genotoksyczny, podejrzewany o działanie poronne' },
      { text: 'Jałowiec (owoc) — działanie poronne' },
      { text: 'Szałwia w dużych ilościach — może wywołać przedwczesny poród' },
      { text: 'Wiesiołek — przeciwwskazany w ciąży' },
      { text: 'Kozieradka — ryzyko uszkodzenia płodu' },
      { text: 'Żeń-szeń — niezalecany, brak badań bezpieczeństwa' },
      { text: 'Dong Quai — stymuluje i rozluźnia macicę' },
      { text: 'Lukrecja (korzeń) — wpływa na gospodarkę hormonalną' },
      { text: 'Witamina A (retinol) w nadmiarze — teratogenna powyżej 3000 μg/dobę' },
    ],
  },
];

const CONSULT_SECTIONS: Section[] = [
  {
    id: 'meds_consult',
    title: 'Leki wymagające konsultacji',
    icon: 'admin-meds',
    iconColor: '#FFB547',
    borderColor: '#FFB547',
    table: {
      headers: ['Lek', 'Ryzyko'],
      rows: [
        { col1: 'Ibuprofen, diklofenak, naproksen (NLPZ)', col2: 'W III trymestrze zamykają przewód tętniczy serca płodu' },
        { col1: 'Inhibitory ACE (enalapril, lisinopril)', col2: 'Uszkadzają nerki dziecka, mogą zlikwidować płyn owodniowy' },
        { col1: 'Sartany ARB (losartan, walsartan)', col2: 'Jak inhibitory ACE — bezwzględnie odradzane' },
        { col1: 'Fluorochinolony (ciprofloksacyna)', col2: 'Uszkadzają chrząstki i kości dziecka' },
        { col1: 'Tetracykliny, doksycyklina', col2: 'Przebarwiają zęby, hamują wzrost kości' },
        { col1: 'Kodeina, tramadol, opioidy', col2: 'Wywołują u dziecka zespół abstynencyjny po urodzeniu' },
        { col1: 'Aspiryna w wysokich dawkach', col2: 'Zamknięcie przewodu tętniczego w III trymestrze' },
      ],
    },
  },
];

const INCREASE_SECTIONS: Section[] = [
  {
    id: 'supplements',
    title: 'Suplementy rekomendowane przez PTGiP',
    icon: 'pharmacy',
    iconColor: '#00E5C0',
    borderColor: '#00E5C0',
    table: {
      headers: ['Składnik', 'Dawka', 'Po co'],
      rows: [
        { col1: 'Foliany / 5-MTHF', col2: '0,4–0,8 mg/dobę', col3: 'Zamknięcie cewy nerwowej — mózg i kręgosłup dziecka' },
        { col1: 'Witamina D3', col2: '2000 IU/dobę', col3: 'Kości dziecka, układ odpornościowy' },
        { col1: 'Jod', col2: '200 μg/dobę', col3: 'Tarczyca i mózg dziecka — bez jodu nie rozwinie się prawidłowo' },
        { col1: 'DHA (Omega-3)', col2: 'min. 200–400 mg/dobę', col3: 'Buduje mózg i siatkówkę oka dziecka' },
        { col1: 'Żelazo', col2: 'wg lekarza (30–60 mg przy niedoborze)', col3: 'Tlen dla dziecka przez łożysko' },
        { col1: 'Cholina', col2: '450 mg/dobę', col3: 'Wspomaga rozwój mózgu dziecka' },
        { col1: 'Witamina B6 + B12', col2: 'wg zaleceń', col3: 'Prawidłowy metabolizm, uzupełnia działanie folianów' },
      ],
    },
  },
  {
    id: 'food',
    title: 'Jedzenie warte uwagi',
    icon: 'grocery',
    iconColor: '#00E5C0',
    borderColor: '#00E5C0',
    items: [
      { text: 'Łosoś, sardynki, śledź, pstrąg, makrela atlantycka — bezpieczne źródła DHA (mała zawartość rtęci)' },
      { text: 'Szpinak, brokuły, soczewica, ciecierzyca — naturalne foliany' },
      { text: 'Jaja (dobrze ugotowane) — żelazo, cholina, białko' },
      { text: 'Produkty mleczne pasteryzowane — wapń i białko' },
      { text: 'Orzechy włoskie — ALA, prekursor DHA' },
      { text: 'Czerwone mięso (dobrze ugotowane) — najlepiej przyswajalne żelazo hemowe' },
      { text: 'Pestki dyni, sezam — cynk i żelazo' },
    ],
  },
  {
    id: 'herbs_safe',
    title: 'Zioła i napary bezpieczne',
    icon: 'cannabis',
    iconColor: '#10B981',
    borderColor: '#10B981',
    items: [
      { text: 'Imbir — łagodzi poranne mdłości' },
      { text: 'Melisa — pomaga przy bezsenności i stresie' },
      { text: 'Mięta pieprzowa — przy problemach trawiennych' },
      { text: 'Rumianek — rozkurczowo, łagodnie uspokajający (w umiarkowanych ilościach)' },
      { text: 'Lipa — przy przeziębieniu, zamiast leków' },
    ],
  },
];

function AccordionSection({ section, theme, s }: { section: Section; theme: Theme; s: ReturnType<typeof createStyles> }) {
  const [open, setOpen] = useState(false);
  const hasTable = !!section.table;
  const threeCol = hasTable && section.table!.headers.length === 3;

  return (
    <View style={s.accordionWrap}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen(o => !o)}
        style={[s.sectionHeader, { borderLeftColor: section.borderColor }, open && s.sectionHeaderOpen]}
      >
        <Icon name={section.icon} size={18} color={section.iconColor} />
        <Text style={s.sectionTitle}>{section.title}</Text>
        <Icon name={open ? 'expand-less' : 'expand-more'} size={22} color={theme.colors.textMuted} />
      </TouchableOpacity>

      {open && (
        <View style={s.sectionContent}>
          {section.items && section.items.map((item, i) => (
            <View key={i} style={s.listRow}>
              <View style={[s.listDot, { backgroundColor: section.iconColor }]} />
              <Text style={s.listText}>{item.text}</Text>
            </View>
          ))}

          {hasTable && (
            <View style={s.table}>
              <View style={s.tableHeaderRow}>
                {section.table!.headers.map((h, i) => (
                  <Text key={i} style={[s.tableHeaderCell, threeCol ? s.threeColCell : s.twoColCell]}>{h}</Text>
                ))}
              </View>
              {section.table!.rows.map((row, i) => (
                <View key={i} style={[s.tableRow, i % 2 === 0 && s.tableRowAlt]}>
                  <Text style={[s.tableCell, s.tableCellBold, threeCol ? s.threeColCell : s.twoColCell]}>{row.col1}</Text>
                  <Text style={[s.tableCell, threeCol ? s.threeColCell : s.twoColCell]}>{row.col2}</Text>
                  {row.col3 ? <Text style={[s.tableCell, threeCol ? s.threeColCell : s.twoColCell]}>{row.col3}</Text> : null}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default function PregnancySafetyScreen({ navigation }: { navigation: AppNavigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = React.useMemo(() => createStyles(theme, insets), [theme, insets]);

  return (
    <AuroraBackground>
      <View style={{ flex: 1 }}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} accessibilityRole="button" accessibilityLabel="Wróć">
            <Icon name="close" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={s.header}>
          <Kicker>Zdrowie w ciąży</Kicker>
          <View style={s.titleStack}>
            <Text style={s.title}>Co można, </Text>
            <GradientText style={s.title} colors={[theme.colors.danger, '#FF8C42']}>a co nie.</GradientText>
          </View>
          <Text style={s.subtitle}>Przewodnik po zakazach i zaleceniach w ciąży</Text>
        </View>
      <ScrollView style={s.c} contentContainerStyle={s.scrollContent}>
        <View style={s.segmentLabel}>
          <Icon name="block" size={16} color={theme.colors.danger} />
          <Text style={[s.segmentText, { color: theme.colors.danger }]}>Czego unikać</Text>
        </View>

        <View style={s.list}>
          {AVOID_SECTIONS.map(section => (
            <AccordionSection key={section.id} section={section} theme={theme} s={s} />
          ))}
        </View>

        <View style={[s.segmentLabel, { marginTop: theme.spacing.lg }]}>
          <Icon name="admin-meds" size={16} color={theme.colors.accent} />
          <Text style={[s.segmentText, { color: theme.colors.accent }]}>Wymagające konsultacji</Text>
        </View>

        <View style={s.list}>
          {CONSULT_SECTIONS.map(section => (
            <AccordionSection key={section.id} section={section} theme={theme} s={s} />
          ))}
        </View>

        <View style={[s.segmentLabel, { marginTop: theme.spacing.lg }]}>
          <Icon name="check-circle" size={16} color={theme.colors.primary} />
          <Text style={[s.segmentText, { color: theme.colors.primary }]}>Co warto zwiększyć</Text>
        </View>

        <View style={s.list}>
          {INCREASE_SECTIONS.map(section => (
            <AccordionSection key={section.id} section={section} theme={theme} s={s} />
          ))}
        </View>

        <MedicalDisclaimer />
        <View style={{ height: 40 }} />
      </ScrollView>
      </View>
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme, insets: { top: number; bottom: number }) => StyleSheet.create({
  c: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: insets.bottom + 24 },

  topBar: {
    paddingTop: insets.top + 8,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 4,
    alignItems: 'flex-end',
  },
  backBtn: { padding: 8 },

  header: {
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 24,
    gap: 8,
  },
  titleStack: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 8 },
  title: {
    fontSize: theme.fontSize.hero,
    fontFamily: theme.fonts.title,
    fontVariationSettings: '"wght" 700',
    color: theme.colors.text,
    letterSpacing: 1,
  },
  subtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, marginTop: 4 },

  segmentLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  segmentText: {
    fontFamily: theme.fonts.semibold,
    fontSize: theme.fontSize.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  list: { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.xs },

  accordionWrap: { marginBottom: theme.spacing.xs },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderLeftWidth: 4,
  },
  sectionHeaderOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: theme.fonts.semibold,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  sectionContent: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderTopWidth: 0,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },

  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 4,
  },
  listDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  listText: {
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },

  table: { marginTop: 4 },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorderHi,
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontFamily: theme.fonts.semibold,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderRadius: 6,
  },
  tableRowAlt: { backgroundColor: 'rgba(255,255,255,0.03)' },
  tableCell: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    paddingHorizontal: 2,
  },
  tableCellBold: {
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  twoColCell: { flex: 1 },
  threeColCell: { flex: 1 },
});
