import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { usePersistedChecklist } from '../hooks/usePersistedChecklist';
import { useCheckupVisits } from '../hooks/useAppData';
import { createExamEvent, deleteExamEvent } from '../services/calendar/CalendarService';
import { addEntry as addJournalEntry } from '../services/journal/JournalService';
import { logError } from '../utils/logError';
import type { Theme } from '../theme';
import Icon from '../components/Icon';
import GlassCard from '../components/ui/GlassCard';
import AuroraBackground from '../components/ui/AuroraBackground';
import AddExamSheet, { ExamSubmitPayload } from '../components/checkups/AddExamSheet';

interface CheckItem {
  id: number;
  name: string;
  optional?: boolean;
  note?: string | null;
}

interface CheckCategory {
  id: number;
  title: string;
  icon: string;
  colorKey: string;
  singleCheck?: boolean;
  items: CheckItem[];
}

interface VisitPeriod {
  id: number;
  weekRange: string;
  title: string;
  subtitle: string;
  colorKey: string;
  categories: CheckCategory[];
}

const resolveColor = (colorKey: string, theme: Theme): string => {
  const c = theme.colors as Record<string, string>;
  return c[colorKey] || theme.colors.primary;
};

const getItemKey = (vIdx: number, cIdx: number, iIdx: number) => `checkup-v${vIdx}-c${cIdx}-i${iIdx}`;
const getCatKey = (vIdx: number, cIdx: number) => `checkup-v${vIdx}-cat${cIdx}`;

const countCheckable = (visit: VisitPeriod) =>
  visit.categories.reduce((sum, cat) => sum + (cat.singleCheck ? 1 : cat.items.length), 0);

const countCheckedInVisit = (visit: VisitPeriod, vIdx: number, checked: Record<string, boolean>) =>
  visit.categories.reduce((sum, cat, cIdx) => {
    if (cat.singleCheck) return sum + (checked[getCatKey(vIdx, cIdx)] ? 1 : 0);
    return sum + cat.items.filter((_, iIdx) => checked[getItemKey(vIdx, cIdx, iIdx)]).length;
  }, 0);

interface PendingExam {
  key: string;
  examName: string;
  weekRange: string;
}

