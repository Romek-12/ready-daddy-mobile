import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getPregnancyWeekAndDay, formatWeekDay } from '../../utils/pregnancyWeek';
import type { JournalEntry } from '../../types/journal.types';
import type { Theme } from '../../theme';

interface Props {
  monthDate: Date;
  selectedDate: Date | null;
  entriesByDay: Record<string, JournalEntry[]>;
  conceptionDate?: string;
  onSelectDay: (date: Date) => void;
}

const WEEKDAY_HEADERS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Returns the Monday on-or-before the 1st day of the given month.
 * (PL convention: weeks start Monday.)
 */
function gridStart(monthDate: Date): Date {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  // JS getDay: 0=Sunday..6=Saturday. We want Monday (1) as start.
  const dow = first.getDay();
  const offsetToMonday = dow === 0 ? 6 : dow - 1; // Sunday → 6 days back; otherwise (dow - 1) days back
  const start = new Date(first);
  start.setDate(first.getDate() - offsetToMonday);
  return start;
}

export default function CalendarMonthGrid({ monthDate, selectedDate, entriesByDay, conceptionDate, onSelectDay }: Props) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  const cells = useMemo(() => {
    const start = gridStart(monthDate);
    const out: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push(d);
    }
    return out;
  }, [monthDate]);

  const today = new Date();
  const currentMonth = monthDate.getMonth();

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        {WEEKDAY_HEADERS.map(label => (
          <Text key={label} style={s.headerLabel}>{label}</Text>
        ))}
      </View>
      <View style={s.grid}>
        {cells.map(date => {
          const iso = toIsoDate(date);
          const inCurrentMonth = date.getMonth() === currentMonth;
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const hasEntries = (entriesByDay[iso]?.length ?? 0) > 0;
          const wd = conceptionDate ? getPregnancyWeekAndDay(conceptionDate, date) : null;

          return (
            <TouchableOpacity
              key={iso}
              testID={`day-cell-${iso}`}
              style={s.cell}
              onPress={() => onSelectDay(date)}
              accessibilityRole="button"
              accessibilityLabel={`Dzień ${date.getDate()}${wd ? `, ${formatWeekDay(wd)}` : ''}`}
              accessibilityState={{ selected: isSelected }}
            >
              <View style={[
                s.dayNumberWrap,
                isSelected && s.dayNumberWrapSelected,
                !isSelected && isToday && s.dayNumberWrapToday,
              ]}>
                <Text style={[
                  s.dayNumber,
                  !inCurrentMonth && s.dayNumberMuted,
                  isSelected && s.dayNumberSelected,
                ]}>
                  {date.getDate()}
                </Text>
              </View>
              {wd ? (
                <Text testID={`day-cell-${iso}-weekday`} style={s.weekDay}>{formatWeekDay(wd)}</Text>
              ) : (
                <Text style={s.weekDayPlaceholder} />
              )}
              {hasEntries ? <View testID={`day-cell-${iso}-dot`} style={s.dot} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { paddingHorizontal: theme.spacing.sm },
  headerRow: { flexDirection: 'row', paddingVertical: theme.spacing.xs },
  headerLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.medium,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    height: 56,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  dayNumberWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberWrapSelected: { backgroundColor: theme.colors.primary },
  dayNumberWrapToday: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  dayNumber: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
  },
  dayNumberMuted: { color: theme.colors.textMuted },
  dayNumberSelected: { color: theme.colors.background, fontWeight: theme.fontWeight.bold },
  weekDay: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  weekDayPlaceholder: {
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
});
