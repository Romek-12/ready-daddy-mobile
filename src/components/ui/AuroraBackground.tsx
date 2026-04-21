import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface AuroraBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export default function AuroraBackground({ children, style }: AuroraBackgroundProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }, style]}>
      <LinearGradient
        colors={[theme.colors.primaryLight, 'transparent']}
        style={styles.blobCyan}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[theme.colors.violetSoft, 'transparent']}
        style={styles.blobViolet}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 0, y: 0 }}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, position: 'relative' },
  blobCyan: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    bottom: -80,
    left: -60,
    opacity: 0.55,
  },
  blobViolet: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    top: -140,
    right: -100,
    opacity: 0.55,
  },
  content: { flex: 1, zIndex: 1 },
});
