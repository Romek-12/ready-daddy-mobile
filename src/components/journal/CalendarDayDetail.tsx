import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import EntryCard from './EntryCard';
import Icon from '../Icon';
import GlassCard from '../ui/GlassCard';
import { formatWeekDay, type WeekAndDay } from '../../utils/pregnancyWeek';
import type { JournalEntry } from '../../types/journal.types';
import type { Theme } from '../../theme';

interface Props {
  date: Date;
  entries: JournalEntry[];
  weekDay: WeekAndDay | null;
  onAddVisit: () => void;
  onEntryPress: (entryId: string) => void;
}

export default function CalendarDayDetail({ date, entries, weekDay, onAddVisit, onEntryPress }: Props) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  const dateLabel = date.toLocaleDateString('pl-PL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.dateLabel}>{dateLabel}</Text>
        {weekDay ? <Text style={s.weekDayLabel}>· {formatWeekDay(weekDay)}</Text> : null}
      </View>

      {entries.length === 0 ? (
        <GlassCard style={s.empty}>
          <Text style={s.emptyText}>Brak wpisów na ten dzień</Text>
        </GlassCard>
      ) : (
        entries.map(entry => (
          <EntryCard key={entry.id} entry={entry} onPress={() => onEntryPress(entry.id)} />
        ))
      )}

      <TouchableOpacity style={s.addBtn} onPress={onAddVisit} accessibilityRole="button" accessibilityLabel="Dodaj wizytę">
        <Icon name="add" size={18} color={theme.colors.background} />
        <Text style={s.addBtnLabel}>Dodaj wizytę</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, gap: theme.spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginBottom: theme.spacing.xs },
  dateLabel: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },
  weekDayLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, fontFamily: theme.fonts.medium },
  empty: { padding: theme.spacing.md, alignItems: 'center' },
  emptyText: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  addBtnLabel: { color: theme.colors.background, fontWeight: theme.fontWeight.semibold, fontSize: theme.fontSize.md },
});
