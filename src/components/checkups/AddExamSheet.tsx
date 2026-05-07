import React, { useState, useMemo } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../ui/GlassCard';
import AuroraBackground from '../ui/AuroraBackground';
import Icon from '../Icon';
import type { Theme } from '../../theme';

export interface ExamSubmitPayload {
  start: Date;
  end: Date;
  doctor?: string;
  location?: string;
  notes?: string;
}

interface Props {
  visible: boolean;
  examName: string;
  week: number;
  onCancel: () => void;
  onSubmit: (payload: ExamSubmitPayload) => void;
}

const DURATION_OPTIONS = [
  { label: '30 min', minutes: 30 },
  { label: '1 godz.', minutes: 60 },
  { label: '1.5 godz.', minutes: 90 },
  { label: '2 godz.', minutes: 120 },
];

function tomorrowAt9(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
}

export default function AddExamSheet({ visible, examName, week, onCancel, onSubmit }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);

  const [date, setDate] = useState<Date>(tomorrowAt9);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [doctor, setDoctor] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSubmit = () => {
    const start = date;
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    onSubmit({
      start,
      end,
      doctor: doctor.trim() || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const dateLabel = date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeLabel = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'} onRequestClose={onCancel}>
      <AuroraBackground>
        <View style={s.container}>
          <View style={s.header}>
            <TouchableOpacity onPress={onCancel} accessibilityRole="button">
              <Text style={s.headerBtn}>Anuluj</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>Dodaj badanie</Text>
            <TouchableOpacity onPress={handleSubmit} accessibilityRole="button">
              <Text style={[s.headerBtn, s.headerBtnPrimary]}>Zapisz</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.scrollContent}>
            <GlassCard style={s.section}>
              <Text style={s.examName}>{examName}</Text>
              <Text style={s.weekLabel}>Tydzień: {week}</Text>
            </GlassCard>

            <GlassCard style={s.section}>
              <TouchableOpacity style={s.row} onPress={() => setShowDatePicker(true)} accessibilityRole="button" accessibilityLabel="Wybierz datę">
                <Icon name="calendar" size={18} color={theme.colors.primary} />
                <Text style={s.rowLabel}>Data</Text>
                <Text style={s.rowValue}>{dateLabel}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.row} onPress={() => setShowTimePicker(true)} accessibilityRole="button" accessibilityLabel="Wybierz godzinę">
                <Icon name="schedule" size={18} color={theme.colors.primary} />
                <Text style={s.rowLabel}>Godzina</Text>
                <Text style={s.rowValue}>{timeLabel}</Text>
              </TouchableOpacity>

              <View style={s.durationRow}>
                <Text style={s.rowLabel}>Czas trwania</Text>
                <View style={s.durationOptions}>
                  {DURATION_OPTIONS.map(opt => {
                    const active = durationMinutes === opt.minutes;
                    return (
                      <TouchableOpacity
                        key={opt.minutes}
                        onPress={() => setDurationMinutes(opt.minutes)}
                        style={[s.durBtn, active && s.durBtnActive]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: active }}
                      >
                        <Text style={[s.durBtnText, active && s.durBtnTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </GlassCard>

            <GlassCard style={s.section}>
              <TextInput
                style={s.input}
                placeholder="Lekarz (opcjonalne)"
                placeholderTextColor={theme.colors.textMuted}
                value={doctor}
                onChangeText={setDoctor}
              />
              <TextInput
                style={s.input}
                placeholder="Miejsce (opcjonalne)"
                placeholderTextColor={theme.colors.textMuted}
                value={location}
                onChangeText={setLocation}
              />
              <TextInput
                style={[s.input, s.inputMulti]}
                placeholder="Notatka (opcjonalne)"
                placeholderTextColor={theme.colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </GlassCard>

            <Text style={s.reminderInfo}>ℹ Przypomnienia: 2 dni, 1 dzień, 2 godziny przed</Text>
          </ScrollView>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(event, selected) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selected) {
                  const next = new Date(date);
                  next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
                  setDate(next);
                }
              }}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              onChange={(event, selected) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (selected) {
                  const next = new Date(date);
                  next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
                  setDate(next);
                }
              }}
            />
          )}
        </View>
      </AuroraBackground>
    </Modal>
  );
}

const createStyles = (theme: Theme, topInset: number) => StyleSheet.create({
  container: { flex: 1, paddingTop: topInset },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerBtn: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  headerBtnPrimary: { color: theme.colors.primary, fontWeight: theme.fontWeight.semibold },
  headerTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  scrollContent: { padding: theme.spacing.lg, gap: theme.spacing.md },
  section: { padding: theme.spacing.md, gap: theme.spacing.sm },
  examName: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  weekLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  rowLabel: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text },
  rowValue: { fontSize: theme.fontSize.md, color: theme.colors.primary, fontWeight: theme.fontWeight.semibold },
  durationRow: { paddingVertical: theme.spacing.sm, gap: theme.spacing.sm },
  durationOptions: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  durBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  durBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  durBtnText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  durBtnTextActive: { color: theme.colors.background, fontWeight: theme.fontWeight.semibold },
  input: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
    paddingVertical: theme.spacing.sm,
  },
  inputMulti: { minHeight: 60, textAlignVertical: 'top' },
  reminderInfo: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted, textAlign: 'center', marginTop: theme.spacing.sm },
});
