import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
  Modal,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useJournal } from '../../hooks/useJournal';
import Icon from '../../components/Icon';
import type { JournalStackParamList } from '../../types/navigation';
import type { Theme } from '../../theme';
import type { EntryType } from '../../types/journal.types';

type Props = NativeStackScreenProps<JournalStackParamList, 'JournalEntry'>;

const TYPE_LABELS: Record<EntryType, string> = {
  visit: 'Wizyta',
  exam: 'Badanie',
  milestone: 'Osiągnięcie',
  note: 'Notatka',
};

const TYPE_ICONS: Record<EntryType, string> = {
  visit: 'hospital',
  exam: 'science',
  milestone: 'tip',
  note: 'info',
};

export default function JournalEntryScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);
  const { entries, remove } = useJournal();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxVisible, setLightboxVisible] = useState(false);

  const entry = entries.find(e => e.id === route.params.entryId);

  if (!entry) {
    return (
      <View style={s.container}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={s.center}>
          <Text style={s.notFound}>Wpis nie istnieje</Text>
        </View>
      </View>
    );
  }

  const displayDate = new Date(entry.date).toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleDelete = () => {
    Alert.alert(
      'Usuń wpis',
      'Czy na pewno chcesz usunąć ten wpis? Tej operacji nie można cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            await remove(entry.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const iconColor = theme.colors[entry.type === 'visit' ? 'checkups' : entry.type === 'exam' ? 'primary' : entry.type === 'milestone' ? 'accent' : 'textSecondary'];

  return (
    <View style={s.container}>
      {/* Lightbox — fullscreen photo viewer */}
      <Modal
        visible={lightboxVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxVisible(false)}
        statusBarTranslucent
      >
        <StatusBar hidden />
        <View style={s.lightboxBg}>
          <Image
            source={{ uri: entry.photos?.[photoIndex] }}
            style={s.lightboxImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={s.lightboxClose}
            onPress={() => setLightboxVisible(false)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Zamknij podgląd zdjęcia"
          >
            <Text style={s.lightboxCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={s.headerActions}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => navigation.navigate('AddEntry', { entryId: entry.id })}
            activeOpacity={0.7}
          >
            <Icon name="info" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={handleDelete} activeOpacity={0.7}>
            <Icon name="delete" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Type badge */}
        <View style={[s.badge, { backgroundColor: iconColor + '20' }]}>
          <Icon name={TYPE_ICONS[entry.type]} size={16} color={iconColor} />
          <Text style={[s.badgeLabel, { color: iconColor }]}>{TYPE_LABELS[entry.type]}</Text>
        </View>

        <Text style={s.title}>{entry.title}</Text>

        {/* Meta row */}
        <View style={s.metaRow}>
          <Icon name="date-range" size={16} color={theme.colors.textMuted} />
          <Text style={s.metaText}>{displayDate}</Text>
        </View>
        {entry.week !== undefined && (
          <View style={s.metaRow}>
            <Icon name="fetus" size={16} color={theme.colors.textMuted} />
            <Text style={s.metaText}>Tydzień {entry.week} ciąży</Text>
          </View>
        )}
        {entry.doctor ? (
          <View style={s.metaRow}>
            <Icon name="hospital" size={16} color={theme.colors.textMuted} />
            <Text style={s.metaText}>{entry.doctor}</Text>
          </View>
        ) : null}
        {entry.location ? (
          <View style={s.metaRow}>
            <Icon name="calendar" size={16} color={theme.colors.textMuted} />
            <Text style={s.metaText}>{entry.location}</Text>
          </View>
        ) : null}

        {/* Photos */}
        {entry.photos && entry.photos.length > 0 && (
          <View style={s.photosSection}>
            <TouchableOpacity onPress={() => setLightboxVisible(true)} activeOpacity={0.9}>
              <Image source={{ uri: entry.photos[photoIndex] }} style={s.mainPhoto} resizeMode="cover" />
            </TouchableOpacity>
            {entry.photos.length > 1 && (
              <FlatList
                data={entry.photos}
                horizontal
                keyExtractor={(_, i) => String(i)}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.thumbRow}
                renderItem={({ item, index }) => (
                  <TouchableOpacity onPress={() => setPhotoIndex(index)} activeOpacity={0.8}>
                    <Image
                      source={{ uri: item }}
                      style={[s.thumb, photoIndex === index && s.thumbActive]}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}

        {/* Notes */}
        {entry.notes ? (
          <View style={s.notesSection}>
            <Text style={s.sectionLabel}>Notatki</Text>
            <Text style={s.notes}>{entry.notes}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
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
    headerActions: { flexDirection: 'row', gap: 4 },
    actionBtn: { padding: 8 },
    scroll: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 48,
      gap: 12,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.full,
    },
    badgeLabel: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    metaText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textMuted,
    },
    photosSection: { gap: 8 },
    mainPhoto: {
      width: '100%',
      height: 240,
      borderRadius: theme.borderRadius.lg,
    },
    thumbRow: { gap: 8, paddingVertical: 4 },
    thumb: {
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.sm,
      opacity: 0.6,
    },
    thumbActive: { opacity: 1, borderWidth: 2, borderColor: theme.colors.primary },
    notesSection: { gap: 6 },
    sectionLabel: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.textSecondary,
    },
    notes: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      lineHeight: 22,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    notFound: { fontSize: theme.fontSize.md, color: theme.colors.textMuted },
    lightboxBg: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.95)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    lightboxImage: {
      width: '100%',
      height: '100%',
    },
    lightboxClose: {
      position: 'absolute',
      top: 48,
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    lightboxCloseText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600' as const,
    },
  });
