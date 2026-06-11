import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { FETUS_IMAGES } from '../data/fetusImages';
import { useSizeMode, SizeComparisonMode } from '../hooks/useSizeMode';
import { getSizeComparison } from '../utils/sizeComparison';
import Icon from './Icon';
import Kicker from './ui/Kicker';
import GradientProgressBar from './ui/GradientProgressBar';
import type { Theme } from '../theme';


const WEEK_TO_FRUIT: Record<number, { emoji: string; name: string }> = {
  1: { emoji: '🌱', name: '' }, 2: { emoji: '🌱', name: '' }, 3: { emoji: '🌱', name: '' },
  4: { emoji: '🌱', name: '' }, 5: { emoji: '🌱', name: '' },
  6: { emoji: '🫐', name: 'Borówka' }, 7: { emoji: '🫐', name: 'Borówka' },
  8: { emoji: '🍇', name: 'Winogrono' }, 9: { emoji: '🍇', name: 'Winogrono' },
  10: { emoji: '🍓', name: 'Truskawka' },
  11: { emoji: '🍈', name: 'Figa' },
  12: { emoji: '🍋', name: 'Śliwka' },
  13: { emoji: '🍋', name: 'Cytryna' },
  14: { emoji: '🍊', name: 'Pomarańcza' },
  15: { emoji: '🍎', name: 'Jabłko' },
  16: { emoji: '🥑', name: 'Awokado' },
  17: { emoji: '🍐', name: 'Gruszka' },
  18: { emoji: '🫑', name: 'Papryka' },
  19: { emoji: '🥭', name: 'Mango' },
  20: { emoji: '🍌', name: 'Banan' },
  21: { emoji: '🥕', name: 'Marchewka' },
  22: { emoji: '🌽', name: 'Kukurydza' }, 23: { emoji: '🌽', name: 'Kukurydza' }, 24: { emoji: '🌽', name: 'Kukurydza' },
  25: { emoji: '🥦', name: 'Brokuł' },
  26: { emoji: '🥬', name: 'Sałata' },
  27: { emoji: '🥦', name: 'Kalafior' },
  28: { emoji: '🍆', name: 'Bakłażan' },
  29: { emoji: '🎃', name: 'Dynia' },
  30: { emoji: '🥬', name: 'Kapusta' },
  31: { emoji: '🥥', name: 'Kokos' },
  32: { emoji: '🍍', name: 'Ananas' },
  33: { emoji: '🍈', name: 'Melon' }, 34: { emoji: '🍈', name: 'Melon' },
  35: { emoji: '🥥', name: 'Kokos' },
  36: { emoji: '🍈', name: 'Melon' },
  37: { emoji: '🍉', name: 'Arbuz' }, 38: { emoji: '🍉', name: 'Arbuz' },
  39: { emoji: '🍉', name: 'Arbuz' }, 40: { emoji: '🍉', name: 'Arbuz' },
};

export function formatSize(mm: number): string {
  if (!mm || mm === 0) return '< 1 cm';
  if (mm < 10) return `${mm} mm`;
  return `${(mm / 10).toFixed(1)} cm`;
}

export function formatWeight(g: number): string {
  if (!g || g === 0) return '< 1 g';
  if (g < 1000) return `${g} g`;
  return `${(g / 1000).toFixed(2)} kg`;
}

interface Props {
  week: number;
  sizeMm?: number;
  weightG?: number;
  trimester?: number;
  weekData?: { fetus_size_comparison?: string; fetus_size_comparison_animal?: string; fetus_size_comparison_sweet?: string };
}

const SIZE_MODES: { mode: SizeComparisonMode; label: string; icon: string }[] = [
  { mode: 'fruit',  label: 'Owoc',    icon: 'size-fruit' },
  { mode: 'animal', label: 'Zwierzę', icon: 'size-animal' },
  { mode: 'sweet',  label: 'Słodycz', icon: 'size-sweet' },
];

function MetricTile({ value, label, glowColor }: { value: string; label: string; glowColor: string; theme: Theme }) {
  const parts = value.match(/^([\d.,<]+\s*)(.*)$/) ?? [value, value, ''];
  const num = parts[1].trim();
  const unit = parts[2].trim();

  return (
    <View style={[metricStyles.tile, { borderColor: glowColor + '35' }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: glowColor + '0C', borderRadius: 20 }]} />
      <View style={metricStyles.numRow}>
        <Text
          style={[metricStyles.num, { color: glowColor, textShadowColor: glowColor + 'AA', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14 }]}
          adjustsFontSizeToFit
          numberOfLines={1}
          minimumFontScale={0.5}
        >{num}</Text>
        {unit ? <Text style={[metricStyles.unit, { color: glowColor + 'BB' }]}>{unit.toLowerCase()}</Text> : null}
      </View>
      <Text style={metricStyles.label}>{label}</Text>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 100,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  numRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  num: {
    fontFamily: 'ClimateCrisis',
    fontVariationSettings: '"wght" 800',
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1,
    flexShrink: 1,
  },
  unit: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    marginLeft: 3,
    letterSpacing: 0,
  },
  label: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(240,250,247,0.45)',
  },
});

