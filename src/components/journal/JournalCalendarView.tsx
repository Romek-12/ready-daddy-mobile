import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useJournal } from '../../hooks/useJournal';
import { createExamEvent } from '../../services/calendar/CalendarService';
import { addEntry as addJournalEntry } from '../../services/journal/JournalService';
import { getPregnancyWeekAndDay } from '../../utils/pregnancyWeek';
import { logError } from '../../utils/logError';
import CalendarMonthGrid from './CalendarMonthGrid';
import CalendarDayDetail from './CalendarDayDetail';
import AddExamSheet, { type ExamSubmitPayload } from '../checkups/AddExamSheet';
import Icon from '../Icon';
import type { JournalEntry } from '../../types/journal.types';
import type { Theme } from '../../theme';

interface Props {
  /** Test hook: override default monthDate (current month). */
  initialMonthDate?: Date;
  /** Test hook: override default selectedDate (today). */
  initialSelectedDate?: Date;
  /** Optional handler for entry tap (navigate to entry detail). */
  onEntryPress?: (entryId: string) => void;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default function JournalCalendarView({ initialMonthDate, initialSelectedDate, onEntryPress }: Props) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const { user } = useAuth();
  const { entries, reload } = useJournal();

  const [monthDate, setMonthDate] = useState<Date>(() => startOfMonth(initialMonthDate ?? new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => initialSelectedDate ?? new Date());
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  const entriesByDay = useMemo(() => {
    const out: Record<string, JournalEntry[]> = {};
    for (const entry of entries) {
      const key = entry.date;
      if (!out[key]) out[key] = [];
      out[key].push(entry);
    }
    return out;
  }, [entries]);

  const conceptionDate = user?.conceptionDate ?? undefined;

  const monthLabel = monthDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

  const goPrevMonth = useCallback(() => {
    setMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);
  const goNextMonth = useCallback(() => {
    setMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleSelectDay = useCallback((d: Date) => {
    setSelectedDate(d);
  }, []);

  const handleAddVisit = useCallback(() => {
    if (!selectedDate) return;
    setPendingDate(selectedDate);
  }, [selectedDate]);

  const handleSheetCancel = useCallback(() => setPendingDate(null), []);

  const handleSheetSubmit = useCallback(async (payload: ExamSubmitPayload) => {
    if (!pendingDate) return;
    setPendingDate(null);

    const title = payload.name?.trim() || 'Wizyta';

    const eventId = await createExamEvent({
      title: `Badanie: ${title}`,
      start: payload.start,
      end: payload.end,
      doctor: payload.doctor,
      location: payload.location,
      notes: payload.notes,
    });

    if (!eventId) {
      Alert.alert('Brak wydarzenia w kalendarzu', 'Nie udało się dodać wydarzenia. Wpis trafi tylko do dziennika.');
    }

    try {
      const wd = conceptionDate ? getPregnancyWeekAndDay(conceptionDate, payload.start) : null;
      await addJournalEntry({
        type: 'exam',
        title,
        date: toIsoDate(payload.start),
        week: wd?.week,
        notes: payload.notes,
        doctor: payload.doctor,
        location: payload.location,
      });
      await reload();
      setSelectedDate(new Date(payload.start.getFullYear(), payload.start.getMonth(), payload.start.getDate()));
      setMonthDate(startOfMonth(payload.start));
    } catch (err: unknown) {
      logError('JournalCalendarView.addJournalEntry', err);
    }
  }, [pendingDate, conceptionDate, reload]);

  const selectedIso = selectedDate ? toIsoDate(selectedDate) : null;
  const selectedEntries = selectedIso ? (entriesByDay[selectedIso] ?? []) : [];
  const selectedWeekDay = selectedDate && conceptionDate ? getPregnancyWeekAndDay(conceptionDate, selectedDate) : null;

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
      <View style={s.monthNav}>
        <TouchableOpacity onPress={goPrevMonth} accessibilityRole="button" accessibilityLabel="Poprzedni miesiąc" style={s.navBtn}>
          <Icon name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={goNextMonth} accessibilityRole="button" accessibilityLabel="Następny miesiąc" style={s.navBtn}>
          <Icon name="chevron-right" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <CalendarMonthGrid
        monthDate={monthDate}
        selectedDate={selectedDate}
        entriesByDay={entriesByDay}
        conceptionDate={conceptionDate}
        onSelectDay={handleSelectDay}
      />

      {selectedDate ? (
        <CalendarDayDetail
          date={selectedDate}
          entries={selectedEntries}
          weekDay={selectedWeekDay}
          onAddVisit={handleAddVisit}
          onEntryPress={(id) => onEntryPress?.(id)}
        />
      ) : null}

      {pendingDate ? (
        <AddExamSheet
          visible
          examName=""
          editableName
          week={(() => {
            const wd = conceptionDate ? getPregnancyWeekAndDay(conceptionDate, pendingDate) : null;
            return wd?.week ?? 0;
          })()}
          defaultDate={pendingDate}
          onCancel={handleSheetCancel}
          onSubmit={handleSheetSubmit}
        />
      ) : null}
    </ScrollView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: theme.spacing.xl },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  navBtn: { padding: theme.spacing.xs },
  monthLabel: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fonts.semibold,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
});
