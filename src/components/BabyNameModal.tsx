import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import type { Theme } from '../theme';

interface Props {
  visible: boolean;
  isName1: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  theme: Theme;
}

export default function BabyNameModal({ visible, isName1, value, onChangeText, onSave, onClose, saving, theme }: Props) {
  const s = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={s.overlay}>
        <View style={s.container}>
          <Text style={s.title}>
            {isName1 ? 'Edytuj imię dziecka' : 'Edytuj drugie imię'}
          </Text>
          <TextInput
            style={s.input}
            placeholder={isName1 ? 'np. Zosia' : 'np. Piotrek'}
            placeholderTextColor={theme.colors.textMuted}
            value={value}
            onChangeText={onChangeText}
            maxLength={30}
            autoFocus
            accessibilityLabel={isName1 ? 'Imię dziecka' : 'Drugie imię dziecka'}
          />
          <View style={s.buttons}>
            <TouchableOpacity
              style={[s.button, s.cancelButton]}
              onPress={onClose}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Anuluj edycję imienia"
            >
              <Text style={s.cancelText}>Anuluj</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.button, s.saveButton, saving && { opacity: 0.6 }]}
              onPress={onSave}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Zapisz imię"
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.saveText}>Zapisz</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
  },
  title: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginVertical: theme.spacing.lg,
  },
  buttons: { flexDirection: 'row', gap: theme.spacing.md },
  button: { flex: 1, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center' },
  cancelButton: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.cardBorder },
  cancelText: { color: theme.colors.text, fontWeight: theme.fontWeight.bold },
  saveButton: { backgroundColor: theme.colors.primary },
  saveText: { color: theme.colors.black, fontWeight: theme.fontWeight.bold },
});