export default function FetusVisualizer({ week, sizeMm = 0, weightG = 0, trimester = 1, weekData }: Props) {
  const { theme } = useTheme();
  const s = React.useMemo(() => createStyles(theme), [theme]);
  const [sizeMode, setSizeMode] = useSizeMode();

  const scale = useSharedValue(1);
  const glowScale = useSharedValue(1);

  // Start animations once — don't depend on week/trimester so they don't restart on week change
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 2200 }),
        withTiming(1.0, { duration: 2200 })
      ),
      -1,
      true
    );
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 2200 }),
        withTiming(0.95, { duration: 2200 })
      ),
      -1,
      true
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }], opacity: 0.55 }));

  const fetusImage = FETUS_IMAGES[Math.min(Math.max(week, 1), 40)];
  const fruit = WEEK_TO_FRUIT[week] ?? { emoji: '👶', name: '' };
  const progress = Math.min(Math.max(Math.round(((week - 4) / 36) * 100), 2), 100);

  const displayName = weekData ? getSizeComparison(weekData, sizeMode) : (sizeMode === 'fruit' ? fruit.name : '');

  const trimesterColor = trimester === 1
    ? theme.colors.trimester1
    : trimester === 2
    ? theme.colors.primary
    : theme.colors.trimester3;

  const trimColors: [string, string] = [theme.colors.primary, theme.colors.violet];

  return (
    <View style={s.container}>
      {/* Trimester pills */}
      <View style={s.trimRow}>
        {(['I', 'II', 'III'] as const).map((label, i) => {
          const isActive = trimester === i + 1;
          return (
            <View key={label} style={[s.trimPill, isActive ? s.trimPillActive : s.trimPillInactive]}>
              <Text style={[s.trimLabel, { color: isActive ? theme.colors.background : theme.colors.textMuted }]}>
                {label} trym.
              </Text>
            </View>
          );
        })}
      </View>

      {/* Hero row: week number LEFT, fetus image RIGHT */}
      <View style={s.heroRow}>
        {/* Left: week info */}
        <View style={s.heroLeft}>
          <Kicker color={trimesterColor}>Tydzień</Kicker>
          <Text
            style={[s.heroNumber, { color: theme.colors.text, textShadowColor: trimesterColor + '66', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 }]}
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.5}
          >
            {week}
          </Text>
          {displayName ? (
            <Text style={s.heroFruit}>Jestem jak{'\n'}{displayName}</Text>
          ) : null}
        </View>

        {/* Right: fetus with soft shadow glow behind */}
        <View style={s.fetusBox}>
          {/* Layered soft glow — concentric circles fading outward */}
          <Animated.View style={[s.glowOuter, glowStyle, { backgroundColor: trimesterColor + '14' }]} pointerEvents="none" />
          <Animated.View style={[s.glowMid, glowStyle, { backgroundColor: trimesterColor + '1F' }]} pointerEvents="none" />
          <Animated.View style={[s.glowInner, glowStyle, { backgroundColor: trimesterColor + '33' }]} pointerEvents="none" />
          <Animated.View style={[s.glowCore, glowStyle, { backgroundColor: trimesterColor + '55' }]} pointerEvents="none" />
          <Animated.View style={pulseStyle}>
            <Image source={fetusImage} style={s.fetusImage} resizeMode="contain" />
          </Animated.View>
        </View>
      </View>

      {/* Metric tiles */}
      <View style={s.metricRow}>
        <MetricTile value={formatSize(sizeMm)} label="Długość" glowColor={theme.colors.primary} theme={theme} />
        <MetricTile value={formatWeight(weightG)} label="Waga" glowColor={theme.colors.violet} theme={theme} />
      </View>

      {/* Compare to */}
      <View style={s.compareSection}>
        <Kicker>Porównaj do</Kicker>
        <View style={s.modeRow}>
          {SIZE_MODES.map(({ mode, label, icon }) => {
            const isActive = sizeMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                style={[s.modeBtn, isActive && s.modeBtnActive]}
                onPress={() => setSizeMode(mode)}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityState={{ checked: isActive }}
              >
                <Icon
                  name={icon}
                  size={24}
                  color={isActive ? theme.colors.black : theme.colors.textSecondary}
                />
                <Text style={[s.modeLabel, isActive && { color: theme.colors.black, fontFamily: theme.fonts.semibold }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Progress */}
      <View style={s.progressSection}>
        <View style={s.progressRow}>
          <Kicker>Postęp</Kicker>
          <Text style={[s.progressPct, { color: theme.colors.primary }]}>{progress}%</Text>
        </View>
        <GradientProgressBar value={progress} height={6} glow />
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  trimRow: {
    flexDirection: 'row',
    gap: 8,
  },
  trimPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  trimPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  trimPillInactive: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.cardBorderHi,
  },
  trimLabel: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.semibold,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: 160,
  },
  heroLeft: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 4,
  },
  heroNumber: {
    fontFamily: theme.fonts.title,
    fontVariationSettings: '"wght" 800',
    fontSize: 56,
    lineHeight: 58,
    letterSpacing: -2,
    marginTop: 2,
  },
  heroFruit: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  fetusBox: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  glowMid: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  glowInner: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  glowCore: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  fetusImage: {
    width: 140,
    height: 160,
  },
  metricRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  compareSection: {
    gap: theme.spacing.sm,
  },
  modeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 4,
  },
  modeBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modeLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressSection: {
    gap: theme.spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPct: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.lg,
  },
});
