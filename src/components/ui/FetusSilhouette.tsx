import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  week: number;
  size?: number;
}

function weekStr(week: number): string {
  return String(week).padStart(2, '0');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FETUS_IMAGES: Record<string, any> = {
  '01': require('../../../assets/fetus/fetus_week_01.png'),
  '02': require('../../../assets/fetus/fetus_week_02.png'),
  '03': require('../../../assets/fetus/fetus_week_03.png'),
  '04': require('../../../assets/fetus/fetus_week_04.png'),
  '05': require('../../../assets/fetus/fetus_week_05.png'),
  '06': require('../../../assets/fetus/fetus_week_06.png'),
  '07': require('../../../assets/fetus/fetus_week_07.png'),
  '08': require('../../../assets/fetus/fetus_week_08.png'),
  '09': require('../../../assets/fetus/fetus_week_09.png'),
  '10': require('../../../assets/fetus/fetus_week_10.png'),
  '11': require('../../../assets/fetus/fetus_week_11.png'),
  '12': require('../../../assets/fetus/fetus_week_12.png'),
  '13': require('../../../assets/fetus/fetus_week_13.png'),
  '14': require('../../../assets/fetus/fetus_week_14.png'),
  '15': require('../../../assets/fetus/fetus_week_15.png'),
  '16': require('../../../assets/fetus/fetus_week_16.png'),
  '17': require('../../../assets/fetus/fetus_week_17.png'),
  '18': require('../../../assets/fetus/fetus_week_18.png'),
  '19': require('../../../assets/fetus/fetus_week_19.png'),
  '20': require('../../../assets/fetus/fetus_week_20.png'),
  '21': require('../../../assets/fetus/fetus_week_21.png'),
  '22': require('../../../assets/fetus/fetus_week_22.png'),
  '23': require('../../../assets/fetus/fetus_week_23.png'),
  '24': require('../../../assets/fetus/fetus_week_24.png'),
  '25': require('../../../assets/fetus/fetus_week_25.png'),
  '26': require('../../../assets/fetus/fetus_week_26.png'),
  '27': require('../../../assets/fetus/fetus_week_27.png'),
  '28': require('../../../assets/fetus/fetus_week_28.png'),
  '29': require('../../../assets/fetus/fetus_week_29.png'),
  '30': require('../../../assets/fetus/fetus_week_30.png'),
  '31': require('../../../assets/fetus/fetus_week_31.png'),
  '32': require('../../../assets/fetus/fetus_week_32.png'),
  '33': require('../../../assets/fetus/fetus_week_33.png'),
  '34': require('../../../assets/fetus/fetus_week_34.png'),
  '35': require('../../../assets/fetus/fetus_week_35.png'),
  '36': require('../../../assets/fetus/fetus_week_36.png'),
  '37': require('../../../assets/fetus/fetus_week_37.png'),
  '38': require('../../../assets/fetus/fetus_week_38.png'),
  '39': require('../../../assets/fetus/fetus_week_39.png'),
  '40': require('../../../assets/fetus/fetus_week_40.png'),
};

export default function FetusSilhouette({ week, size = 110 }: Props) {
  const { theme } = useTheme();

  const scale = useSharedValue(1.0);
  const opacity = useSharedValue(0.85);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1750, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0, { duration: 1750, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 1750, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.85, { duration: 1750, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const key = weekStr(Math.min(Math.max(week, 1), 40));
  const source = FETUS_IMAGES[key];
  const glowSize = size * 1.4;

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      {/* Aurora glow blobs */}
      <View
        pointerEvents="none"
        style={[
          styles.glowBlob,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            top: -(glowSize - size) / 2,
            left: -(glowSize - size) / 2,
            backgroundColor: theme.colors.primaryGlow,
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.6,
            shadowRadius: size * 0.4,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.glowBlob,
          {
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: size * 0.4,
            bottom: -(size * 0.1),
            right: -(size * 0.1),
            backgroundColor: theme.colors.violetGlow,
            shadowColor: theme.colors.violet,
            shadowOpacity: 0.4,
            shadowRadius: size * 0.25,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      />

      {/* Glass ring border */}
      <View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: theme.colors.cardBorderHi,
          },
        ]}
      />

      {/* Pulsing fetus PNG */}
      <Animated.View style={[StyleSheet.absoluteFillObject, animStyle, styles.imageWrap]}>
        {source ? (
          <Image
            source={source}
            style={[styles.image, { width: size * 0.8, height: size * 0.8 }]}
            resizeMode="contain"
          />
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBlob: {
    position: 'absolute',
    opacity: 0.22,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    // drop-shadow approximation via shadow on the wrapper view (animStyle)
  },
});
