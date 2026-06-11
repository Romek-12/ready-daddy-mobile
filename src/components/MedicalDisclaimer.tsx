import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

export default function MedicalDisclaimer() {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.surface }]}>
      <Icon name="info" size={14} color={theme.colors.textMuted} />
      <Text style={[styles.text, { color: theme.colors.textMuted }]}>
        {' '}Treści mają charakter informacyjny i nie zastępują konsultacji z lekarzem ani specjalistą.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
});
