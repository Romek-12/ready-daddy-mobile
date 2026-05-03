import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import BlobLoader from '../../components/ui/BlobLoader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useJournal } from '../../hooks/useJournal';
import EntryCard from '../../components/journal/EntryCard';
import Icon from '../../components/Icon';
import AuroraBackground from '../../components/ui/AuroraBackground';
import type { JournalStackParamList } from '../../types/navigation';
import type { Theme } from '../../theme';
import { TAB_BAR_HEIGHT } from '../../constants';
import type { EntryType } from '../../types/journal.types';

type Props = NativeStackScreenProps<JournalStackParamList, 'JournalMain'>;

const FILTERS: { key: EntryType | 'all'; label: string }[] = [
  { key: 'all',       label: 'Wszystkie' },
  { key: 'visit',     label: 'Wizyty' },
  { key: 'exam',      label: 'Badania' },
  { key: 'milestone', label: 'Osiągnięcia' },
  { key: 'note',      label: 'Notatki' },
];

export default function JournalScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(theme, insets.top, insets.bottom), [theme, insets.top, insets.bottom]);
  const { entries, loading, reload } = useJournal();
  const [activeFilter, setActiveFilter] = useState<EntryType | 'all'>('all');

  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload]),
  );

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return entries;
    return entries.filter(e => e.type === activeFilter);
  }, [entries, activeFilter]);

  return (
    <AuroraBackground>
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Dziennik</Text>
        <TouchableOpacity
          style={s.addButton}
          onPress={() => navigation.navigate('AddEntry', {})}
          activeOpacity={0.8}
        >
          <Icon name="add" size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.chip, activeFilter === f.key && s.chipActive]}
            onPress={() => setActiveFilter(f.key)}
            activeOpacity={0.75}
          >
            <Text style={[s.chipLabel, activeFilter === f.key && s.chipLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.center}>
          <BlobLoader variant="inline" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.center}>
          <Icon name="journal" size={48} color={theme.colors.textMuted} />
          <Text style={s.empty}>Brak wpisów</Text>
          <Text style={s.emptySub}>Dodaj pierwszą wizytę, badanie lub notatkę</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <EntryCard
              entry={item}
              onPress={() => navigation.navigate('JournalEntry', { entryId: item.id })}
            />
          )}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme, topInset: number, bottomInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: topInset + 16,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      fontFamily: theme.fonts.title,
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      gap: 8,
      flexWrap: 'wrap',
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipLabel: {
      fontSize: theme.fontSize.xs,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.textSecondary,
    },
    chipLabelActive: {
      color: theme.colors.background,
    },
    list: {
      paddingTop: theme.spacing.sm,
      paddingBottom: bottomInset + TAB_BAR_HEIGHT + 16,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: theme.spacing.xl,
    },
    empty: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.textSecondary,
      marginTop: 8,
    },
    emptySub: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
  });
