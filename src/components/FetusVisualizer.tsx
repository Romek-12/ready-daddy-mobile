import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
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

export default function FetusVisualizer({ week, sizeMm = 0, weightG = 0, trimester = 1, weekData }: Props) {
  const { theme } = useTheme();
  const s = React.useMemo(() => createStyles(theme), [theme]);
  const [sizeMode, setSizeMode] = useSizeMode();

  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1800 }),
        withTiming(1.0, { duration: 1800 })
      ),
      -1,
      true
    );
  }, [scale]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const fetusImage = FETUS_IMAGES[Math.min(Math.max(week, 1), 40)];
  const fruit = WEEK_TO_FRUIT[week] ?? { emoji: '👶', name: '' };
  const progress = Math.min(Math.max(Math.round(((week - 4) / 36) * 100), 2), 100);

  const displayName = weekData ? getSizeComparison(weekData, sizeMode) : (sizeMode === 'fruit' ? fruit.name : '');

  const trimesterColor = trimester === 1
    ? theme.colors.trimester1
    : trimester === 2
    ? theme.colors.trimester2
    : theme.colors.trimester3;

  return (
    <View style={s.container}>
      {/* Trimester pills */}
      <View style={s.trimRow}>
        {(['I', 'II', 'III'] as const).map((label, i) => {
          const isActive = trimester === i + 1;
          const color = [theme.colors.trimester1, theme.colors.trimester2, theme.colors.trimester3][i];
          return (
            <View key={label} style={[s.trimPill, { borderColor: color }, isActive && { backgroundColor: color }]}>
              <Text style={[s.trimLabel, { color: isActive ? theme.colors.background : color }]}>
                {label} trym.
              </Text>
            </View>
          );
        })}
      </View>

      {/* Hero: fetus + giant week number */}
      <View style={s.heroRow}>
        <View style={s.svgBox}>
          <Animated.View style={pulseStyle}>
            <Image source={fetusImage} style={{ width: 140, height: 160 }} resizeMode="contain" />
          </Animated.View>
        </View>
        <View style={s.heroRight}>
          <Kicker color={trimesterColor}>Tydzień</Kicker>
          <Text style={[s.heroNumber, { color: theme.colors.text }]}>{week}</Text>
          {displayName ? <Text style={s.heroFruit}>Jestem jak {displayName}</Text> : null}
        </View>
      </View>

      {/* Big metric tiles */}
      <View style={s.metricRow}>
        <View style={s.metricTile}>
          <Icon name="size-fruit" size={18} color={theme.colors.primary} />
          <Text style={[s.metricValue, { color: theme.colors.primary }]}>{formatSize(sizeMm)}</Text>
          <Kicker style={s.metricLabel}>Długość</Kicker>
        </View>
        <View style={s.metricTile}>
          <Icon name="size-sweet" size={18} color={theme.colors.accent} />
          <Text style={[s.metricValue, { color: theme.colors.accent }]}>{formatWeight(weightG)}</Text>
          <Kicker style={s.metricLabel}>Waga</Kicker>
        </View>
      </View>

      {/* Compare to */}
      <View style={s.compareSection}>
        <Kicker style={s.compareKicker}>Porównaj do</Kicker>
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
                  size={22}
                  color={isActive ? theme.colors.black : theme.colors.textSecondary}
                />
                <Text style={[s.modeLabel, isActive && { color: theme.colors.black }]}>{label}</Text>
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
  trimLabel: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.semibold,
    fontWeight: theme.fontWeight.semibold,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  svgBox: {
    width: 140,
    height: 160,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroRight: {
    flex: 1,
    alignItems: 'flex-start',
  },
  heroNumber: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSize.displayLg,
    lineHeight: theme.fontSize.displayLg,
    marginTop: 4,
  },
  heroFruit: {
    fontFamily: theme.fonts.semibold,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metricTile: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'flex-start',
    gap: 4,
  },
  metricValue: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSize.display,
    lineHeight: theme.fontSize.display,
  },
  metricLabel: {
    marginTop: 2,
  },
  compareSection: {
    gap: theme.spacing.sm,
  },
  compareKicker: {},
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
