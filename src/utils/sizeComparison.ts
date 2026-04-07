import type { SizeComparisonMode } from '../hooks/useSizeMode';

export function getSizeComparison(
  week: { fetus_size_comparison?: string; fetus_size_comparison_animal?: string; fetus_size_comparison_sweet?: string },
  mode: SizeComparisonMode
): string {
  switch (mode) {
    case 'animal': return week.fetus_size_comparison_animal || week.fetus_size_comparison || '';
    case 'sweet':  return week.fetus_size_comparison_sweet  || week.fetus_size_comparison || '';
    default:       return week.fetus_size_comparison || '';
  }
}

export function getSizeEmoji(mode: SizeComparisonMode): string {
  switch (mode) {
    case 'animal': return '🐾';
    case 'sweet':  return '🍬';
    default:       return '🍎';
  }
}
