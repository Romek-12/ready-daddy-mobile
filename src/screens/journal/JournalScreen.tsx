import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RingLoader from '../../components/ui/RingLoader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useJournal } from '../../hooks/useJournal';
import EntryCard from '../../components/journal/EntryCard';
import JournalCalendarView from '../../components/journal/JournalCalendarView';
import Icon from '../../components/Icon';
import AuroraBackground from '../../components/ui/AuroraBackground';
import { logError } from '../../utils/logError';
import type { JournalStackParamList } from '../../types/navigation';
import type { Theme } from '../../theme';
import { TAB_BAR_HEIGHT } from '../../constants';
import type { EntryType } from '../../types/journal.types';

type Props = NativeStackScreenProps<JournalStackParamList, 'JournalMain'>;
type ViewMode = 'list' | 'calendar';

const VIEW_MODE_STORAGE_KEY = 'journal_view_mode';

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
  const [viewMode, setViewMode] = useState<ViewMode | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(VIEW_MODE_STORAGE_KEY)
      .then(raw => {
        setViewMode(raw === 'calendar' ? 'calendar' : 'list');
      })
      .catch((e) => {
        logError('JournalScreen:loadViewMode', e);
        setViewMode('list');
      });
  }, []);

  const switchView = (mode: ViewMode) => {
    setViewMode(mode);
    AsyncStorage.setItem(VIEW_MODE_STORAGE_KEY, mode).catch((e) => logError('JournalScreen:persistViewMode', e));
  };

  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload]),
  );

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return entries;
    return entries.filter(e => e.type === activeFilter);
  }, [entries, activeFilter]);

  if (viewMode === null) {
    return <AuroraBackground><View style={s.container} /></AuroraBackground>;
  }

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

      {/* View toggle */}
      <View style={s.toggleRow}>
        <TouchableOpacity
          style={[s.toggleBtn, viewMode === 'list' && s.toggleBtnActive]}
          onPress={() => switchView('list')}
          accessibilityRole="button"
          accessibilityState={{ selected: viewMode === 'list' }}
          activeOpacity={0.75}
        >
          <Text style={[s.toggleLabel, viewMode === 'list' && s.toggleLabelActive]}>Lista</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.toggleBtn, viewMode === 'calendar' && s.toggleBtnActive]}
          onPress={() => switchView('calendar')}
          accessibilityRole="button"
          accessibilityState={{ selected: viewMode === 'calendar' }}
          activeOpacity={0.75}
        >
          <Text style={[s.toggleLabel, viewMode === 'calendar' && s.toggleLabelActive]}>Kalendarz</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'list' ? (
        <>
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
              <RingLoader size={48} showMonogram={false} />
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
        </>
      ) : (
        <JournalCalendarView
          onEntryPress={(id) => navigation.navigate('JournalEntry', { entryId: id })}
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
      fontVariationSettings: '"wght" 700',
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleRow: {
      flexDirection: 'row',
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: 3,
    },
    toggleBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: theme.borderRadius.full,
    },
    toggleBtnActive: { backgroundColor: theme.colors.primary },
    toggleLabel: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.textSecondary,
    },
    toggleLabelActive: { color: theme.colors.background },
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
