import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../Icon';

interface Props {
  checked: boolean;
  onPress: () => void;
  size?: number;
}

export default function NeonCheckbox({ checked, onPress, size = 22 }: Props) {
  const { theme } = useTheme();
  const box = {
    width: size,
    height: size,
    borderRadius: 6,
  };
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} hitSlop={8}>
      {checked ? (
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.violet]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            box,
            styles.checked,
            { shadowColor: theme.colors.primary },
          ]}
        >
          <Icon name="check" size={Math.round(size * 0.6)} color={theme.colors.black} />
        </LinearGradient>
      ) : (
        <View
          style={[
            box,
            {
              borderWidth: 1.5,
              borderColor: theme.colors.cardBorderHi,
              backgroundColor: 'transparent',
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checked: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
});
