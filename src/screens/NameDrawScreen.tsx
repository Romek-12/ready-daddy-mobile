import React, { useMemo, useState } from 'react';
import {
  Alert,
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
import Icon from '../components/Icon';
import AuroraBackground from '../components/ui/AuroraBackground';
import NameDrawModal from '../components/NameDrawModal';
import GlassCard from '../components/ui/GlassCard';
import GlowPill from '../components/ui/GlowPill';
import type { Theme } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../types/navigation';
import { NAME_DRAW_MAX_NAME_LENGTH, NAME_DRAW_SLOTS } from '../constants';

type Props = NativeStackScreenProps<HomeStackParamList, 'NameDraw'>;

export default function NameDrawScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);

  const { user, updateUser } = useAuth();
  const storage = useNameDrawStorage();

  const [isFav, setIsFav] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPool, setModalPool] = useState<string[]>([]);
  const [modalResult, setModalResult] = useState('');
  const [saving, setSaving] = useState(false);

  const allNames = [...storage.names.mama, ...storage.names.tata];
  const canDraw = allNames.some(n => n.trim().length > 0);

  const handleDraw = () => {
    const pool = allNames.map(n => n.trim()).filter(n => n.length > 0);
    const result = pickRandomFromPool(pool);
    if (!result) return;
    storage.setLastResult(result);
    setModalPool(pool);
    setModalResult(result);
    setModalVisible(true);
  };

  const handleRedraw = () => {
    const pool = allNames.map(n => n.trim()).filter(n => n.length > 0);
    const result = pickRandomFromPool(pool);
    if (!result) return;
    storage.setLastResult(result);
    setModalPool(pool);
    setModalResult(result);
  };

  const handleSave = async (name: string) => {
    if (!user) return;
    try {
      setSaving(true);
      const decision = computeSaveSlot({
        babyName1: user.babyName1,
        babyName2: user.babyName2,
        nextSlot: storage.nextSlot,
      });
      const update =
        decision.slot === 1 ? { babyName1: name } : { babyName2: name };
      await api.updateProfile(user.id, update);
      updateUser(update);
      if (decision.advanceNextSlot) storage.advanceSlot();
      setModalVisible(false);
      Alert.alert('Zapisano ✓', `Imię "${name}" zostało zapisane jako imię dziecka.`);
    } catch (err: unknown) {
      logError('NameDrawScreen.handleSave', err);
      Alert.alert('Błąd', 'Nie udało się zapisać imienia.');
    } finally {
      setSaving(false);
    }
  };

  const renderColumn = (column: 'mama' | 'tata', label: string, emoji: string) => (
    <View style={s.col}>
      <Text style={s.colHeader}>
        {label} {emoji}
      </Text>
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
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Wróć"
        >
          <Icon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Wybór imienia</Text>
        <View style={s.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <GlassCard elevated style={s.featured}>
          <View style={s.featuredBlob} pointerEvents="none" />
          <GlowPill label="Wylosowane" variant="violet" />
          <Text style={s.featuredName}>{storage.lastResult ?? '—'}</Text>
          <TouchableOpacity onPress={() => setIsFav(v => !v)} style={s.heartBtn} accessibilityRole="button" accessibilityLabel="Ulubione">
            <Icon name="heart" size={22} color={isFav ? theme.colors.primary : theme.colors.textMuted} />
          </TouchableOpacity>
        </GlassCard>

        <Text style={s.intro}>
          Wpiszcie po 5 imion i wylosujcie jedno dla maluszka.
        </Text>

        <View style={s.columns}>
          {renderColumn('mama', 'Mama', '👩')}
          {renderColumn('tata', 'Tata', '👨')}
        </View>

        <TouchableOpacity
          style={[s.drawBtn, !canDraw && s.drawBtnDisabled]}
          onPress={handleDraw}
          disabled={!canDraw}
          accessibilityRole="button"
          accessibilityLabel="Losuj imię"
        >
          <Text style={s.drawBtnText}>Losuj 🎲</Text>
        </TouchableOpacity>

        {storage.lastResult && (
          <View style={s.lastRow}>
            <Text style={s.lastText}>
              Ostatnie losowanie: <Text style={s.lastName}>{storage.lastResult}</Text>
            </Text>
            <TouchableOpacity onPress={storage.clearLastResult} accessibilityRole="button">
              <Text style={s.clearLink}>wyczyść</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <NameDrawModal
        visible={modalVisible}
        pool={modalPool}
        result={modalResult}
        saving={saving}
        onRequestRedraw={handleRedraw}
        onSave={handleSave}
        onDismiss={() => setModalVisible(false)}
      />
    </KeyboardAvoidingView>
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme, topInset: number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: topInset + 8,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    backBtn: { padding: 8 },
    headerTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
    },
    headerSpacer: { width: 40 },
    scroll: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 32,
    },
    intro: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
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
    drawBtn: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    drawBtnDisabled: { opacity: 0.4 },
    drawBtnText: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.background,
    },
    lastRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    lastText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    lastName: {
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    clearLink: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textMuted,
      textDecorationLine: 'underline',
    },
    featured: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, overflow: 'hidden' },
    featuredBlob: { position: 'absolute', width: 220, height: 220, borderRadius: 110, top: -80, right: -60, backgroundColor: theme.colors.violetSoft, opacity: 0.6 },
    featuredName: { fontFamily: theme.fonts.title, fontSize: theme.fontSize.xxl, color: theme.colors.text, marginTop: 8 },
    heartBtn: { position: 'absolute', top: theme.spacing.md, right: theme.spacing.md },
  });
