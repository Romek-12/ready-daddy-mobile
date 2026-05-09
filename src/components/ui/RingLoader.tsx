import React, { useEffect } from 'react';
import { View, ViewStyle, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export interface RingLoaderProps {
  /** Diameter in px. Default 200. */
  size?: number;
  /** Number of segments around the ring. Default: 20 if size<64, otherwise 40. */
  segments?: number;
  /** Length of trail in segments. Default: round(segments * 0.75). */
  trail?: number;
  /** Time for one full rotation in ms. Default 3600. */
  duration?: number;
  /** Gradient stops. Default cyan→teal. */
  fromColor?: string;
  toColor?: string;
  /** Show "RD" monogram in center. Auto-disabled for size<64. Default true. */
  showMonogram?: boolean;
  /** Optional fixed progress 0–1 (disables animation). */
  progress?: number;
  style?: ViewStyle;
  testID?: string;
}

const SMALL_SIZE_THRESHOLD = 64;

/**
 * Ready Daddy ring loader — 40-segment progress ring with comet-trail animation.
 * Use animated mode (default) for indeterminate loading; pass `progress` for determinate.
 *
 * Sizing:
 *  - size >= 64: 40 segments, monogram visible (if showMonogram).
 *  - size < 64: 20 segments, monogram hidden (regardless of showMonogram).
 */
export default function RingLoader({
  size = 200,
  segments,
  trail,
  duration = 3600,
  fromColor = '#00E5FF',
  toColor = '#00BFA5',
  showMonogram = true,
  progress,
  style,
  testID,
}: RingLoaderProps) {
  const isSmall = size < SMALL_SIZE_THRESHOLD;
  const resolvedSegments = segments ?? (isSmall ? 20 : 40);
  const resolvedTrail = trail ?? Math.round(resolvedSegments * 0.75);
  const monogramVisible = showMonogram && !isSmall;

  const head = useSharedValue(0);

  useEffect(() => {
    if (progress === undefined) {
      head.value = withRepeat(
        withTiming(resolvedSegments, { duration, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      head.value = withTiming(progress * resolvedSegments, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [progress, resolvedSegments, duration, head]);

  const monogramFontSize = Math.round(size * 0.31);

  return (
    <View style={[{ width: size, height: size }, style]} testID={testID}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={fromColor} />
            <Stop offset="1" stopColor={toColor} />
          </LinearGradient>
        </Defs>

        {Array.from({ length: resolvedSegments }).map((_, i) => (
          <Segment
            key={i}
            index={i}
            segments={resolvedSegments}
            trail={resolvedTrail}
            head={head}
            indeterminate={progress === undefined}
          />
        ))}
      </Svg>

      {monogramVisible && (
        <Text
          style={[
            styles.monogram,
            { fontSize: monogramFontSize, color: fromColor },
          ]}
        >
          RD
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  monogram: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'ClimateCrisis',
  },
});

interface SegmentProps {
  index: number;
  segments: number;
  trail: number;
  head: SharedValue<number>;
  indeterminate: boolean;
}

function Segment({ index, segments, trail, head, indeterminate }: SegmentProps) {
  const animatedProps = useAnimatedProps(() => {
    const dist = indeterminate
      ? (head.value - index + segments) % segments
      : index < head.value
        ? 0
        : segments;

    const opacity =
      dist < trail
        ? interpolate(dist, [0, trail], [1, 0.12], Extrapolation.CLAMP)
        : 0.12;

    return { opacity };
  });

  return (
    <AnimatedRect
      x={98}
      y={14}
      width={4}
      height={14}
      rx={2}
      fill="url(#ringGrad)"
      transform={`rotate(${(index / segments) * 360} 100 100)`}
      animatedProps={animatedProps}
    />
  );
}
