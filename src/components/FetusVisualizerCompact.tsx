import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import FETUS_SVGS from '../data/fetusSvgs';
import { formatSize, formatWeight } from './FetusVisualizer';
import type { Theme } from '../theme';

const WEEK_TO_FETUS: Record<number, number> = {
  1: 1, 2: 1, 3: 1, 4: 1,
  5: 2, 6: 2,
  7: 3, 8: 3,
  9: 4, 10: 4,
  11: 5, 12: 5,
  13: 6,
  14: 7, 15: 7,
  16: 8, 17: 8,
  18: 9, 19: 9, 20: 9,
  21: 10, 22: 10, 23: 10,
  24: 11, 25: 11, 26: 11,
  27: 12, 28: 12, 29: 12,
  30: 13, 31: 13, 32: 13,
  33: 14, 34: 14, 35: 14,
  36: 15, 37: 15, 38: 15, 39: 15, 40: 15,
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
