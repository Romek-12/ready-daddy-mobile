import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../hooks/useJournal';
import { useCurrentWeek } from '../hooks/useAppData';
import { addCalendarEvent } from '../services/calendar/CalendarService';
import Icon from '../components/Icon';
import type { Theme } from '../theme';
import type { AppNavigation } from '../types/navigation';
import { logError } from '../utils/logError';

const DURATION_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1h', value: 60 },
  { label: '2h', value: 120 },
];

export default function AddVisitScreen({ navigation }: { navigation: AppNavigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);
  const { user } = useAuth();
  const { add } = useJournal();
  const { data } = useCurrentWeek(user?.conceptionDate);

  const defaultWeek = data?.currentWeek ? String(data.currentWeek + 1) : '';

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [week, setWeek] = useState(defaultWeek);
  const [doctor, setDoctor] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (data?.currentWeek && !week) {
      setWeek(String(data.currentWeek + 1));
    }
  }, [data?.currentWeek]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Brak tytułu', 'Podaj tytuł wizyty.');
      return;
    }

    setSaving(true);
    try {
      const eventId = await addCalendarEvent({
        title: title.trim(),
        date,
        time: time.trim() || undefined,
        durationMinutes: duration,
        location: location.trim() || undefined,
        doctor: doctor.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (eventId === null) {
        Alert.alert(
          'Brak dostępu do kalendarza',
          'Wizyta zostanie zapisana tylko w dzienniku.',
          [{ text: 'OK' }],
        );
      }

      const weekNum = week.trim() ? parseInt(week, 10) : undefined;
      await add({
        type: 'visit',
        title: title.trim(),
        date,
        week: weekNum,
        doctor: doctor.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      navigation.goBack();
    } catch (err: unknown) {
      logError('AddVisitScreen.handleSave', err);
      Alert.alert('Błąd', 'Nie udało się zapisać wizyty.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Nowa wizyta</Text>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.background} />
          ) : (
            <Text style={s.saveBtnLabel}>Zapisz</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.label}>Tytuł *</Text>
        <TextInput
          style={s.input}
          value={title}
          onChangeText={setTitle}
          placeholder="np. Wizyta u ginekologa, USG morfologiczne..."
          placeholderTextColor={theme.colors.textMuted}
          maxLength={100}
        />

        <View style={s.row}>
          <View style={s.rowHalf}>
            <Text style={s.label}>Data</Text>
            <TextInput
              style={s.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
          <View style={s.rowHalf}>
            <Text style={s.label}>Godzina</Text>
            <TextInput
              style={s.input}
              value={time}
              onChangeText={setTime}
              placeholder="np. 14:30"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
        </View>

        <Text style={s.label}>Czas trwania</Text>
        <View style={s.chipRow}>
          {DURATION_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[s.chip, duration === opt.value && s.chipActive]}
              onPress={() => setDuration(opt.value)}
              activeOpacity={0.75}
            >
              <Text style={[s.chipLabel, duration === opt.value && s.chipLabelActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Tydzień ciąży (opcjonalnie)</Text>
        <TextInput
          style={s.input}
          value={week}
          onChangeText={setWeek}
          placeholder="np. 20"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="number-pad"
          maxLength={2}
        />

        <Text style={s.label}>Lekarz (opcjonalnie)</Text>
        <TextInput
          style={s.input}
          value={doctor}
          onChangeText={setDoctor}
          placeholder="np. dr Anna Kowalska"
          placeholderTextColor={theme.colors.textMuted}
          maxLength={80}
        />

        <Text style={s.label}>Placówka (opcjonalnie)</Text>
        <TextInput
          style={s.input}
          value={location}
          onChangeText={setLocation}
          placeholder="np. Centrum Medyczne Medicover"
          placeholderTextColor={theme.colors.textMuted}
          maxLength={100}
        />

        <Text style={s.label}>Notatki (opcjonalnie)</Text>
        <TextInput
          style={[s.input, s.inputMultiline]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Pytania do lekarza, wyniki, obserwacje..."
          placeholderTextColor={theme.colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={1000}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: Theme, topInset: number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
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
    saveBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: theme.borderRadius.full,
      minWidth: 72,
      alignItems: 'center',
    },
    saveBtnLabel: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.background,
    },
    scroll: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 48,
      gap: 6,
    },
    label: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.textSecondary,
      marginTop: 12,
      marginBottom: 4,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 12,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    inputMultiline: {
      minHeight: 100,
      paddingTop: 12,
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    rowHalf: { flex: 1 },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
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
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.textSecondary,
    },
    chipLabelActive: { color: theme.colors.background },
  });
