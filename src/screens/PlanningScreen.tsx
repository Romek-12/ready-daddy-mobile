import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme';
import Icon from '../components/Icon';
import CostCalculator from '../components/CostCalculator';
import ShoppingList from '../components/ShoppingList';
import AuroraBackground from '../components/ui/AuroraBackground';

export default function PlanningScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = React.useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);
  const [tab, setTab] = useState<'shopping' | 'medical'>('shopping');
  const scrollRef = useRef<ScrollView>(null);

  const goTo = (t: 'shopping' | 'medical') => {
    setTab(t);
    scrollRef.current?.scrollTo({ x: t === 'medical' ? width : 0, animated: true });
  };

  const onScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const x = e.nativeEvent.contentOffset.x;
    const newTab = x > width / 2 ? 'medical' : 'shopping';
    if (newTab !== tab) setTab(newTab);
  };

  return (
    <AuroraBackground>
    <View style={s.c}>
      <View style={s.topBar}>
        <View style={s.tabs}>
          <TouchableOpacity style={[s.tab, tab === 'shopping' && s.tabActive, tab === 'shopping' && { backgroundColor: theme.colors.primary + '22' }]} onPress={() => goTo('shopping')}>
            <View style={s.tabInner}>
              <Icon name="shopping-cart" size={16} color={tab === 'shopping' ? theme.colors.primary : theme.colors.textSecondary} />
              <Text style={[s.tabText, tab === 'shopping' && { color: theme.colors.primary, fontWeight: theme.fontWeight.bold }]}> Lista zakupów</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tab, tab === 'medical' && s.tabActive, tab === 'medical' && { backgroundColor: theme.colors.planning + '22' }]} onPress={() => goTo('medical')}>
            <View style={s.tabInner}>
              <Icon name="hospital" size={16} color={tab === 'medical' ? theme.colors.planning : theme.colors.textSecondary} />
              <Text style={[s.tabText, tab === 'medical' && { color: theme.colors.planning, fontWeight: theme.fontWeight.bold }]}> Opieka medyczna</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={s.pager}
        contentContainerStyle={{ width: width * 2 }}
      >
        <View style={{ width }}>
          <ShoppingList />
        </View>
        <View style={{ width }}>
          <CostCalculator />
        </View>
      </ScrollView>
    </View>
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme, topInset: number) => StyleSheet.create({
  c: { flex: 1, backgroundColor: 'transparent' },
  topBar: { paddingTop: topInset + 16, paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md, backgroundColor: 'transparent' },
  tabs: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full, padding: 4 },
  tab: { flex: 1, padding: theme.spacing.md, alignItems: 'center', borderRadius: theme.borderRadius.full },
  tabActive: { backgroundColor: theme.colors.surfaceLight, elevation: 1 },
  tabInner: { flexDirection: 'row', alignItems: 'center' },
  tabText: { color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium, fontSize: theme.fontSize.sm },
  tabTextActive: { color: theme.colors.text, fontWeight: theme.fontWeight.bold },
  pager: { flex: 1 },
});
