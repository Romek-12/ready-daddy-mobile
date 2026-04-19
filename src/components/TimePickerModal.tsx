import React, { useMemo } from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useTheme } from '../context/ThemeContext';

export interface TimePickerModalProps {
  visible: boolean;
  value: string;        // HH:MM or '' (empty = no time set)
  onConfirm: (time: string) => void;
  onDismiss: () => void;
}

function parseTime(value: string): Date {
  const d = new Date();
  if (value) {
    const parts = value.split(':');
    const hour = Number(parts[0]);
    const minute = Number(parts[1]);
    if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
      d.setHours(hour, minute, 0, 0);
      return d;
    }
  }
  d.setHours(9, 0, 0, 0);
  return d;
}

function formatTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function TimePickerModal({
  visible,
  value,
  onConfirm,
  onDismiss,
}: TimePickerModalProps) {
  const { theme, isDark } = useTheme();
  const initialDate = useMemo(() => parseTime(value), [value]);

  return (
    <DateTimePickerModal
      isVisible={visible}
      mode="time"
      date={initialDate}
      onConfirm={(d) => onConfirm(formatTime(d))}
      onCancel={onDismiss}
      is24Hour
      minuteInterval={5}
      locale="pl-PL"
      confirmTextIOS="Gotowe"
      cancelTextIOS="Anuluj"
      accentColor={theme.colors.primary}
      buttonTextColorIOS={theme.colors.primary}
      isDarkModeEnabled={isDark}
    />
  );
}
