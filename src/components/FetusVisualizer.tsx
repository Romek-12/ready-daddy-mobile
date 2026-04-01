import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import FETUS_SVGS from '../data/fetusSvgs';
import type { Theme } from '../theme';

// Mapping based on visual comparison with reference fetal development chart:
// fetus1-6: round womb cross-section (ellipses) = 1st trimester stages
// fetus7-11: oval womb growing (paths only) = 2nd trimester
// fetus12-15: largest, with opacity/shadows = 3rd trimester
const WEEK_TO_FETUS: Record<number, number> = {
  1: 1, 2: 1, 3: 1, 4: 1,        // very early (egg/sperm/cells)
  5: 2, 6: 2,                      // early embryo, round womb
  7: 3, 8: 3,                      // embryo growing
  9: 4, 10: 4,                     // end of embryo stage
  11: 5, 12: 5,                    // early fetus, 1st trimester
  13: 6,                           // end of 1st trimester
  14: 7, 15: 7,                    // 2nd trimester start
  16: 8, 17: 8,                    // 4th month
  18: 9, 19: 9, 20: 9,            // 5th month
  21: 10, 22: 10, 23: 10,         // mid 2nd trimester
  24: 11, 25: 11, 26: 11,         // 6th month
  27: 12, 28: 12, 29: 12,         // 7th month / 3rd trimester start
  30: 13, 31: 13, 32: 13,         // 8th month
  33: 14, 34: 14, 35: 14,         // late 3rd trimester
  36: 15, 37: 15, 38: 15, 39: 15, 40: 15, // term
};

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
}

export default function FetusVisualizer({ week, sizeMm = 0, weightG = 0, trimester = 1 }: Props) {
  const { theme } = useTheme();
  const s = React.useMemo(() => createStyles(theme), [theme]);

  const fetusNum = WEEK_TO_FETUS[Math.min(Math.max(week, 1), 40)] ?? 1;
  const svgXml = FETUS_SVGS[fetusNum];
  const fruit = WEEK_TO_FRUIT[week] ?? { emoji: '👶', name: '' };
  const progress = Math.min(Math.max(Math.round(((week - 4) / 36) * 100), 2), 100);

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

      {/* SVG + metrics */}
      <View style={s.row}>
        <View style={s.svgBox}>
          <SvgXml xml={svgXml} width={155} height={175} />
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

          {/* Fruit emoji */}
          <View style={[s.fruitBox, { backgroundColor: trimesterColor + '18' }]}>
            <Text style={s.fruitEmoji}>{fruit.emoji}</Text>
            {fruit.name ? <Text style={[s.fruitName, { color: trimesterColor }]}>jak {fruit.name}</Text> : null}
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
  fruitEmoji: {
    fontSize: 32,
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
});
