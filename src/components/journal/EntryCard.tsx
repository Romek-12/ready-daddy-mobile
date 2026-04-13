import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../Icon';
import type { JournalEntry, EntryType } from '../../types/journal.types';
import type { Theme } from '../../theme';

const ENTRY_CONFIG: Record<EntryType, { icon: string; label: string; color: (theme: Theme) => string }> = {
  visit:     { icon: 'hospital',    label: 'Wizyta',      color: t => t.colors.checkups },
  exam:      { icon: 'science',     label: 'Badanie',     color: t => t.colors.primary },
  milestone: { icon: 'tip',         label: 'Osiągnięcie', color: t => t.colors.accent },
  note:      { icon: 'info',        label: 'Notatka',     color: t => t.colors.textSecondary },
};

interface Props {
  entry: JournalEntry;
  onPress: () => void;
}

export default function EntryCard({ entry, onPress }: Props) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const config = ENTRY_CONFIG[entry.type];
  const color = config.color(theme);
  const firstPhoto = entry.photos?.[0];

  const displayDate = new Date(entry.date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[s.colorBar, { backgroundColor: color }]} />
      <View style={s.content}>
        <View style={s.row}>
          <View style={[s.badge, { backgroundColor: color + '20' }]}>
            <Icon name={config.icon} size={14} color={color} />
            <Text style={[s.badgeLabel, { color }]}>{config.label}</Text>
          </View>
          {entry.week !== undefined && (
            <Text style={s.week}>Tydzień {entry.week}</Text>
          )}
        </View>
        <Text style={s.title} numberOfLines={2}>{entry.title}</Text>
        <View style={s.meta}>
          <Icon name="date-range" size={13} color={theme.colors.textMuted} />
          <Text style={s.date}>{displayDate}</Text>
          {entry.doctor ? (
            <>
              <Text style={s.dot}>·</Text>
              <Text style={s.date} numberOfLines={1}>{entry.doctor}</Text>
            </>
          ) : null}
        </View>
        {entry.notes ? (
          <Text style={s.notes} numberOfLines={2}>{entry.notes}</Text>
        ) : null}
      </View>
      {firstPhoto ? (
        <Image source={{ uri: firstPhoto }} style={s.thumbnail} />
      ) : null}
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      overflow: 'hidden',
    },
    colorBar: {
      width: 4,
    },
    content: {
      flex: 1,
      padding: theme.spacing.md,
      gap: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: theme.borderRadius.full,
    },
    badgeLabel: {
      fontSize: 11,
      fontWeight: '600',
    },
    week: {
      fontSize: 11,
      color: theme.colors.textMuted,
    },
    title: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    date: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textMuted,
    },
    dot: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textMuted,
    },
    notes: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      lineHeight: 17,
      marginTop: 2,
    },
    thumbnail: {
      width: 72,
      height: '100%' as unknown as number,
    },
  });