function parseFirstWeek(weekRange: string): number {
  const match = weekRange.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export default function CheckupsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = React.useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);
  const { data } = useCheckupVisits();
  const visits: VisitPeriod[] = data?.visits ?? [];
  const [expanded, setExpanded] = useState<number | null>(null);
  const { checked, toggleCheck, setCheckedWithMeta, getMeta } = usePersistedChecklist('checkups');
  const [pendingExam, setPendingExam] = useState<PendingExam | null>(null);

  const toggle = (idx: number) => setExpanded(expanded === idx ? null : idx);

  const handleAddConfirmed = useCallback((key: string, examName: string, weekRange: string) => {
    // Step 1: mark checked immediately (per option C)
    setCheckedWithMeta(key, true);
    // Step 2: open sheet
    setPendingExam({ key, examName, weekRange });
  }, [setCheckedWithMeta]);

  const handleSheetCancel = useCallback(() => {
    setPendingExam(null);
  }, []);

  const handleSheetSubmit = useCallback(async (payload: ExamSubmitPayload) => {
    if (!pendingExam) return;
    const { key, examName, weekRange } = pendingExam;
    setPendingExam(null);

    let calendarEventId: string | undefined;
    let journalEntryId: string | undefined;

    try {
      const eventId = await createExamEvent({
        title: `Badanie: ${examName}`,
        start: payload.start,
        end: payload.end,
        doctor: payload.doctor,
        location: payload.location,
        notes: payload.notes,
      });
      calendarEventId = eventId ?? undefined;
    } catch (err: unknown) {
      logError('CheckupsScreen.createExamEvent', err);
    }

    if (calendarEventId === undefined) {
      Alert.alert(
        'Brak wydarzenia w kalendarzu',
        'Nie udało się dodać wydarzenia. Wpis trafi tylko do dziennika.',
      );
    }

    try {
      const isoDate = payload.start.toISOString().slice(0, 10);
      const entry = await addJournalEntry({
        type: 'exam',
        title: examName,
        date: isoDate,
        week: parseFirstWeek(weekRange),
        notes: payload.notes,
        doctor: payload.doctor,
        location: payload.location,
        linkedExamId: key,
        reminder: payload.start.toISOString(),
      });
      journalEntryId = entry.id;
    } catch (err: unknown) {
      logError('CheckupsScreen.addJournalEntry', err);
    }

    setCheckedWithMeta(key, true, { calendarEventId, journalEntryId });
  }, [pendingExam, setCheckedWithMeta]);

  const promptUncheck = useCallback((key: string) => {
    const meta = getMeta(key);
    if (!meta?.calendarEventId) {
      toggleCheck(key);
      return;
    }
    Alert.alert(
      'Usunąć z kalendarza?',
      'Czy chcesz usunąć też wydarzenie z kalendarza telefonu?',
      [
        {
          text: 'Nie',
          style: 'cancel',
          onPress: () => toggleCheck(key),
        },
        {
          text: 'Tak',
          onPress: async () => {
            try {
              await deleteExamEvent(meta.calendarEventId!);
            } catch (err: unknown) {
              logError('CheckupsScreen.deleteExamEvent', err);
            }
            toggleCheck(key);
          },
        },
      ],
    );
  }, [getMeta, toggleCheck]);

  const promptCheck = useCallback((key: string, examName: string, weekRange: string) => {
    Alert.alert(
      'Dodać do kalendarza?',
      `Czy chcesz dodać „${examName}" do kalendarza telefonu?`,
      [
        {
          text: 'Nie',
          style: 'cancel',
          onPress: () => setCheckedWithMeta(key, true),
        },
        {
          text: 'Tak',
          onPress: () => handleAddConfirmed(key, examName, weekRange),
        },
      ],
    );
  }, [setCheckedWithMeta, handleAddConfirmed]);

  const onCheckboxPress = useCallback((key: string, examName: string, weekRange: string) => {
    if (checked[key]) {
      promptUncheck(key);
    } else {
      promptCheck(key, examName, weekRange);
    }
  }, [checked, promptUncheck, promptCheck]);

  const totalItems = useMemo(() => visits.reduce((sum, v) => sum + countCheckable(v), 0), [visits]);
  const totalChecked = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);

  if (!data) {
    return (
      <View style={[s.c, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.textMuted }}>Ładowanie...</Text>
      </View>
    );
  }

  return (
    <AuroraBackground>
      <View style={s.container}>
        <ScrollView style={s.scroll}>
          <View style={s.header}>
            <Icon name="calendar" size={48} color={theme.colors.checkups} />
            <Text style={s.title}>Wizyty Lekarskie</Text>
            <Text style={s.sub}>Baza najważniejszych badań i kontroli w ciąży</Text>
          </View>

          <GlassCard accent="cyan" elevated style={s.progressCard}>
            <Text style={s.progressLabel}>Postęp badań</Text>
            <View style={s.progressRight}>
              <Text style={s.progressCount}>{totalChecked}/{totalItems}</Text>
              <Text style={s.progressCheckLabel}>odfajkowane zadania</Text>
            </View>
          </GlassCard>

          {visits.map((visit, vIdx) => {
            const isExpanded = expanded === vIdx;
            const visitItemCount = countCheckable(visit);
            const visitChecked = countCheckedInVisit(visit, vIdx, checked);
            const isLast = vIdx === visits.length - 1;
            const isDone = visitItemCount > 0 && visitChecked === visitItemCount;
            const visitColor = resolveColor(visit.colorKey, theme);

            return (
              <View key={vIdx} style={s.timelineRow}>
                <View style={s.timelineCol}>
                  <View style={[s.timelineDot, { backgroundColor: isDone ? theme.colors.primary : visitColor, shadowColor: isDone ? theme.colors.primary : visitColor }]} />
                  {!isLast ? <View style={s.timelineLine} /> : null}
                </View>
                <View style={s.timelineContent}>
                  <TouchableOpacity onPress={() => toggle(vIdx)} activeOpacity={0.85} accessibilityRole="button" accessibilityState={{ expanded: isExpanded }}>
                    <GlassCard style={s.visitHeader}>
                      <View style={s.visitHeaderLeft}>
                        <View style={[s.weekBadge, { backgroundColor: visitColor }]}>
                          <Text style={s.weekBadgeText}>{visit.weekRange}</Text>
                        </View>
                        <Text style={s.visitTitle}>{visit.title}</Text>
                        <Text style={s.visitSubtitle} numberOfLines={2}>{visit.subtitle}</Text>
                      </View>
                      <View style={s.visitHeaderRight}>
                        <Text style={[s.visitProgress, { color: isDone ? theme.colors.primary : theme.colors.textMuted }]}>
                          {visitChecked}/{visitItemCount}
                        </Text>
                        <Icon name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color={theme.colors.textMuted} />
                      </View>
                    </GlassCard>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={s.visitContent}>
                      {visit.categories.map((cat, cIdx) => {
                        if (cat.singleCheck) {
                          const catKey = getCatKey(vIdx, cIdx);
                          const isCatDone = checked[catKey] || false;
                          return (
                            <View key={cIdx} style={s.catSection}>
                              <View style={[s.singleCheckRow, isCatDone && s.checkItemDone]}>
                                <TouchableOpacity
                                  onPress={() => onCheckboxPress(catKey, cat.title, visit.weekRange)}
                                  style={s.checkBtn}
                                  accessibilityRole="checkbox"
                                  accessibilityLabel={cat.title}
                                  accessibilityState={{ checked: isCatDone }}
                                >
                                  <Icon
                                    name={isCatDone ? 'check-circle' : 'checkbox-blank'}
                                    size={22}
                                    color={isCatDone ? theme.colors.primary : theme.colors.textMuted}
                                  />
                                </TouchableOpacity>
                                <View style={s.singleCheckInfo}>
                                  <View style={s.singleCheckTitle}>
                                    <Icon name={cat.icon} size={16} color={resolveColor(cat.colorKey, theme)} />
                                    <Text style={[s.catTitleInline, isCatDone && s.checkNameDone]}> {cat.title}</Text>
                                  </View>
                                  {cat.items.map((item, iIdx) => (
                                    <View key={iIdx} style={s.subItem}>
                                      <Text style={s.subDot}>•</Text>
                                      <Text style={[s.subItemText, isCatDone && s.subItemTextDone]}>
                                        {item.optional && <Text style={s.optional}>(opcja) </Text>}
                                        {item.name}
                                        {item.note ? <Text style={s.subItemNote}> – {item.note}</Text> : null}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            </View>
                          );
                        }

                        return (
                          <View key={cIdx} style={s.catSection}>
                            <View style={s.catHeader}>
                              <Icon name={cat.icon} size={18} color={resolveColor(cat.colorKey, theme)} />
                              <Text style={s.catTitle}> {cat.title}</Text>
                              <Text style={[s.catCount, { color: resolveColor(cat.colorKey, theme) }]}>{cat.items.length}</Text>
                            </View>

                            {cat.items.map((item, iIdx) => {
                              const key = getItemKey(vIdx, cIdx, iIdx);
                              const isItemDone = checked[key] || false;
                              return (
                                <View key={iIdx} style={[s.checkItem, isItemDone && s.checkItemDone]}>
                                  <TouchableOpacity
                                    onPress={() => onCheckboxPress(key, item.name, visit.weekRange)}
                                    style={s.checkBtn}
                                    accessibilityRole="checkbox"
                                    accessibilityLabel={item.name}
                                    accessibilityState={{ checked: isItemDone }}
                                  >
                                    <Icon
                                      name={isItemDone ? 'check-circle' : 'checkbox-blank'}
                                      size={22}
                                      color={isItemDone ? theme.colors.primary : theme.colors.textMuted}
                                    />
                                  </TouchableOpacity>
                                  <View style={s.checkInfo}>
                                    <Text style={[s.checkName, isItemDone && s.checkNameDone]}>
                                      {item.optional && <Text style={s.optional}>(opcja) </Text>}
                                      {item.name}
                                    </Text>
                                    {item.note && <Text style={s.checkNote}>{item.note}</Text>}
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          <View style={s.disclaimer}>
            <Icon name="info" size={16} color={theme.colors.textMuted} />
            <Text style={s.disclaimerText}>Powyższa lista jest orientacyjna. O dokładnych badaniach, ich ilości i częstotliwości decyduje wyłącznie lekarz prowadzący ciążę, który na bieżąco analizuje stan zdrowia kobiety i dziecka.</Text>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {pendingExam && (
        <AddExamSheet
          visible
          examName={pendingExam.examName}
          week={parseFirstWeek(pendingExam.weekRange)}
          onCancel={handleSheetCancel}
          onSubmit={handleSheetSubmit}
        />
      )}
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme, topInset: number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  c: { flex: 1, backgroundColor: 'transparent' },
  header: { alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingTop: topInset + 16, paddingBottom: theme.spacing.lg },
  title: { fontSize: theme.fontSize.xxl, fontFamily: theme.fonts.title, fontVariationSettings: '"wght" 700', color: theme.colors.checkups, marginBottom: 4 },
  sub: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  progressCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg, minHeight: 90 },
  progressLabel: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.text, flex: 1, marginRight: 12 },
  progressRight: { alignItems: 'flex-end' },
  progressCount: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
  progressCheckLabel: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted, marginTop: 2 },
  timelineRow: { flexDirection: 'row', alignItems: 'stretch', marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md },
  timelineCol: { width: 24, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 14, shadowOpacity: 0.7, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  timelineLine: { flex: 1, width: 2, backgroundColor: theme.colors.cardBorder, marginTop: 6 },
  timelineContent: { flex: 1, marginLeft: theme.spacing.sm },
  visitHeader: { padding: theme.spacing.md, flexDirection: 'row', alignItems: 'center' },
  visitHeaderLeft: { flex: 1 },
  weekBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6 },
  weekBadgeText: { fontSize: 11, fontWeight: theme.fontWeight.semibold, color: '#FFFFFF' },
  visitTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },
  visitSubtitle: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 2 },
  visitHeaderRight: { alignItems: 'flex-end', marginLeft: theme.spacing.sm },
  visitProgress: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, marginBottom: 4 },
  visitContent: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, marginTop: 4, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.cardBorder },
  catSection: { marginBottom: 16 },
  catHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  catTitle: { fontSize: 13, fontFamily: theme.fonts.semibold, color: theme.colors.text, flex: 1 },
  catCount: { fontSize: 11, fontFamily: theme.fonts.semibold, backgroundColor: theme.colors.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, color: theme.colors.textMuted },
  singleCheckRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder },
  singleCheckInfo: { flex: 1, marginRight: 8 },
  singleCheckTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  catTitleInline: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  subItem: { flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 4, marginBottom: 2 },
  subDot: { color: theme.colors.textMuted, fontSize: 12, marginRight: 6, marginTop: 1 },
  subItemText: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, lineHeight: 18, flex: 1 },
  subItemTextDone: { color: theme.colors.textMuted },
  subItemNote: { fontStyle: 'italic', color: theme.colors.textMuted },
  checkItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder },
  checkItemDone: { opacity: 0.55 },
  checkBtn: { marginRight: 10 },
  checkInfo: { flex: 1, marginRight: 8 },
  checkName: { fontSize: theme.fontSize.sm, color: theme.colors.text, lineHeight: 20 },
  checkNameDone: { textDecorationLine: 'line-through', color: theme.colors.textMuted },
  optional: { color: theme.colors.textMuted, fontStyle: 'italic', fontSize: theme.fontSize.xs },
  checkNote: { fontSize: 11, color: theme.colors.textMuted, fontStyle: 'italic', marginTop: 1 },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginHorizontal: theme.spacing.lg, marginTop: theme.spacing.lg, padding: theme.spacing.xl, backgroundColor: theme.colors.surfaceLight, borderRadius: theme.borderRadius.xl },
  disclaimerText: { flex: 1, fontSize: 11, color: theme.colors.textMuted, lineHeight: 16, fontStyle: 'italic' },
});
