import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface AuroraBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export default function AuroraBackground({ children, style }: AuroraBackgroundProps) {
  const { theme } = useTheme();
  const cyanY = useSharedValue(0);
  const violetY = useSharedValue(0);

  useEffect(() => {
    cyanY.value = withRepeat(
      withSequence(withTiming(-20, { duration: 6000 }), withTiming(0, { duration: 6000 })),
      -1,
      true
    );
    violetY.value = withRepeat(
      withSequence(withTiming(16, { duration: 7000 }), withTiming(0, { duration: 7000 })),
      -1,
      true
    );
  }, [cyanY, violetY]);

  const cyanStyle = useAnimatedStyle(() => ({ transform: [{ translateY: cyanY.value }] }));
  const violetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: violetY.value }] }));

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }, style]}>
      <AnimatedGradient
        colors={[theme.colors.primaryLight, 'transparent']}
        style={[styles.blobCyan, cyanStyle]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
      />
      <AnimatedGradient
        colors={[theme.colors.violetSoft, 'transparent']}
        style={[styles.blobViolet, violetStyle]}
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
    opacity: 0.7,
  },
  blobViolet: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    top: -140,
    right: -100,
    opacity: 0.7,
  },
  content: { flex: 1, zIndex: 1 },
});
