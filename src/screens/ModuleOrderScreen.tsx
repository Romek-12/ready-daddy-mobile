import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReorderableList, {
  useReorderableDrag,
  reorderItems,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { useTheme } from '../context/ThemeContext';
import { useModuleOrder } from '../hooks/useModuleOrder';
import AuroraBackground from '../components/ui/AuroraBackground';
import GlassCard from '../components/ui/GlassCard';
import Icon from '../components/Icon';
import type { HomeStackParamList } from '../types/navigation';
import type { Theme } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'ModuleOrder'>;

type ModuleItem = { key: string; icon: string; label: string; color: string };

const ALL_MODULES: ModuleItem[] = [
  { key: 'WeekDetailTab',    icon: 'fetus',       label: 'Rozwój dziecka',    color: '#00BCD4' },
  { key: 'ActionCards',      icon: 'bolt',        label: 'Co robić teraz?',   color: '#FF9800' },
  { key: 'Checkups',         icon: 'calendar',    label: 'Lekarz i badania',  color: '#4CAF50' },
  { key: 'Planning',         icon: 'planning',    label: 'Planowanie',        color: '#9C27B0' },
  { key: 'BirthPrep',        icon: 'hospital',    label: 'Porodówka',         color: '#F44336' },
  { key: 'DadModuleTab',     icon: 'dad',         label: 'Co czujesz?',       color: '#2196F3' },
  { key: 'FourthTrimester',  icon: 'baby',        label: '4. Trymestr',       color: '#FF5722' },
  { key: 'PostBirth',        icon: 'post-birth',  label: 'Po porodzie',       color: '#607D8B' },
  { key: 'FirstYear',        icon: 'baby',        label: 'Pierwszy Rok',      color: '#3F51B5' },
  { key: 'NameDraw',         icon: 'dice',        label: 'Wybór imienia',     color: '#E91E63' },
  { key: 'PregnancySafety',  icon: 'shield',      label: 'Co jeść / unikać', color: '#F44336' },
  { key: 'Badges',           icon: 'diamond',     label: 'Odznaki',           color: '#A855F7' },
];

const DEFAULT_ORDER = ALL_MODULES.map(m => m.key);

function Row({ item }: { item: ModuleItem }) {
  const { theme } = useTheme();
  const s = useMemo(() => rowStyles(theme), [theme]);
  const drag = useReorderableDrag();

  return (
    <TouchableOpacity onLongPress={drag} activeOpacity={0.85} delayLongPress={150}>
      <GlassCard style={s.row}>
        <View style={[s.iconWrap, { backgroundColor: item.color + '20' }]}>
          <Icon name={item.icon} size={22} color={item.color} />
        </View>
        <Text style={s.label}>{item.label}</Text>
        <Icon name="drag-handle" size={20} color={theme.colors.textMuted} />
      </GlassCard>
    </TouchableOpacity>
  );
}

export default function ModuleOrderScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);
  const [moduleOrder, setModuleOrder] = useModuleOrder(DEFAULT_ORDER);

  const modules: ModuleItem[] = useMemo(() => {
    const map = Object.fromEntries(ALL_MODULES.map(m => [m.key, m]));
    return moduleOrder.map(k => map[k]).filter(Boolean) as ModuleItem[];
  }, [moduleOrder]);

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    const reordered = reorderItems(modules, from, to);
    setModuleOrder(reordered.map(m => m.key));
  };

  return (
    <AuroraBackground>
      <View style={s.container}>
        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={s.title}>Kolejność sekcji</Text>
          <View style={{ width: 44 }} />
        </View>
        <Text style={s.hint}>Przytrzymaj i przeciągnij, by zmienić kolejność kafelków w menu głównym.</Text>

        <ReorderableList
          data={modules}
          renderItem={({ item }) => <Row item={item} />}
          keyExtractor={item => item.key}
          onReorder={handleReorder}
          contentContainerStyle={s.listContent}
        />
      </View>
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme, topInset: number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', paddingHorizontal: theme.spacing.lg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: topInset + 16,
    paddingBottom: theme.spacing.md,
  },
  backBtn: { padding: theme.spacing.sm },
  title: { fontSize: theme.fontSize.lg, fontFamily: theme.fonts.bold, color: theme.colors.text },
  hint: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginBottom: theme.spacing.lg, lineHeight: 20 },
  listContent: { paddingBottom: 40, gap: 8 },
});

const rowStyles = (theme: Theme) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
    height: 64,
    marginBottom: 8,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  label: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text, fontFamily: theme.fonts.medium },
});
