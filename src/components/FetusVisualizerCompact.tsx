import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import FETUS_SVGS from '../data/fetusSvgs';
import { formatSize, formatWeight } from './FetusVisualizer';
import type { Theme } from '../theme';

const WEEK_TO_FETUS: Record<number, number> = {
  0: 1, 1: 1,
  2: 2,
  3: 4,
  4: 5,
  5: 6, 6: 6,
  7: 7,
  8: 8, 9: 8,
  10: 9, 11: 9, 12: 9,
  13: 10, 14: 10, 15: 10, 16: 10,
  17: 11, 18: 11, 19: 11, 20: 11,
  21: 12, 22: 12, 23: 12, 24: 12,
  25: 13, 26: 13, 27: 13, 28: 13,
  29: 14, 30: 14, 31: 14, 32: 14,
  33: 15, 34: 15, 35: 15, 36: 15, 37: 15, 38: 15, 39: 15, 40: 15,
};

const WEEK_TO_EMOJI: Record<number, string> = {
  1: '🌱', 2: '🌱', 3: '🌱', 4: '🌱', 5: '🌱',
  6: '🫐', 7: '🫐',
  8: '🍇', 9: '🍇',
  10: '🍓', 11: '🍈',
  12: '🍋', 13: '🍋',
  14: '🍊', 15: '🍎',
  16: '🥑', 17: '🍐',
  18: '🫑', 19: '🥭',
  20: '🍌', 21: '🥕',
  22: '🌽', 23: '🌽', 24: '🌽',
  25: '🥦', 26: '🥬', 27: '🥦',
  28: '🍆', 29: '🎃',
  30: '🥬', 31: '🥥',
  32: '🍍', 33: '🍈', 34: '🍈',
  35: '🥥', 36: '🍈',
  37: '🍉', 38: '🍉', 39: '🍉', 40: '🍉',
};

interface Props {
  week: number;
  sizeMm?: number;
  weightG?: number;
  trimester?: number;
}

export default function FetusVisualizerCompact({ week, sizeMm = 0, weightG = 0, trimester = 1 }: Props) {
  const { theme } = useTheme();
  const s = React.useMemo(() => createStyles(theme), [theme]);

  const fetusNum = WEEK_TO_FETUS[Math.min(Math.max(week, 1), 40)] ?? 1;
  const svgXml = FETUS_SVGS[fetusNum];
  const emoji = WEEK_TO_EMOJI[week] ?? '👶';

  const trimesterColor = trimester === 1
    ? theme.colors.trimester1
    : trimester === 2
    ? theme.colors.trimester2
    : theme.colors.trimester3;

  return (
    <View style={s.row}>
      {/* SVG thumbnail */}
      <View style={s.svgBox}>
        <SvgXml xml={svgXml} width={68} height={78} />
      </View>

      {/* Metrics */}
      <View style={s.info}>
        <Text style={s.emoji}>{emoji}</Text>
        <View style={s.stats}>
          {sizeMm > 0 && (
            <View style={[s.stat, { backgroundColor: theme.colors.primary + '18' }]}>
              <Text style={[s.statVal, { color: theme.colors.primary }]}>{formatSize(sizeMm)}</Text>
              <Text style={s.statLbl}>długość</Text>
            </View>
          )}
          {weightG > 0 && (
            <View style={[s.stat, { backgroundColor: theme.colors.accent + '18' }]}>
              <Text style={[s.statVal, { color: theme.colors.accent }]}>{formatWeight(weightG)}</Text>
              <Text style={s.statLbl}>waga</Text>
            </View>
          )}
        </View>
        {/* Mini progress */}
        <View style={s.progressBar}>
          <View style={[s.progressFill, {
            width: `${Math.min(Math.max(Math.round(((week - 4) / 36) * 100), 2), 100)}%`,
            backgroundColor: trimesterColor,
          }]} />
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  svgBox: {
    width: 80,
    height: 90,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  emoji: {
    fontSize: 28,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  statVal: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  statLbl: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  progressBar: {
    height: 5,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 3,
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
  },
});
