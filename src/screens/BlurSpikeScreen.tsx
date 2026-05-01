/**
 * FAZA 0 – spike test BlurView na Androidzie.
 * Ekran tymczasowy – usunąć po zakończeniu testów.
 *
 * Jak testować:
 *   1. Odpal na realnym urządzeniu (NIE emulatorze).
 *   2. Sprawdź każdy wariant wzrokowo – czy blur jest widoczny, czy czarny prostokąt.
 *   3. Przewiń wariant 5 (scroll) i obserwuj czy jest jank.
 *   4. Wyniki wpisz w komentarzu w Notion "Faza 0 – BlurView spike test".
 *
 * PASS = wszystkie 5 wariantów renderuje blur, brak czarnych prostokątów,
 *        scroll płynny (≥45fps na słabszym Androidzie).
 */
import React, { useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Platform,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CYAN    = '#4DD9C0';
const VIOLET  = '#9B7FD4';
const BG      = '#0B1512';

export default function BlurSpikeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Tło z kolorowymi blobami – musi być widoczne pod blurami */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <LinearGradient
          colors={['#0B1512', '#0E1A17', '#0B1512']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.blobCyan} />
        <View style={styles.blobViolet} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Wróć</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Faza 0 · BlurView spike</Text>
        <Text style={styles.sub}>Testuj na REALNYM urządzeniu, nie emulatorze.</Text>

        {/* ── Wariant 1: intensity=20, tint=dark ── */}
        <Label text="W1 · intensity=20 tint=dark (podstawowy GlassCard)" />
        <View style={styles.cardOuter}>
          <BlurView
            intensity={20}
            tint="dark"
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.cardTitle}>Blur widoczny?</Text>
          <Text style={styles.cardBody}>
            Powinnaś/powinieneś widzieć lekko rozmyte tło (cyjanowy blob) przez tę kartę.
            Jeśli karta jest jednolicie czarna – FAIL.
          </Text>
          <ResultBadge label="intensity 20" />
        </View>

        {/* ── Wariant 2: intensity=50, dimezisBlurView ── */}
        <Label text="W2 · intensity=50 + dimezisBlurView (mocniejszy blur)" />
        <View style={styles.cardOuter}>
          <BlurView
            intensity={50}
            tint="dark"
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.cardTitle}>Mocniejszy blur</Text>
          <Text style={styles.cardBody}>
            Tło powinno być wyraźnie rozmyte. Kolory bloba widoczne jako miękka mgła.
          </Text>
          <ResultBadge label="intensity 50" />
        </View>

        {/* ── Wariant 3: BlurView absolute ponad gradientem ── */}
        <Label text="W3 · BlurView absolute nad LinearGradient" />
        <View style={styles.gradientWrap}>
          <LinearGradient
            colors={[CYAN + '88', VIOLET + '88']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <BlurView
            intensity={30}
            tint="dark"
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.cardTitle}>Blur nad gradientem</Text>
          <Text style={styles.cardBody}>
            Gradient cyanowo-fioletowy powinien być widoczny, ale zmatowiony przez blur.
          </Text>
          <ResultBadge label="absolute blur" />
        </View>

        {/* ── Wariant 4: BlurView jako TabBar ── */}
        <Label text="W4 · BlurView imitujący TabBar (dół ekranu)" />
        <View style={styles.fakeTabWrap}>
          <BlurView
            intensity={24}
            tint="dark"
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.fakeTabBorder} />
          {['🏠', '🧬', '⚡', '📖', '👤'].map((icon, i) => (
            <View key={i} style={styles.fakeTabItem}>
              <Text style={[styles.fakeTabIcon, i === 0 && styles.fakeTabActive]}>{icon}</Text>
              <Text style={[styles.fakeTabLabel, i === 0 && styles.fakeTabActive]}>
                {['Start', 'Rozwój', 'Karty', 'Dziennik', 'Ja'][i]}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.note}>↑ TabBar powyżej – powinien być półprzezroczysty, nie czarny.</Text>

        {/* ── Wariant 5: BlurView w scrollowanej liście ── */}
        <Label text="W5 · BlurView w liście (test jank przy scrollu)" />
        <Text style={styles.note}>Przewiń tę sekcję szybko w górę i w dół. Obserwuj FPS.</Text>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={styles.listCard}>
            <BlurView
              intensity={20}
              tint="dark"
              experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.listCardContent}>
              <Text style={styles.listCardTitle}>Karta #{i + 1} z 8</Text>
              <Text style={styles.listCardSub}>Czy scroll jest płynny? (bez szarpania)</Text>
            </View>
          </View>
        ))}

        {/* ── Podsumowanie ── */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Jak ocenić wynik?</Text>
          <Text style={styles.summaryText}>
            ✅ PASS: Wszystkie 5 wariantów pokazuje blur (nie czarny prostokąt), scroll W5 bez jank.{'\n\n'}
            ❌ FAIL: Którykolwiek wariant czarny LUB wyraźny jank przy scrollu W5.{'\n\n'}
            Wynik: wpisz w Notion "Faza 0 – BlurView spike test" ze screenshotami.
          </Text>
          <Text style={styles.summaryMeta}>
            Platform: {Platform.OS} · {Platform.Version}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function ResultBadge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { padding: 16, gap: 8 },
  blobCyan: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(77,217,192,0.45)', top: -60, left: -60,
  },
  blobViolet: {
    position: 'absolute', width: 380, height: 380, borderRadius: 190,
    backgroundColor: 'rgba(155,127,212,0.45)', bottom: -100, right: -80,
  },
  back: { marginBottom: 8 },
  backText: { color: CYAN, fontSize: 14 },
  heading: {
    fontSize: 22, fontWeight: '700', color: '#E8F4F1', marginBottom: 4,
  },
  sub: { fontSize: 13, color: 'rgba(232,244,241,0.6)', marginBottom: 16 },
  label: {
    fontSize: 11, color: CYAN, fontWeight: '600',
    letterSpacing: 0.5, marginTop: 16, marginBottom: 6, textTransform: 'uppercase',
  },

  // Wariant 1 & 2
  cardOuter: {
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    padding: 16, minHeight: 100,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#E8F4F1', marginBottom: 6 },
  cardBody: { fontSize: 13, color: 'rgba(232,244,241,0.7)', lineHeight: 20 },
  badge: {
    alignSelf: 'flex-start', marginTop: 10,
    backgroundColor: 'rgba(77,217,192,0.15)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(77,217,192,0.3)',
  },
  badgeText: { color: CYAN, fontSize: 11, fontWeight: '600' },

  // Wariant 3
  gradientWrap: {
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    padding: 16, minHeight: 100,
  },

  // Wariant 4 - fake TabBar
  fakeTabWrap: {
    flexDirection: 'row', height: 64,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    marginTop: 4,
  },
  fakeTabBorder: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 1, backgroundColor: 'rgba(255,255,255,0.12)',
  },
  fakeTabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  fakeTabIcon: { fontSize: 20, color: 'rgba(232,244,241,0.5)' },
  fakeTabLabel: { fontSize: 9, color: 'rgba(232,244,241,0.4)' },
  fakeTabActive: { color: CYAN },
  note: { fontSize: 12, color: 'rgba(232,244,241,0.5)', marginTop: 4, fontStyle: 'italic' },

  // Wariant 5 - lista
  listCard: {
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: 8, minHeight: 72,
  },
  listCardContent: { padding: 14 },
  listCardTitle: { fontSize: 14, fontWeight: '600', color: '#E8F4F1' },
  listCardSub: { fontSize: 12, color: 'rgba(232,244,241,0.6)', marginTop: 3 },

  // Podsumowanie
  summary: {
    marginTop: 20, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(77,217,192,0.3)',
    padding: 16, backgroundColor: 'rgba(77,217,192,0.05)',
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: '#E8F4F1', marginBottom: 8 },
  summaryText: { fontSize: 13, color: 'rgba(232,244,241,0.75)', lineHeight: 22 },
  summaryMeta: { fontSize: 11, color: CYAN, marginTop: 12, fontFamily: 'monospace' },
});
