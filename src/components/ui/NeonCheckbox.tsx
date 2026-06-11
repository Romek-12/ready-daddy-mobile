import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../Icon';

interface Props {
  checked: boolean;
  onPress: () => void;
  size?: number;
}

export default function NeonCheckbox({ checked, onPress, size = 22 }: Props) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} hitSlop={8}>
      <Icon
        name={checked ? 'check-circle' : 'checkbox-blank'}
        size={size}
        color={checked ? theme.colors.primary : theme.colors.textMuted}
      />
    </TouchableOpacity>
  );
}
