import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FETUS_IMAGES } from '../data/fetusImages';
import { formatSize, formatWeight } from './FetusVisualizer';
import type { SizeComparisonMode } from '../hooks/useSizeMode';
import type { Theme } from '../theme';



interface Props {
  week: number;
  sizeMm?: number;
  weightG?: number;
  trimester?: number;
  sizeMode?: SizeComparisonMode;
  weekData?: { fetus_size_comparison?: string; fetus_size_comparison_animal?: string; fetus_size_comparison_sweet?: string };
  progress?: number;
  progressLabel?: string;
  onDetails?: () => void;
}

export default function FetusVisualizerCompact({ week, sizeMm = 0, weightG = 0, trimester = 1, sizeMode, weekData, progress, progressLabel, onDetails }: Props) {
  const { theme } = useTheme();
  const s = React.useMemo(() => createStyles(theme), [theme]);

  const fetusImage = FETUS_IMAGES[Math.min(Math.max(week, 1), 40)];

  const trimesterColor = trimester === 1
    ? theme.colors.trimester1
    : trimester === 2
    ? theme.colors.trimester2
    : theme.colors.trimester3;

  return (
    <View style={s.row}>
      {/* Fetus image thumbnail */}
      <View style={s.svgBox}>
        <Image source={fetusImage} style={{ width: 58, height: 68 }} resizeMode="contain" />
      </View>

      {/* Metrics */}
      <View style={s.info}>
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
        {progress !== undefined ? (
          <>
            <View style={s.progressWrapper}>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: trimesterColor }]} />
              </View>
              {progressLabel ? <Text style={s.progressLabel}>{progressLabel}</Text> : null}
            </View>
            {onDetails && (
              <TouchableOpacity onPress={onDetails} style={s.detailsBtn}>
                <Text style={[s.detailsLink, { color: theme.colors.primary }]}>Sprawdź szczegóły →</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={s.progressBar}>
            <View style={[s.progressFill, {
              width: `${Math.min(Math.max(Math.round(((week - 4) / 36) * 100), 2), 100)}%`,
              backgroundColor: trimesterColor,
            }]} />
          </View>
        )}
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
    width: 72,
    height: 82,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  info: {
    flex: 1,
    gap: 6,
    justifyContent: 'space-between',
  },
  emojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 26,
  },
  comparisonName: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
    flexShrink: 1,
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
  progressWrapper: {
    gap: 2,
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
  progressLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  detailsBtn: {
    marginTop: 2,
  },
  detailsLink: {
    fontSize: theme.fontSize.sm,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontWeight: theme.fontWeight.semibold,
  },
});
