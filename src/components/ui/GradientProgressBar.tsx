import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  value: number;
  height?: number;
  glow?: boolean;
}

export default function GradientProgressBar({ value, height = 6, glow = false }: Props) {
  const { theme } = useTheme();
  const clamped = Math.max(2, Math.min(100, value));

  const shimmerX = useSharedValue(-1);

  useEffect(() => {
    if (!glow) return;
    shimmerX.value = withRepeat(
      withTiming(2, { duration: 2500, easing: Easing.linear }),
      -1,
      false,
    );
  }, [glow, shimmerX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${shimmerX.value * 100}%` as unknown as number }],
  }));

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
      >
        {glow && (
          <Animated.View style={[StyleSheet.absoluteFillObject, shimmerStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.35)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%', overflow: 'hidden' },
});
