import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useSizeMode, SizeComparisonMode } from '../hooks/useSizeMode';
import Icon from '../components/Icon';
import DateScrollPicker from '../components/DateScrollPicker';
import Button from '../components/Button';
import BabyNameModal from '../components/BabyNameModal';
import { api } from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../types/navigation';
import type { Theme } from '../theme';
import { PREGNANCY_DAYS } from '../constants';

type Props = NativeStackScreenProps<HomeStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { user, updateUser, logout } = useAuth();
  const { theme, mode, setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [sizeMode, setSizeMode] = useSizeMode();
  const s = React.useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [dateType, setDateType] = useState<'conception' | 'due'>('conception');
  const [selectedDate, setSelectedDate] = useState(user?.conceptionDate || '');
  const [saving, setSaving] = useState(false);

  // Baby names modal states
  const [babyNameEditModal, setBabyNameEditModal] = useState<'name1' | 'name2' | null>(null);
  const [editingBabyName, setEditingBabyName] = useState('');
  const [savingBabyName, setSavingBabyName] = useState(false);
  const [showGenderPickerAlert, setShowGenderPickerAlert] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Wylogowanie', 'Czy na pewno chcesz się wylogować?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Wyloguj', style: 'destructive', onPress: logout },
    ]);
  };

  const handleSaveDate = async () => {
    try {
      setSaving(true);
      let conceptionDate = selectedDate;
      if (dateType === 'due' && selectedDate) {
        const due = new Date(selectedDate);
        due.setDate(due.getDate() - PREGNANCY_DAYS);
        conceptionDate = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`;
      }
      await api.updateProfile(user!.id, { conceptionDate });
      updateUser({ conceptionDate });
      setDatePickerVisible(false);
      Alert.alert('Sukces', 'Data została zaktualizowana.');
    } catch (err: unknown) {
      Alert.alert('Błąd', err instanceof Error ? err.message : 'Nie udało się zapisać zmiany.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBabyName = async () => {
    if (!editingBabyName.trim() && babyNameEditModal === 'name1') {
      Alert.alert('Błąd', 'Imię dziecka nie może być puste');
      return;
    }

    try {
      setSavingBabyName(true);
      const updateData = babyNameEditModal === 'name1'
        ? { babyName1: editingBabyName.trim() || null }
        : { babyName2: editingBabyName.trim() || null };

      await api.updateProfile(user!.id, updateData);
      updateUser(updateData);
      setBabyNameEditModal(null);
      setEditingBabyName('');
      Alert.alert('Sukces', 'Imię zostało zaktualizowane.');
    } catch (err: unknown) {
      Alert.alert('Błąd', err instanceof Error ? err.message : 'Nie udało się zapisać zmianę.');
    } finally {
      setSavingBabyName(false);
    }
  };

  const handleSetGender = async (gender: 'boy' | 'girl') => {
    try {
      setSaving(true);
      await api.updateProfile(user!.id, { babyGender: gender });
      updateUser({ babyGender: gender });

      // If 2 names exist, ask which to keep
      if (user?.babyName1 && user?.babyName2) {
        Alert.alert(
          'Wybierz imię',
          'Które imię chcesz zachować?',
          [
            { text: user.babyName1, onPress: async () => {
              try {
                await api.updateProfile(user.id, { babyName1: user.babyName1, babyName2: null });
                updateUser({ babyName2: null });
              } catch (err: unknown) {
                Alert.alert('Błąd', err instanceof Error ? err.message : 'Wystąpił błąd');
              }
            }},
            { text: user.babyName2, onPress: async () => {
              try {
                await api.updateProfile(user.id, { babyName1: user.babyName2, babyName2: null });
                updateUser({ babyName1: user.babyName2, babyName2: null });
              } catch (err: unknown) {
                Alert.alert('Błąd', err instanceof Error ? err.message : 'Wystąpił błąd');
              }
            }},
          ]
        );
      }
    } catch (err: unknown) {
      Alert.alert('Błąd', err instanceof Error ? err.message : 'Nie udało się zapisać płeć.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearGender = () => {
    Alert.alert(
      'Zmiana płci',
      'Czy na pewno chcesz zmienić wybraną płeć? Będzie trzeba wybrać jej ponownie.',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Zmień', style: 'destructive', onPress: async () => {
          try {
            setSaving(true);
            await api.updateProfile(user!.id, { babyGender: null });
            updateUser({ babyGender: null });
          } catch (err: unknown) {
            Alert.alert('Błąd', err instanceof Error ? err.message : 'Wystąpił błąd');
          } finally {
            setSaving(false);
          }
        }},
      ]
    );
  };

  const renderThemeOption = (targetMode: ThemeMode, label: string, icon: string) => {
    const isSelected = mode === targetMode;
    return (
      <TouchableOpacity
        style={[s.optionCard, isSelected && s.optionCardSelected]}
        onPress={() => setThemeMode(targetMode)}
        activeOpacity={0.7}
        accessibilityRole="radio"
        accessibilityLabel={`Motyw ${label}`}
        accessibilityState={{ checked: isSelected }}
      >
        <View style={[s.optionIcon, isSelected && s.optionIconSelected]}>
          <Icon name={icon} size={22} color={isSelected ? theme.colors.white : theme.colors.textMuted} />
        </View>
        <Text style={[s.optionLabel, isSelected && s.optionLabelSelected]}>{label}</Text>
        {isSelected && (
          <View style={s.checkIcon}>
            <Icon name="check" size={18} color={theme.colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSizeModeOption = (targetMode: SizeComparisonMode, label: string, emoji: string) => {
    const isSelected = sizeMode === targetMode;
    return (
      <TouchableOpacity
        style={[s.optionCard, isSelected && s.optionCardSelected]}
        onPress={() => setSizeMode(targetMode)}
        activeOpacity={0.7}
        accessibilityRole="radio"
        accessibilityLabel={`Porównanie: ${label}`}
        accessibilityState={{ checked: isSelected }}
      >
        <View style={[s.optionIcon, isSelected && s.optionIconSelected]}>
          <Text style={{ fontSize: 20 }}>{emoji}</Text>
        </View>
        <Text style={[s.optionLabel, isSelected && s.optionLabelSelected]}>{label}</Text>
        {isSelected && (
          <View style={s.checkIcon}>
            <Icon name="check" size={18} color={theme.colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Format daty dla wyświetlania
  const formatDateForDisplay = (isoString?: string) => {
    if (!isoString) return 'Nie podano';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Nie podano';
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <View style={s.c}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Wróć">
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Ustawienia</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        
        <View style={s.section}>
          <Text style={s.sectionTitle}>Motyw aplikacji</Text>
          <Text style={s.sectionDesc}>Wybierz w jakim trybie ma działać aplikacja, lub zdaj się na ustawienia systemowe.</Text>
          
          <View style={s.optionsGrid}>
            {renderThemeOption('light', 'Jasny', 'lightbulb')}
            {renderThemeOption('dark', 'Ciemny', 'moon')}
            {renderThemeOption('system', 'Systemowy', 'phone')}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Konto i Dane</Text>
          <TouchableOpacity style={s.listButton} onPress={() => { setSelectedDate(user?.conceptionDate || new Date().toISOString()); setDatePickerVisible(true); }} accessibilityRole="button" accessibilityLabel="Zmień termin poczęcia">
            <View style={s.listButtonLeft}>
              <View style={[s.listButtonIcon, { backgroundColor: theme.colors.checkups + '20' }]}>
                <Icon name="calendar" size={20} color={theme.colors.checkups} />
              </View>
              <View>
                <Text style={s.listButtonText}>Zmień termin poczęcia</Text>
                <Text style={s.listButtonSub}>{formatDateForDisplay(user?.conceptionDate)}</Text>
              </View>
            </View>
            <Icon name="arrow-forward" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* O dziecku Section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>O dziecku</Text>

          {/* Baby Name 1 */}
          <TouchableOpacity
            style={s.listButton}
            onPress={() => { setEditingBabyName(user?.babyName1 || ''); setBabyNameEditModal('name1'); }}
            accessibilityRole="button"
            accessibilityLabel="Edytuj imię dziecka"
          >
            <View style={s.listButtonLeft}>
              <View style={[s.listButtonIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Icon name="person" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={s.listButtonText}>Imię dziecka</Text>
                <Text style={s.listButtonSub}>{user?.babyName1 || '– nie podano –'}</Text>
              </View>
            </View>
            <Icon name="edit" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* Baby Name 2 */}
          <TouchableOpacity
            style={[s.listButton, { marginTop: theme.spacing.md }]}
            onPress={() => { setEditingBabyName(user?.babyName2 || ''); setBabyNameEditModal('name2'); }}
            accessibilityRole="button"
            accessibilityLabel="Edytuj drugie imię dziecka"
          >
            <View style={s.listButtonLeft}>
              <View style={[s.listButtonIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Icon name="person" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={s.listButtonText}>Drugie imię (opcjonalne)</Text>
                <Text style={s.listButtonSub}>{user?.babyName2 || '– nie podano –'}</Text>
              </View>
            </View>
            <Icon name="edit" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* Gender Selection */}
          {user?.babyGender === null ? (
            <View style={[s.genderSection, { marginTop: theme.spacing.lg }]}>
              <Text style={s.genderSectionTitle}>Płeć dziecka</Text>
              <Text style={s.genderSectionDesc}>Jeszcze nie wiesz? Daj znać gdy się dowiesz! 🎉</Text>
              <View style={s.genderButtonsContainer}>
                <TouchableOpacity
                  style={[s.genderButton, { borderColor: '#FF6B9D' }]}
                  onPress={() => handleSetGender('girl')}
                  disabled={saving}
                >
                  <Text style={s.genderButtonEmoji}>👧</Text>
                  <Text style={s.genderButtonText}>Dziewczynka</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.genderButton, { borderColor: '#0088FF' }]}
                  onPress={() => handleSetGender('boy')}
                  disabled={saving}
                >
                  <Text style={s.genderButtonEmoji}>👦</Text>
                  <Text style={s.genderButtonText}>Chłopiec</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[s.listButton, { marginTop: theme.spacing.lg }]}
              onPress={handleClearGender}
              accessibilityRole="button"
              accessibilityLabel="Zmień płeć dziecka"
            >
              <View style={s.listButtonLeft}>
                <View style={[s.listButtonIcon, { backgroundColor: (user?.babyGender === 'girl' ? '#FF6B9D' : '#0088FF') + '20' }]}>
                  <Icon name={user?.babyGender === 'girl' ? 'female' : 'male'} size={20} color={user?.babyGender === 'girl' ? '#FF6B9D' : '#0088FF'} />
                </View>
                <View>
                  <Text style={s.listButtonText}>Płeć dziecka</Text>
                  <Text style={s.listButtonSub}>{user?.babyGender === 'girl' ? '👧 Dziewczynka' : '👦 Chłopiec'}</Text>
                </View>
              </View>
              <Icon name="edit" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Porównanie rozmiaru dziecka */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Porównanie rozmiaru dziecka</Text>
          <Text style={s.sectionDesc}>Wybierz w jaki sposób chcesz porównywać wielkość dziecka na kartach tygodnia.</Text>
          <View style={s.optionsGrid}>
            {renderSizeModeOption('fruit', 'Owoc / warzywo', '🍎')}
            {renderSizeModeOption('animal', 'Zwierzę', '🐾')}
            {renderSizeModeOption('sweet', 'Słodycz', '🍬')}
          </View>
        </View>

        <View style={s.spacer} />
        
        <TouchableOpacity style={s.logoutButton} onPress={handleLogout} accessibilityRole="button" accessibilityLabel="Wyloguj się">
          <Icon name="logout" size={20} color={theme.colors.danger} />
          <Text style={s.logoutText}>Wyloguj się</Text>
        </TouchableOpacity>

        <Text style={s.versionText}>Wersja 1.0.0</Text>
      </ScrollView>

      <BabyNameModal
        visible={babyNameEditModal !== null}
        isName1={babyNameEditModal === 'name1'}
        value={editingBabyName}
        onChangeText={setEditingBabyName}
        onSave={handleSaveBabyName}
        onClose={() => { setBabyNameEditModal(null); setEditingBabyName(''); }}
        saving={savingBabyName}
        theme={theme}
      />

      {/* Date Picker Modal */}
      <Modal visible={isDatePickerVisible} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Wybierz datę</Text>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)} style={s.modalCloseBtn} accessibilityRole="button" accessibilityLabel="Zamknij okno wyboru daty">
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={s.pickerWrapper}>
              <View style={s.dateToggle}>
                <TouchableOpacity
                  style={[s.toggleBtn, dateType === 'conception' && s.toggleBtnActive]}
                  onPress={() => { setDateType('conception'); setSelectedDate(''); }}
                >
                  <Text style={[s.toggleText, dateType === 'conception' && s.toggleTextActive]}>Data poczęcia</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.toggleBtn, dateType === 'due' && s.toggleBtnActive]}
                  onPress={() => { setDateType('due'); setSelectedDate(''); }}
                >
                  <Text style={[s.toggleText, dateType === 'due' && s.toggleTextActive]}>Termin porodu</Text>
                </TouchableOpacity>
              </View>

              <DateScrollPicker 
                initialDate={selectedDate || user?.conceptionDate} 
                onDateChange={setSelectedDate}
                allowFuture={dateType === 'due'}
                maxDaysBack={dateType === 'conception' ? 366 : 30}
                maxDaysForward={dateType === 'due' ? 310 : 0}
              />
            </View>

            <TouchableOpacity
              style={[s.saveButton, saving && { opacity: 0.7 }]}
              onPress={handleSaveDate}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Zapisz zmianę daty"
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveButtonText}>Zapisz zmianę</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: Theme, topInset: number) => StyleSheet.create({
  c: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, paddingTop: topInset + 16, paddingBottom: theme.spacing.md, backgroundColor: theme.colors.surface },
  backBtn: { padding: theme.spacing.sm, borderRadius: 20, backgroundColor: theme.colors.background },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  content: { padding: theme.spacing.xl, paddingBottom: 40 },
  section: { marginBottom: theme.spacing.xxl },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginBottom: theme.spacing.xs },
  sectionDesc: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg, lineHeight: 20 },
  
  optionsGrid: { gap: theme.spacing.md },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, borderWidth: 2, borderColor: 'transparent' },
  optionCardSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' },
  optionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  optionIconSelected: { backgroundColor: theme.colors.primary },
  optionLabel: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text, fontWeight: '500' },
  optionLabelSelected: { color: theme.colors.primary, fontWeight: '700' },
  checkIcon: { width: 24, height: 24, backgroundColor: theme.colors.background, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  listButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg },
  listButtonLeft: { flexDirection: 'row', alignItems: 'center' },
  listButtonIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  listButtonText: { fontSize: theme.fontSize.md, color: theme.colors.text, fontWeight: '500' },
  listButtonSub: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginTop: 2 },

  spacer: { flex: 1, minHeight: 40 },
  
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, marginTop: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.danger + '40' },
  logoutText: { marginLeft: theme.spacing.sm, fontSize: theme.fontSize.md, color: theme.colors.danger, fontWeight: theme.fontWeight.bold },
  
  versionText: { textAlign: 'center', fontSize: theme.fontSize.xs, color: theme.colors.textMuted, marginTop: theme.spacing.lg },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.xl, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xl },
  modalTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  modalCloseBtn: { padding: theme.spacing.xs },
  pickerWrapper: { height: 250, marginBottom: theme.spacing.xl },
  saveButton: { backgroundColor: theme.colors.primary, padding: 18, borderRadius: theme.borderRadius.xl, alignItems: 'center' },
  saveButtonText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold },

  dateToggle: { flexDirection: 'row', marginBottom: theme.spacing.md, gap: 8 },
  toggleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceLight, borderWidth: 1,
    borderColor: theme.colors.cardBorder, alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
  toggleText: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, fontWeight: theme.fontWeight.medium },
  toggleTextActive: { color: theme.colors.primary, fontWeight: theme.fontWeight.semibold },

  // Gender Section
  genderSection: { backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg },
  genderSectionTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginBottom: theme.spacing.xs },
  genderSectionDesc: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  genderButtonsContainer: { flexDirection: 'row', gap: theme.spacing.md },
  genderButton: {
    flex: 1, paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.md,
    borderWidth: 2, borderRadius: theme.borderRadius.lg, backgroundColor: theme.colors.background,
    alignItems: 'center', gap: theme.spacing.xs,
  },
  genderButtonEmoji: { fontSize: 28 },
  genderButtonText: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },

});
