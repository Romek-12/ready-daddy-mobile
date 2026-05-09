import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView, BlurTargetView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface AuroraBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export default function AuroraBackground({ children, style }: AuroraBackgroundProps) {
  const { theme } = useTheme();
  const targetRef = useRef<View | null>(null);

  const cyanX = useSharedValue(0);
  const cyanY = useSharedValue(0);
  const violetX = useSharedValue(0);
  const violetY = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.inOut(Easing.sin);

    // Style guide §11: drift 30s pętla, w przeciwfazie (cyan vs violet)
    cyanX.value = withRepeat(
      withSequence(withTiming(40, { duration: 15000, easing: ease }), withTiming(0, { duration: 15000, easing: ease })),
      -1, false,
    );
    cyanY.value = withRepeat(
      withSequence(withTiming(35, { duration: 15000, easing: ease }), withTiming(0, { duration: 15000, easing: ease })),
      -1, false,
    );

    // counter-phase
    violetX.value = withRepeat(
      withSequence(withTiming(-45, { duration: 15000, easing: ease }), withTiming(0, { duration: 15000, easing: ease })),
      -1, false,
    );
    violetY.value = withRepeat(
      withSequence(withTiming(-30, { duration: 15000, easing: ease }), withTiming(0, { duration: 15000, easing: ease })),
      -1, false,
    );
  }, [cyanX, cyanY, violetX, violetY]);

  const cyanStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cyanX.value }, { translateY: cyanY.value }],
  }));
  const violetStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: violetX.value }, { translateY: violetY.value }],
  }));

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }, style]}>
      {/* Warstwa blobów — BlurTargetView definiuje co ma być rozmywane */}
      <BlurTargetView ref={targetRef} style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Cyan blob — top-left (zgodnie ze style guide §1) */}
        <AnimatedGradient
          colors={[theme.colors.primary, 'transparent']}
          style={[styles.blobCyan, cyanStyle]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          pointerEvents="none"
        />
        {/* Violet blob — bottom-right (zgodnie ze style guide §1) */}
        <AnimatedGradient
          colors={[theme.colors.violet, 'transparent']}
          style={[styles.blobViolet, violetStyle]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0, y: 0 }}
          pointerEvents="none"
        />
      </BlurTargetView>

      {/* BlurView rozmywa zawartość BlurTargetView — prawdziwy blur na Android 12+ */}
      <BlurView
        blurTarget={targetRef}
        blurMethod="dimezisBlurViewSdk31Plus"
        intensity={70}
        tint="default"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, position: 'relative' },
  // Style guide §1: 340px cyan top-left, 420px violet bottom-right, opacity 0.55
  blobCyan: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    top: -100,
    left: -120,
    opacity: 0.85,
  },
  blobViolet: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    bottom: -120,
    right: -140,
    opacity: 0.85,
  },
  content: { flex: 1, zIndex: 1 },
});
