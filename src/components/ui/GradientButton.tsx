import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import type { Theme } from '../../theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export default function GradientButton({ title, onPress, loading, disabled, accessibilityLabel }: GradientButtonProps) {
  const { theme } = useTheme();
  const s = React.useMemo(() => createStyles(theme), [theme]);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      style={[s.wrap, isDisabled && s.disabled]}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.violet]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.gradient}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.black} />
        ) : (
          <Text style={s.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: {
      marginTop: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.5,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    gradient: {
      paddingVertical: 14,
      borderRadius: theme.borderRadius.xl,
      alignItems: 'center',
    },
    text: {
      color: theme.colors.black,
      fontFamily: theme.fonts.bold,
      fontSize: theme.fontSize.md,
      letterSpacing: 0.5,
    },
    disabled: { opacity: 0.6 },
  });
