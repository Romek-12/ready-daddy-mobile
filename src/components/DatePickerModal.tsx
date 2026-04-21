import React, { useMemo } from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useTheme } from '../context/ThemeContext';

interface DatePickerModalProps {
  visible: boolean;
  value: string;        // YYYY-MM-DD
  onConfirm: (date: string) => void;
  onDismiss: () => void;
}

function parseDate(value: string): Date {
  if (value) {
    const parts = value.split('-');
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (year && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const d = new Date(year, month - 1, day);
      // Verify no overflow (e.g. Feb 30 → Mar 2)
      if (d.getMonth() === month - 1 && d.getDate() === day) {
        return d;
      }
    }
  }
  return new Date();
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DatePickerModal({ visible, value, onConfirm, onDismiss }: DatePickerModalProps) {
  const { theme, isDark } = useTheme();
  const initialDate = useMemo(() => parseDate(value), [value]);

  return (
    <DateTimePickerModal
      isVisible={visible}
      mode="date"
      date={initialDate}
      onConfirm={(d) => onConfirm(formatDate(d))}
      onCancel={onDismiss}
      locale="pl-PL"
      confirmTextIOS="Gotowe"
      cancelTextIOS="Anuluj"
      accentColor={theme.colors.primary}
      buttonTextColorIOS={theme.colors.primary}
      isDarkModeEnabled={isDark}
    />
  );
}
