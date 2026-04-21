import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface GlowPillProps {
  label: string;
  variant?: 'cyan' | 'violet';
}

export default function GlowPill({ label, variant = 'cyan' }: GlowPillProps) {
  const { theme } = useTheme();
  const isCyan = variant === 'cyan';
  const color = isCyan ? theme.colors.primary : theme.colors.violet;
  const bg = isCyan ? theme.colors.primaryLight : theme.colors.violetSoft;
  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: color + '55' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
});
