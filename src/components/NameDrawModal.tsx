import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';
import type { Theme } from '../theme';
import {
  NAME_DRAW_ANIMATION_TOTAL_MS,
  NAME_DRAW_FAST_TICK_MS,
} from '../constants';

interface NameDrawModalProps {
  visible: boolean;
  pool: string[];
  result: string;
  saving: boolean;
  onRequestRedraw: () => void;
  onSave: (name: string) => void;
  onDismiss: () => void;
}

export default function NameDrawModal({
  visible,
  pool,
  result,
  saving,
  onRequestRedraw,
  onSave,
  onDismiss,
}: NameDrawModalProps) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  const [displayName, setDisplayName] = useState(result);
  const [isAnimating, setIsAnimating] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    setIsAnimating(true);
    buttonsOpacity.setValue(0);
    scale.setValue(1);

    const finish = () => {
      setIsAnimating(false);
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.1, useNativeDriver: true, friction: 4 }),
        Animated.spring(scale, { toValue: 1.0, useNativeDriver: true, friction: 4 }),
      ]).start();
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    const run = async () => {
      const reduce = await AccessibilityInfo.isReduceMotionEnabled().catch(() => false);
      if (cancelled) return;

      if (reduce || pool.length === 0) {
        setDisplayName(result);
        finish();
        return;
      }

      const startedAt = Date.now();
      const fastUntil = startedAt + Math.max(0, NAME_DRAW_ANIMATION_TOTAL_MS - 500);
      const endAt = startedAt + NAME_DRAW_ANIMATION_TOTAL_MS;

      const tick = () => {
        if (cancelled) return;
        const now = Date.now();
        if (now >= endAt) {
          setDisplayName(result);
          finish();
          return;
        }

        const randomName = pool[Math.floor(Math.random() * pool.length)];
        setDisplayName(randomName);

        let nextDelay: number;
        if (now < fastUntil) {
          nextDelay = NAME_DRAW_FAST_TICK_MS;
        } else {
          const remaining = endAt - now;
          nextDelay = Math.max(NAME_DRAW_FAST_TICK_MS, Math.floor(remaining / 3));
        }
        timeoutRef.current = setTimeout(tick, nextDelay);
      };

      tick();
    };

    run();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [visible, result, pool, scale, buttonsOpacity]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={isAnimating ? undefined : onDismiss}>
        <View style={s.overlay}>
          <TouchableOpacity
            style={s.closeBtn}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Zamknij"
          >
            <Icon name="close" size={28} color={theme.colors.white} />
          </TouchableOpacity>

          <Text style={s.label}>Wylosowane imię:</Text>
          <Animated.Text style={[s.name, { transform: [{ scale }] }]}>
            {displayName || '…'}
          </Animated.Text>

          <Animated.View style={[s.buttonsRow, { opacity: buttonsOpacity }]}>
            <TouchableOpacity
              style={s.btnSecondary}
              onPress={onRequestRedraw}
              disabled={isAnimating || saving}
              accessibilityRole="button"
            >
              <Text style={s.btnSecondaryText}>Losuj ponownie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.btnPrimary}
              onPress={() => onSave(result)}
              disabled={isAnimating || saving}
              accessibilityRole="button"
            >
              <Text style={s.btnPrimaryText}>
                {saving ? 'Zapisuję…' : 'Zapisz jako imię dziecka'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    closeBtn: {
      position: 'absolute',
      top: theme.spacing.xxl,
      right: theme.spacing.lg,
      padding: theme.spacing.sm,
    },
    label: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing.md,
    },
    name: {
      fontSize: theme.fontSize.hero,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.xxl,
    },
    buttonsRow: {
      width: '100%',
      gap: theme.spacing.md,
    },
    btnPrimary: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
    },
    btnPrimaryText: {
      color: theme.colors.white,
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
    },
    btnSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.white,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
    },
    btnSecondaryText: {
      color: theme.colors.white,
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
    },
  });
