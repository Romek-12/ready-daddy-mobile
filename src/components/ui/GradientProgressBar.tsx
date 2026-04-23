import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  value: number;
  height?: number;
  glow?: boolean;
}

export default function GradientProgressBar({ value, height = 6, glow = false }: Props) {
  const { theme } = useTheme();
  const clamped = Math.max(2, Math.min(100, value));
  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: theme.colors.cardBorder, borderRadius: height / 2 },
      ]}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.violet]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.fill,
          { width: `${clamped}%`, borderRadius: height / 2 },
          glow && {
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.7,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 0 },
            elevation: 4,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
