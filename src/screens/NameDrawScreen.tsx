import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNameDrawStorage } from '../hooks/useNameDrawStorage';
import { pickRandomFromPool, computeSaveSlot } from '../utils/nameDraw';
import { api } from '../services/api';
import { logError } from '../utils/logError';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import AuroraBackground from '../components/ui/AuroraBackground';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';
import Kicker from '../components/ui/Kicker';
import type { Theme } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../types/navigation';
import {
  NAME_DRAW_MAX_NAME_LENGTH,
  NAME_DRAW_SLOTS,
  NAME_DRAW_ANIMATION_TOTAL_MS,
  NAME_DRAW_FAST_TICK_MS,
} from '../constants';
import { Alert } from 'react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'NameDraw'>;

export default function NameDrawScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);

  const { user, updateUser } = useAuth();
  const storage = useNameDrawStorage();

  const [isAnimating, setIsAnimating] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(storage.lastResult ?? null);
  const [saving, setSaving] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const actionsOpacity = useRef(new Animated.Value(storage.lastResult ? 1 : 0)).current;

  const allNames = [...storage.names.mama, ...storage.names.tata];
  const canDraw = allNames.some(n => n.trim().length > 0);

  const runAnimation = (pool: string[], result: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setIsAnimating(true);
    actionsOpacity.setValue(0);
    scale.setValue(1);

    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      setDisplayName(result);
      setIsAnimating(false);
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.08, useNativeDriver: true, friction: 4 }),
        Animated.spring(scale, { toValue: 1.0, useNativeDriver: true, friction: 6 }),
      ]).start();
      Animated.timing(actionsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    };

    AccessibilityInfo.isReduceMotionEnabled().catch(() => false).then(reduce => {
      if (cancelled) return;
      if (reduce || pool.length === 0) {
        setDisplayName(result);
        finish();
        return;
      }

      const startedAt = Date.now();
      const fastUntil = startedAt + Math.max(0, NAME_DRAW_ANIMATION_TOTAL_MS - 500);
      const endAt = startedAt + NAME_DRAW_ANIMATION_TOTAL_MS;

      const tick = () => {
        if (cancelled) return;
        const now = Date.now();
        if (now >= endAt) { finish(); return; }

        setDisplayName(pool[Math.floor(Math.random() * pool.length)]);

        const nextDelay = now < fastUntil
          ? NAME_DRAW_FAST_TICK_MS
          : Math.max(NAME_DRAW_FAST_TICK_MS, Math.floor((endAt - now) / 3));
        timeoutRef.current = setTimeout(tick, nextDelay);
      };

      tick();
    });

    return () => { cancelled = true; if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  };

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const handleDraw = () => {
    const pool = allNames.map(n => n.trim()).filter(n => n.length > 0);
    const result = pickRandomFromPool(pool);
    if (!result) return;
    storage.setLastResult(result);
    runAnimation(pool, result);
  };

  const handleRedraw = () => {
    const pool = allNames.map(n => n.trim()).filter(n => n.length > 0);
    const result = pickRandomFromPool(pool);
    if (!result) return;
    storage.setLastResult(result);
    runAnimation(pool, result);
  };

  const handleSave = async () => {
    if (!user || !storage.lastResult) return;
    try {
      setSaving(true);
      const decision = computeSaveSlot({
        babyName1: user.babyName1,
        babyName2: user.babyName2,
        nextSlot: storage.nextSlot,
      });
      const update = decision.slot === 1 ? { babyName1: storage.lastResult } : { babyName2: storage.lastResult };
      await api.updateProfile(user.id, update);
      updateUser(update);
      if (decision.advanceNextSlot) storage.advanceSlot();
      Alert.alert('Zapisano ✓', `Imię "${storage.lastResult}" zostało zapisane jako imię dziecka.`);
    } catch (err: unknown) {
      logError('NameDrawScreen.handleSave', err);
      Alert.alert('Błąd', 'Nie udało się zapisać imienia.');
    } finally {
      setSaving(false);
    }
  };

  const renderColumn = (column: 'mama' | 'tata', label: string, emoji: string) => (
    <View style={s.col}>
      <Text style={s.colHeader}>{label} {emoji}</Text>
      {Array.from({ length: NAME_DRAW_SLOTS }).map((_, i) => (
        <TextInput
          key={i}
          style={s.input}
          value={storage.names[column][i] ?? ''}
          onChangeText={v => storage.setName(column, i, v)}
          placeholder="Imię"
          placeholderTextColor={theme.colors.textMuted}
          maxLength={NAME_DRAW_MAX_NAME_LENGTH}
          autoCapitalize="words"
          autoCorrect={false}
        />
      ))}
    </View>
  );

  return (
    <AuroraBackground>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.topBar}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Wróć"
          >
            <Icon name="close" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={s.header}>
          <Kicker>Imię dla maluszka</Kicker>
          <View style={s.titleStack}>
            <Text style={s.title}>Wybór </Text>
            <GradientText style={s.title}>imienia.</GradientText>
          </View>
          <Text style={s.subtitle}>Wpiszcie po 5 imion i wylosujcie jedno dla maluszka.</Text>
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Featured card — animacja dzieje się tutaj */}
          <GlassCard elevated style={s.featured}>
            <Animated.View style={{ transform: [{ scale }], alignItems: 'center', width: '100%' }}>
              {displayName ? (
                <GradientText
                  style={s.featuredName}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.4}
                >
                  {displayName}
                </GradientText>
              ) : (
                <Text style={s.featuredPlaceholder}>—</Text>
              )}
            </Animated.View>
          </GlassCard>

          {/* Przyciski pojawiają się po zakończeniu animacji */}
          <Animated.View style={[s.actions, { opacity: actionsOpacity }]} pointerEvents={isAnimating ? 'none' : 'auto'}>
            <TouchableOpacity
              style={s.btnSecondary}
              onPress={handleRedraw}
              disabled={isAnimating || saving || !canDraw}
              accessibilityRole="button"
            >
              <Text style={s.btnSecondaryText}>Losuj ponownie 🎲</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.btnPrimary, (isAnimating || saving) && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={isAnimating || saving || !storage.lastResult}
              accessibilityRole="button"
            >
              <Text style={s.btnPrimaryText}>
                {saving ? 'Zapisuję…' : 'Zapisz jako imię dziecka'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={s.columns}>
            {renderColumn('mama', 'Mama', '👩')}
            {renderColumn('tata', 'Tata', '👨')}
          </View>

          {/* Przycisk Losuj */}
          <TouchableOpacity
            style={[s.drawBtnWrap, (!canDraw || isAnimating) && s.drawBtnDisabled]}
            onPress={handleDraw}
            disabled={!canDraw || isAnimating}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Losuj imię"
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.violet]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.drawBtn}
            >
              <Text style={s.drawBtnText}>Losuj 🎲</Text>
            </LinearGradient>
          </TouchableOpacity>

          {storage.lastResult && !isAnimating && (
            <View style={s.lastRow}>
              <Text style={s.lastText}>
                Ostatnie losowanie: <Text style={s.lastName}>{storage.lastResult}</Text>
              </Text>
              <TouchableOpacity
                onPress={() => { storage.clearLastResult(); setDisplayName(null); actionsOpacity.setValue(0); }}
                accessibilityRole="button"
              >
                <Text style={s.clearLink}>wyczyść</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme, topInset: number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    topBar: {
      paddingTop: topInset + 8,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 4,
      alignItems: 'flex-end',
    },
    backBtn: { padding: 8 },
    header: {
      alignItems: 'flex-start',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      gap: 8,
    },
    titleStack: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' },
    title: {
      fontSize: theme.fontSize.hero,
      fontFamily: theme.fonts.title,
      fontVariationSettings: '"wght" 700',
      color: theme.colors.text,
      letterSpacing: 1,
    },
    subtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, marginTop: 4 },
    scroll: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 32,
    },
    featured: {
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.md,
      alignItems: 'center',
      minHeight: 100,
      justifyContent: 'center',
    },
    featuredName: {
      fontFamily: theme.fonts.title,
      fontVariationSettings: '"wght" 700',
      fontSize: 40,
      textAlign: 'center',
      width: '100%',
    },
    featuredPlaceholder: {
      fontSize: 40,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    actions: {
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    btnPrimary: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
    },
    btnPrimaryText: {
      color: theme.colors.black,
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
    },
    btnSecondary: {
      borderWidth: 1.5,
      borderColor: theme.colors.cardBorder,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
    },
    btnSecondaryText: {
      color: theme.colors.text,
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
    },
    columns: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    col: { flex: 1 },
    colHeader: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 10,
      marginBottom: theme.spacing.sm,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    drawBtnWrap: {
      borderRadius: theme.borderRadius.full,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.5,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    drawBtn: {
      paddingVertical: 16,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
    },
    drawBtnDisabled: { opacity: 0.4 },
    drawBtnText: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.black,
      letterSpacing: 0.5,
    },
    lastRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    lastText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
    lastName: { fontWeight: theme.fontWeight.bold, color: theme.colors.text },
    clearLink: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textMuted,
      textDecorationLine: 'underline',
    },
  });
