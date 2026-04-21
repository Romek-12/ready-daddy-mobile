import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FETUS_IMAGES } from '../data/fetusImages';
import { useSizeMode, SizeComparisonMode } from '../hooks/useSizeMode';
import { getSizeComparison } from '../utils/sizeComparison';
import Icon from './Icon';
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
                {label} trymestr
              </Text>
            </View>
          );
        })}
      </View>

      {/* Fetus image + metrics */}
      <View style={s.row}>
        <View style={s.svgBox}>
          <Image source={fetusImage} style={{ width: 155, height: 175 }} resizeMode="contain" />
        </View>

        <View style={s.metrics}>
          {/* Size & weight */}
          <View style={s.metricRow}>
            <View style={[s.metricBox, { borderColor: theme.colors.primary + '40' }]}>
              <Text style={[s.metricValue, { color: theme.colors.primary }]}>{formatSize(sizeMm)}</Text>
              <Text style={s.metricLabel}>Długość</Text>
            </View>
            <View style={[s.metricBox, { borderColor: theme.colors.accent + '40' }]}>
              <Text style={[s.metricValue, { color: theme.colors.accent }]}>{formatWeight(weightG)}</Text>
              <Text style={s.metricLabel}>Waga</Text>
            </View>
          </View>

          {/* Size comparison */}
          <View style={[s.fruitBox, { backgroundColor: trimesterColor + '18' }]}>
            {displayName ? <Text style={[s.fruitName, { color: trimesterColor }]}>Jestem jak {displayName}</Text> : null}
          </View>

          {/* Mode toggle buttons */}
          <View style={s.modeRow}>
            {SIZE_MODES.map(({ mode, icon }) => {
              const isActive = sizeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[s.modeBtn, isActive && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                  onPress={() => setSizeMode(mode)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isActive }}
                >
                  <Icon
                    name={icon}
                    size={18}
                    color={isActive ? theme.colors.background : theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Progress */}
          <View style={s.progressWrap}>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${progress}%`, backgroundColor: trimesterColor }]} />
            </View>
            <Text style={s.progressText}>{progress}% ciąży</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  trimRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  trimPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  trimLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  svgBox: {
    width: 155,
    height: 175,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  metrics: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  metricValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  metricLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  fruitBox: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fruitName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  progressWrap: {
    gap: 4,
  },
  progressBar: {
    height: 7,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 4,
  },
  progressFill: {
    height: 7,
    borderRadius: 4,
  },
  progressText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  modeRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  modeBtnText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
