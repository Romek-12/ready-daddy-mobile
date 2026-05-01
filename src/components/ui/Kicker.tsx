import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface KickerProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  color?: string;
}

export default function Kicker({ children, style, color }: KickerProps) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.base,
        {
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.kicker,
          color: color || theme.colors.textMuted,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
