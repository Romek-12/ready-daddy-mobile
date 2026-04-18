import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../context/ThemeContext';

const MONTHS_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
];

interface DatePickerModalProps {
  visible: boolean;
  value: string;        // YYYY-MM-DD
  onConfirm: (date: string) => void;
  onDismiss: () => void;
}

export default function DatePickerModal({ visible, value, onConfirm, onDismiss }: DatePickerModalProps) {
  const { theme } = useTheme();

  const [selected, setSelected] = useState(value || new Date().toISOString().slice(0, 10));
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = value || new Date().toISOString().slice(0, 10);
    return d.slice(0, 7); // YYYY-MM
  });

  useEffect(() => {
    if (visible) {
      const d = value || new Date().toISOString().slice(0, 10);
      setSelected(d);
      setCurrentMonth(d.slice(0, 7));
    }
  }, [visible, value]);

  const [year, month] = currentMonth.split('-').map(Number);

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const markedDates = selected
    ? { [selected]: { selected: true, selectedColor: theme.colors.primary } }
    : {};

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={s.overlay} onPress={onDismiss}>
        <Pressable style={[s.modal, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl }]}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={prevMonth} style={s.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[s.navArrow, { color: theme.colors.text }]}>{'‹'}</Text>
            </TouchableOpacity>
            <Text style={[s.monthLabel, { color: theme.colors.text }]}>
              {MONTHS_PL[month - 1]} {year}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={s.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[s.navArrow, { color: theme.colors.text }]}>{'›'}</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar grid */}
          <Calendar
            key={currentMonth}
            current={currentMonth + '-01'}
            hideArrows
            hideExtraDays
            onDayPress={(day: { dateString: string }) => setSelected(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: theme.colors.surface,
              calendarBackground: theme.colors.surface,
              dayTextColor: theme.colors.text,
              textDisabledColor: theme.colors.textMuted,
              monthTextColor: 'transparent',
              arrowColor: theme.colors.primary,
              todayTextColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.background,
              selectedDayBackgroundColor: theme.colors.primary,
              textDayFontSize: 14,
              textMonthFontSize: 0,
              textDayHeaderFontSize: 12,
              // @ts-ignore — react-native-calendars supports this key but types don't declare it
              'stylesheet.calendar.header': {
                header: { height: 0, overflow: 'hidden' },
              },
            }}
          />

          {/* Buttons */}
          <View style={s.buttons}>
            <TouchableOpacity onPress={onDismiss} style={s.btnCancel}>
              <Text style={[s.btnCancelText, { color: theme.colors.textMuted }]}>Anuluj</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(selected)}
              style={[s.btnConfirm, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={[s.btnConfirmText, { color: theme.colors.background }]}>Gotowe</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  navBtn: { padding: 4 },
  navArrow: { fontSize: 24, fontWeight: '300' },
  monthLabel: { fontSize: 16, fontWeight: '600' },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 12,
  },
  btnCancel: { paddingHorizontal: 16, paddingVertical: 10 },
  btnCancelText: { fontSize: 14, fontWeight: '600' },
  btnConfirm: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  btnConfirmText: { fontSize: 14, fontWeight: '600' },
});
