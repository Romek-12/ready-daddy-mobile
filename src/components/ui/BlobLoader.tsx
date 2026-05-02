import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  size?: number;
  week?: number;
  label?: string;
  sub?: string;
}

// Organic blob path — static first keyframe from spec
const BLOB_PATH =
  'M50,10 C68,5 88,18 93,36 C98,54 88,74 72,84 C56,94 32,92 18,80 C4,68 2,46 10,30 C18,14 32,15 50,10Z';

export default function BlobLoader({ size = 120, week, label, sub }: Props) {
  const { theme } = useTheme();

  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const counterRotate = useSharedValue(0);

  useEffect(() => {
    // Slow rotation 18s
    rotate.value = withRepeat(
      withTiming(360, { duration: 18000, easing: Easing.linear }),
      -1,
      false,
    );
    // Counter-rotation for inner ring (12s)
    counterRotate.value = withRepeat(
      withTiming(-360, { duration: 12000, easing: Easing.linear }),
      -1,
      false,
    );
    // Pulse scale 3.5s
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1750, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0, { duration: 1750, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [rotate, scale, counterRotate]);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }, { scale: scale.value }],
  }));

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${counterRotate.value}deg` }],
  }));

  const glowSize = size * 1.3;

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      {/* Glow background */}
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            backgroundColor: theme.colors.primaryGlow,
            top: -(glowSize - size) / 2,
            left: -(glowSize - size) / 2,
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.55,
            shadowRadius: size * 0.35,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      />

      {/* Rotating blob SVG */}
      <Animated.View style={[StyleSheet.absoluteFillObject, outerStyle]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="blobGrad" cx="40%" cy="35%" r="65%">
              <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.9" />
              <Stop offset="100%" stopColor={theme.colors.violet} stopOpacity="0.7" />
            </RadialGradient>
          </Defs>
          <Path d={BLOB_PATH} fill="url(#blobGrad)" />
        </Svg>
      </Animated.View>

      {/* Counter-rotating decorative ring */}
      <Animated.View style={[StyleSheet.absoluteFillObject, innerStyle]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke={theme.colors.primary}
            strokeWidth="0.6"
            strokeOpacity="0.35"
            strokeDasharray="4 6"
          />
        </Svg>
      </Animated.View>

      {/* Center content */}
      <View style={styles.center} pointerEvents="none">
        {week !== undefined ? (
          <>
            <Text style={[styles.weekNum, { fontFamily: theme.fonts.title, color: theme.colors.black, fontSize: size * 0.28 }]}>
              {week}
            </Text>
            <Text style={[styles.weekLabel, { fontFamily: theme.fonts.mono, color: theme.colors.black, fontSize: size * 0.10 }]}>
              TYG
            </Text>
          </>
        ) : label ? (
          <Text style={[styles.label, { color: theme.colors.text, fontSize: size * 0.10, fontFamily: theme.fonts.semibold }]} numberOfLines={2}>
            {label}
          </Text>
        ) : null}
        {sub && (
          <Text style={[styles.sub, { color: theme.colors.textSecondary, fontSize: size * 0.08, fontFamily: theme.fonts.mono }]} numberOfLines={1}>
            {sub}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    opacity: 0.25,
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    height: '60%',
  },
  weekNum: {
    fontWeight: '800',
    lineHeight: undefined,
  },
  weekLabel: {
    letterSpacing: 2,
    marginTop: 2,
  },
  label: {
    textAlign: 'center',
    lineHeight: 16,
  },
  sub: {
    marginTop: 4,
    letterSpacing: 1,
    textAlign: 'center',
  },
});
