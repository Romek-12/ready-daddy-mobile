import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useJournal } from '../../hooks/useJournal';
import { pickAndSavePhoto, deletePhoto } from '../../services/journal/ImageService';
import Icon from '../../components/Icon';
import type { JournalStackParamList } from '../../types/navigation';
import type { Theme } from '../../theme';
import type { EntryType } from '../../types/journal.types';
import { logError } from '../../utils/logError';

type Props = NativeStackScreenProps<JournalStackParamList, 'AddEntry'>;

const TYPE_OPTIONS: { key: EntryType; label: string; icon: string }[] = [
  { key: 'visit',     label: 'Wizyta',      icon: 'hospital' },
  { key: 'exam',      label: 'Badanie',     icon: 'science' },
  { key: 'milestone', label: 'Osiągnięcie', icon: 'tip' },
  { key: 'note',      label: 'Notatka',     icon: 'info' },
];

export default function AddEntryScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);
  const { entries, add, update } = useJournal();
  const [saving, setSaving] = useState(false);
  const [addingPhoto, setAddingPhoto] = useState(false);

  // Form state
  const [type, setType] = useState<EntryType>('visit');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [week, setWeek] = useState('');
  const [doctor, setDoctor] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const editId = route.params?.entryId;
  const isEdit = Boolean(editId);

  useEffect(() => {
    if (editId) {
      const entry = entries.find(e => e.id === editId);
      if (entry) {
        setType(entry.type);
        setTitle(entry.title);
        setDate(entry.date);
        setWeek(entry.week !== undefined ? String(entry.week) : '');
        setDoctor(entry.doctor ?? '');
        setLocation(entry.location ?? '');
        setNotes(entry.notes ?? '');
        setPhotos(entry.photos ?? []);
      }
    }
  }, [editId, entries]);

  const handleAddPhoto = async () => {
    setAddingPhoto(true);
    try {
      const uri = await pickAndSavePhoto();
      if (uri) setPhotos(prev => [...prev, uri]);
    } catch (err: unknown) {
      logError('AddEntryScreen.handleAddPhoto', err);
    } finally {
      setAddingPhoto(false);
    }
  };

  const handleRemovePhoto = (uri: string) => {
    Alert.alert('Usuń zdjęcie', 'Czy na pewno usunąć to zdjęcie?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          await deletePhoto(uri);
          setPhotos(prev => prev.filter(p => p !== uri));
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Brak tytułu', 'Podaj tytuł wpisu.');
      return;
    }

    setSaving(true);
    try {
      const weekNum = week.trim() ? parseInt(week, 10) : undefined;
      const payload = {
        type,
        title: title.trim(),
        date,
        week: weekNum,
        doctor: doctor.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        photos: photos.length > 0 ? photos : undefined,
      };

      if (isEdit && editId) {
        await update(editId, payload);
      } else {
        await add(payload);
      }
      navigation.goBack();
    } catch (err: unknown) {
      logError('AddEntryScreen.handleSave', err);
      Alert.alert('Błąd', 'Nie udało się zapisać wpisu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{isEdit ? 'Edytuj wpis' : 'Nowy wpis'}</Text>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.background} />
          ) : (
            <Text style={s.saveBtnLabel}>Zapisz</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Type selector */}
        <Text style={s.label}>Typ wpisu</Text>
        <View style={s.typeRow}>
          {TYPE_OPTIONS.map(opt => {
            const isActive = type === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[s.typeChip, isActive && s.typeChipActive]}
                onPress={() => setType(opt.key)}
                activeOpacity={0.75}
              >
                <Icon name={opt.icon} size={16} color={isActive ? theme.colors.background : theme.colors.textSecondary} />
                <Text style={[s.typeLabel, isActive && s.typeLabelActive]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Title */}
        <Text style={s.label}>Tytuł *</Text>
        <TextInput
          style={s.input}
          value={title}
          onChangeText={setTitle}
          placeholder="np. USG morfologiczne, Wizyta u ginekologa..."
          placeholderTextColor={theme.colors.textMuted}
          maxLength={100}
        />

        {/* Date */}
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

        {/* Week */}
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

        {/* Doctor (for visit/exam) */}
        {(type === 'visit' || type === 'exam') && (
          <>
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
          </>
        )}

        {/* Notes */}
        <Text style={s.label}>Notatki (opcjonalnie)</Text>
        <TextInput
          style={[s.input, s.inputMultiline]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Zapisz wyniki, obserwacje, pytania do lekarza..."
          placeholderTextColor={theme.colors.textMuted}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={2000}
        />

        {/* Photos */}
        <Text style={s.label}>Zdjęcia (opcjonalnie)</Text>
        <View style={s.photosRow}>
          {photos.map(uri => (
            <TouchableOpacity key={uri} onLongPress={() => handleRemovePhoto(uri)} activeOpacity={0.85}>
              <Image source={{ uri }} style={s.photoThumb} resizeMode="cover" />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.addPhotoBtn} onPress={handleAddPhoto} disabled={addingPhoto} activeOpacity={0.8}>
            {addingPhoto ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Icon name="photo" size={24} color={theme.colors.textMuted} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={s.photoHint}>Przytrzymaj zdjęcie, aby je usunąć</Text>
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
    typeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    typeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    typeChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    typeLabel: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.textSecondary,
    },
    typeLabelActive: { color: theme.colors.background },
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
      minHeight: 120,
      paddingTop: 12,
    },
    photosRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    photoThumb: {
      width: 72,
      height: 72,
      borderRadius: theme.borderRadius.sm,
    },
    addPhotoBtn: {
      width: 72,
      height: 72,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
    },
    photoHint: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textMuted,
    },
  });
