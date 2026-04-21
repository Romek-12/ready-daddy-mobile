import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  elevated?: boolean;
}

export default function GlassCard({ children, style, elevated = false }: GlassCardProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: elevated ? theme.colors.surfaceHi : theme.colors.surface,
          borderColor: elevated ? theme.colors.cardBorderHi : theme.colors.cardBorder,
          borderRadius: theme.borderRadius.xl,
        },
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
