import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const DRUM_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const MODAL_MAX_WIDTH = 320;
const DRUM_FONT_SIZE_OTHER = 20;

const HOURS: string[] = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0'),
);

const MINUTES: string[] = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, '0'),
);

export interface TimePickerModalProps {
  visible: boolean;
  value: string;        // HH:MM or '' (empty = no time set)
  onConfirm: (time: string) => void;
  onDismiss: () => void;
}

function parseTime(value: string): { hourIndex: number; minuteIndex: number } {
  if (!value) {
    return { hourIndex: 9, minuteIndex: 0 }; // default 09:00
  }
  const parts = value.split(':');
  const hour = Number(parts[0]) || 0;
  const minute = Number(parts[1]) || 0;
  const hourIndex = Math.min(Math.max(hour, 0), 23);
  // Find closest minute in steps of 5
  const minuteIndex = Math.min(Math.round(minute / 5), 11);
  return { hourIndex, minuteIndex };
}

interface DrumProps {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  styles: ReturnType<typeof createStyles>;
}

function Drum({ items, selectedIndex, onSelect, styles }: DrumProps) {
  const listRef = useRef<FlatList<string>>(null);
  const isScrolling = useRef(false);

  // Scroll to selected index on mount and when selectedIndex changes externally
  useEffect(() => {
    if (!isScrolling.current && listRef.current) {
      listRef.current.scrollToOffset({
        offset: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [selectedIndex]);

  const getItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<string>) => {
      const isSelected = index === selectedIndex;
      return (
        <View style={styles.drumItem}>
          <Text
            style={[
              styles.drumItemText,
              isSelected ? styles.drumItemTextSelected : styles.drumItemTextOther,
            ]}
          >
            {item}
          </Text>
        </View>
      );
    },
    [selectedIndex, styles],
  );

  const keyExtractor = useCallback((item: string) => item, []);

  const handleMomentumScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      isScrolling.current = false;
      const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.min(Math.max(index, 0), items.length - 1);
      onSelect(clamped);
    },
    [items.length, onSelect],
  );

  const handleScrollBeginDrag = useCallback(() => {
    isScrolling.current = true;
  }, []);

  return (
    <View style={styles.drumWrapper}>
      {/* Selection highlight overlay */}
      <View style={styles.selectionHighlight} pointerEvents="none" />
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={styles.drumContentContainer}
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
}

export default function TimePickerModal({
  visible,
  value,
  onConfirm,
  onDismiss,
}: TimePickerModalProps) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  const [hourIndex, setHourIndex] = useState(9);
  const [minuteIndex, setMinuteIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      const parsed = parseTime(value);
      setHourIndex(parsed.hourIndex);
      setMinuteIndex(parsed.minuteIndex);
    }
  }, [visible, value]);

  const handleConfirm = useCallback(() => {
    const hh = HOURS[hourIndex] ?? '09';
    const mm = MINUTES[minuteIndex] ?? '00';
    onConfirm(`${hh}:${mm}`);
  }, [hourIndex, minuteIndex, onConfirm]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={s.overlay} onPress={onDismiss}>
        <Pressable style={s.modal}>
          {/* Drums */}
          <View style={s.drumsRow}>
            <Drum
              items={HOURS}
              selectedIndex={hourIndex}
              onSelect={setHourIndex}
              styles={s}
            />
            <Text style={s.separator}>:</Text>
            <Drum
              items={MINUTES}
              selectedIndex={minuteIndex}
              onSelect={setMinuteIndex}
              styles={s}
            />
          </View>

          {/* Buttons */}
          <View style={s.buttons}>
            <TouchableOpacity onPress={onDismiss} style={s.btnCancel}>
              <Text style={s.btnCancelText}>Anuluj</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={s.btnConfirm}>
              <Text style={s.btnConfirmText}>Gotowe</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
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
      overflow: 'hidden',
      paddingTop: theme.spacing.lg,
    },
    drumsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    drumWrapper: {
      width: 80,
      height: DRUM_HEIGHT,
      overflow: 'hidden',
    },
    drumContentContainer: {
      paddingVertical: ITEM_HEIGHT * 2, // 2 padding items top + bottom so first/last can center
    },
    drumItem: {
      height: ITEM_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    drumItemText: {
      textAlign: 'center',
    },
    drumItemTextSelected: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.primary,
    },
    drumItemTextOther: {
      fontSize: DRUM_FONT_SIZE_OTHER,
      fontWeight: theme.fontWeight.regular,
      color: theme.colors.textMuted,
    },
    selectionHighlight: {
      position: 'absolute',
      top: ITEM_HEIGHT * 2,
      left: 0,
      right: 0,
      height: ITEM_HEIGHT,
      borderTopWidth: 1.5,
      borderBottomWidth: 1.5,
      borderColor: theme.colors.primary,
      zIndex: 1,
    },
    separator: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    buttons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    btnCancel: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    btnCancelText: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.textMuted,
    },
    btnConfirm: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary,
    },
    btnConfirmText: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.background,
    },
  });
