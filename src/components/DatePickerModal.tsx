import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme';

const MONTHS_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
];

const MODAL_MAX_WIDTH = 360;

interface DatePickerModalProps {
  visible: boolean;
  value: string;        // YYYY-MM-DD
  onConfirm: (date: string) => void;
  onDismiss: () => void;
}

function parseMonth(yyyyMM: string): { year: number; month: number } {
  const parts = yyyyMM.split('-');
  const year = Number(parts[0]) || new Date().getFullYear();
  const month = Number(parts[1]) || new Date().getMonth() + 1;
  return { year, month };
}

export default function DatePickerModal({ visible, value, onConfirm, onDismiss }: DatePickerModalProps) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  const today = new Date().toISOString().slice(0, 10);

  const [selected, setSelected] = useState(value || today);
  const [currentMonth, setCurrentMonth] = useState(() => (value || today).slice(0, 7));

  useEffect(() => {
    if (visible) {
      const d = value || today;
      setSelected(d);
      setCurrentMonth(d.slice(0, 7));
    }
  }, [visible, value]);

  const { year, month } = parseMonth(currentMonth);

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
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={s.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={s.modal}>
              {/* Header */}
              <View style={s.header}>
                <TouchableOpacity onPress={prevMonth} style={s.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={s.navArrow}>{'‹'}</Text>
                </TouchableOpacity>
                <Text style={s.monthLabel}>
                  {MONTHS_PL[month - 1]} {year}
                </Text>
                <TouchableOpacity onPress={nextMonth} style={s.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={s.navArrow}>{'›'}</Text>
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
                  textDayFontSize: theme.fontSize.sm,
                  textMonthFontSize: 0,
                  textDayHeaderFontSize: theme.fontSize.xs,
                  // @ts-expect-error — react-native-calendars supports this key but types don't declare it
                  'stylesheet.calendar.header': {
                    header: { height: 0, overflow: 'hidden' },
                  },
                }}
              />

              {/* Buttons */}
              <View style={s.buttons}>
                <TouchableOpacity onPress={onDismiss} style={s.btnCancel}>
                  <Text style={s.btnCancelText}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onConfirm(selected)}
                  style={s.btnConfirm}
                >
                  <Text style={s.btnConfirmText}>Gotowe</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    modal: {
      width: '100%',
      maxWidth: MODAL_MAX_WIDTH,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
    },
    navBtn: { padding: theme.spacing.xs },
    navArrow: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.regular,
      color: theme.colors.text,
    },
    monthLabel: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
    },
    buttons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    btnCancel: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
    },
    btnCancelText: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.textMuted,
    },
    btnConfirm: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm + 2,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary,
    },
    btnConfirmText: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.background,
    },
  });
