import React from 'react';
import { View, ViewStyle, StyleSheet, Platform, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { useGlassFeatureFlag } from '../../hooks/useGlassFeatureFlag';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | (ViewStyle | undefined)[];
  elevated?: boolean;
  accent?: 'cyan' | 'violet';
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function GlassCard({ children, style, elevated = false, accent, onPress }: GlassCardProps) {
  const { theme } = useTheme();
  const glassEnabled = useGlassFeatureFlag();
  const accentColor =
    accent === 'cyan' ? theme.colors.primary : accent === 'violet' ? theme.colors.violet : undefined;

  const borderRadius = theme.borderRadius.xl;
  const borderCol = glassEnabled
    ? elevated ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)'
    : elevated ? theme.colors.cardBorderHi : theme.colors.cardBorder;

  const accentStyle: ViewStyle | null = accentColor
    ? { borderLeftWidth: 3, borderLeftColor: accentColor }
    : null;

  const glowShadow: ViewStyle = accent === 'cyan'
    ? { shadowColor: theme.colors.primary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 0 }
    : accent === 'violet'
    ? { shadowColor: theme.colors.violet, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 0 }
    : {};

  const scaleAnim = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scaleAnim.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    if (onPress) scaleAnim.value = withSpring(1.0, { damping: 15, stiffness: 300 });
  };

  const highlight = glassEnabled ? (
    <View
      pointerEvents="none"
      style={[styles.highlight, { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }]}
    />
  ) : null;

  // iOS: real BlurView when glass is on
  if (glassEnabled && Platform.OS === 'ios') {
    if (onPress) {
      return (
        <Animated.View style={[animStyle, glowShadow]}>
          <BlurView
            intensity={elevated ? 80 : 55}
            tint="dark"
            style={[styles.base, { borderColor: borderCol, borderRadius }, accentStyle, style]}
          >
            <Pressable
              onPress={onPress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={StyleSheet.absoluteFillObject}
            />
            {highlight}
            {children}
          </BlurView>
        </Animated.View>
      );
    }
    return (
      <BlurView
        intensity={elevated ? 80 : 55}
        tint="dark"
        style={[styles.base, { borderColor: borderCol, borderRadius }, accentStyle, glowShadow, style]}
      >
        {highlight}
        {children}
      </BlurView>
    );
  }

  const bg = glassEnabled
    ? elevated ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.08)'
    : elevated ? theme.colors.surfaceHi : theme.colors.surface;

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.base,
          { backgroundColor: bg, borderColor: borderCol, borderRadius },
          accentStyle,
          glowShadow,
          style,
          animStyle,
        ]}
      >
        {highlight}
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg, borderColor: borderCol, borderRadius },
        accentStyle,
        glowShadow,
        style,
      ]}
    >
      {highlight}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.30)',
  },
});
