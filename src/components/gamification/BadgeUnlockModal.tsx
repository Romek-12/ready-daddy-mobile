import React, { useEffect, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { useBadgeContext } from '../../context/BadgeContext';
import { getBadgeDefinition } from '../../services/gamification/BadgeService';
import type { Theme } from '../../theme';

export default function BadgeUnlockModal() {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const { currentUnlock, dismissCurrent } = useBadgeContext();

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const visible = Boolean(currentUnlock);
  const definition = currentUnlock ? getBadgeDefinition(currentUnlock) : null;

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 12, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible, scale, opacity]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!definition) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={s.overlay}>
        <Animated.View style={[s.card, animatedCardStyle]}>
          <Text style={s.emoji}>{definition.icon}</Text>
          <Text style={s.headline}>Nowa odznaka!</Text>
          <Text style={s.title}>{definition.title}</Text>
          <Text style={s.description}>{definition.description}</Text>
          <TouchableOpacity style={s.btn} onPress={dismissCurrent} activeOpacity={0.8}>
            <Text style={s.btnText}>Super! 🎉</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xxl,
      padding: theme.spacing.xl,
      alignItems: 'center',
      width: '100%',
      maxWidth: 320,
      borderWidth: 1,
      borderColor: theme.colors.primary + '40',
    },
    emoji: {
      fontSize: 64,
      marginBottom: theme.spacing.md,
    },
    headline: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: theme.spacing.xs,
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    description: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: theme.spacing.xl,
    },
    btn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
    },
    btnText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.white,
    },
  });
