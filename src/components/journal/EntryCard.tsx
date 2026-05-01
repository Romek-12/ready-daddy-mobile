import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../Icon';
import GlassCard from '../ui/GlassCard';
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
  const photos = (entry.photos ?? []).slice(0, 3);

  const displayDate = new Date(entry.date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={s.wrap}>
      <GlassCard style={s.card}>
        <View style={[s.colorBar, { backgroundColor: color }]} />
        <View style={s.content}>
          <View style={s.row}>
            <Text style={s.date}>{displayDate}</Text>
            <Text style={s.title} numberOfLines={1}>{entry.title}</Text>
          </View>
          <View style={s.tagRow}>
            <View style={[s.tagChip, { borderColor: color }]}>
              <Text style={[s.tagLabel, { color }]}>{config.label}</Text>
            </View>
            {entry.week !== undefined && (
              <Text style={s.week}>Tydzień {entry.week}</Text>
            )}
          </View>
          {photos.length > 0 ? (
            <View style={s.photoRow}>
              {photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={s.photoThumb} />
              ))}
            </View>
          ) : null}
          {entry.notes ? (
            <Text style={s.notes} numberOfLines={2}>{entry.notes}</Text>
          ) : null}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    card: {
      flexDirection: 'row',
      overflow: 'hidden',
      padding: 0,
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
    tagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    tagChip: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      borderWidth: 1,
    },
    tagLabel: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    photoRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    photoThumb: {
      width: 56,
      height: 56,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
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
      fontFamily: theme.fonts.medium,
      letterSpacing: 0.5,
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
