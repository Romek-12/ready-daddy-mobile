import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  elevated?: boolean;
  accent?: 'cyan' | 'violet';
}

export default function GlassCard({ children, style, elevated = false, accent }: GlassCardProps) {
  const { theme } = useTheme();
  const accentColor =
    accent === 'cyan' ? theme.colors.primary : accent === 'violet' ? theme.colors.violet : undefined;
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: elevated ? theme.colors.surfaceHi : theme.colors.surface,
          borderColor: elevated ? theme.colors.cardBorderHi : theme.colors.cardBorder,
          borderRadius: theme.borderRadius.xl,
        },
        accentColor && { borderLeftWidth: 3, borderLeftColor: accentColor },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
