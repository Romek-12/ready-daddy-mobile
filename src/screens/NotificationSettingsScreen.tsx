import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDays, format, differenceInDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { useBadgeContext } from '../context/BadgeContext';
import { checkNotificationsBadge } from '../services/gamification/BadgeChecker';
import Icon from '../components/Icon';
import GlassCard from '../components/ui/GlassCard';
import AuroraBackground from '../components/ui/AuroraBackground';
import { PREGNANCY_DAYS, TAB_BAR_HEIGHT } from '../constants';
import type { Theme } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'NotificationSettings'>;

function getDueDateFromConception(conceptionDate: string): Date {
  return addDays(new Date(conceptionDate), PREGNANCY_DAYS);
}

function getNextNotificationInfo(
  dueDate: Date,
  currentWeek: number
): { label: string; daysLeft: number } | null {
  const today = new Date();
  for (let w = Math.max(currentWeek, 1); w <= 40; w++) {
    const weeksFromDue = 40 - w;
    const weekStart = addDays(dueDate, -(weeksFromDue * 7));
    const dayOf = new Date(weekStart);
    dayOf.setHours(9, 0, 0, 0);
    const diff = differenceInDays(dayOf, today);
    if (diff >= 0) {
      return {
        label: `Tydzień ${w}`,
        daysLeft: diff,
      };
    }
  }
  return null;
}

export default function NotificationSettingsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { settings, loading, enable, disable } = useNotifications();
  const { queueBadgeUnlock } = useBadgeContext();
  const s = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);

  const [toggling, setToggling] = useState(false);

  const dueDate = user?.conceptionDate
    ? getDueDateFromConception(user.conceptionDate)
    : null;

  const dueDateFormatted = dueDate
    ? format(dueDate, 'd MMMM yyyy', { locale: pl })
    : 'Brak daty porodu';

  // Oblicz aktualny tydzień ciąży
  const currentWeek = user?.conceptionDate
    ? Math.floor(differenceInDays(new Date(), new Date(user.conceptionDate)) / 7) + 1
    : 1;

  const nextNotif = dueDate ? getNextNotificationInfo(dueDate, currentWeek) : null;

  const handleToggle = async (value: boolean) => {
    if (!dueDate) {
      Alert.alert(
        'Brak daty porodu',
        'Ustaw datę poczęcia w ustawieniach profilu, żeby korzystać z powiadomień.',
      );
      return;
    }
    setToggling(true);
    if (value) {
      const success = await enable(dueDate);
      if (success) {
        if (user) {
          const badgeId = await checkNotificationsBadge(user.id);
          if (badgeId) queueBadgeUnlock(badgeId);
        }
      } else {
        Alert.alert(
          'Brak uprawnień',
          'Zezwól aplikacji na wysyłanie powiadomień w ustawieniach telefonu.',
        );
      }
    } else {
      await disable();
    }
    setToggling(false);
  };

  if (loading) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <AuroraBackground>
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Powiadomienia</Text>
        <View style={s.backBtn} />
      </View>

      {/* Toggle główny */}
      <GlassCard style={s.card}>
        <View style={s.row}>
          <View style={s.rowLeft}>
            <Icon name="notifications" size={24} color={theme.colors.primary} />
            <View style={s.rowText}>
              <Text style={s.rowTitle}>Powiadomienia tygodniowe</Text>
              <Text style={s.rowSub}>
                Informacja o nowym tygodniu ciąży i zapowiedź 3 dni wcześniej
              </Text>
            </View>
          </View>
          {toggling ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Switch
              value={settings?.enabled ?? false}
              onValueChange={handleToggle}
              trackColor={{ false: theme.colors.cardBorder, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          )}
        </View>
      </GlassCard>

      {/* Info: data porodu */}
      <GlassCard style={s.card}>
        <View style={s.row}>
          <Icon name="date-range" size={24} color={theme.colors.accent} />
          <View style={s.rowText}>
            <Text style={s.rowTitle}>Obliczony termin porodu</Text>
            <Text style={s.rowSub}>{dueDateFormatted}</Text>
          </View>
        </View>
      </GlassCard>

      {/* Następne powiadomienie */}
      {settings?.enabled && nextNotif && (
        <View style={[s.card, s.nextCard]}>
          <Icon name="notifications" size={20} color={theme.colors.primary} />
          <Text style={s.nextText}>
            Następne powiadomienie:{' '}
            <Text style={s.nextBold}>{nextNotif.label}</Text>
            {nextNotif.daysLeft === 0
              ? ' — dzisiaj!'
              : ` za ${nextNotif.daysLeft} ${nextNotif.daysLeft === 1 ? 'dzień' : 'dni'}`}
          </Text>
        </View>
      )}

      {/* Opis działania */}
      <View style={s.infoBox}>
        <Icon name="info" size={16} color={theme.colors.textMuted} />
        <Text style={s.infoText}>
          Powiadomienia są zaplanowane lokalnie na Twoim urządzeniu na podstawie obliczonego
          terminu porodu. Wymagają uprawnień systemowych i działają bez połączenia z internetem.
        </Text>
      </View>
    </View>
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme, topInset: number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: topInset + 16,
      paddingBottom: theme.spacing.md,
      backgroundColor: 'transparent',
    },
    headerTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    backBtn: {
      padding: theme.spacing.sm,
      width: 40,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    rowLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    rowText: { flex: 1 },
    rowTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
    },
    rowSub: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    nextCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.primary + '15',
      borderColor: theme.colors.primary + '40',
    },
    nextText: {
      flex: 1,
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
    },
    nextBold: {
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.primary,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.xl,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
    },
    infoText: {
      flex: 1,
      fontSize: theme.fontSize.xs,
      color: theme.colors.textMuted,
      lineHeight: 18,
    },
  });
