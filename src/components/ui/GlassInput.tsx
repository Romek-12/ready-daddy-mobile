import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, type TextInputProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../Icon';
import type { Theme } from '../../theme';

interface GlassInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  isPassword?: boolean;
  icon?: string;
}

export default function GlassInput({ label, error, isPassword, secureTextEntry, icon, ...rest }: GlassInputProps) {
  const { theme } = useTheme();
  const s = React.useMemo(() => createStyles(theme), [theme]);
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View style={s.group}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={[s.card, error ? s.cardError : null]}>
        {icon ? (
          <Icon name={icon} size={18} color={theme.colors.textMuted} />
        ) : null}
        <TextInput
          style={s.input}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          {...rest}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(v => !v)}
            style={s.eyeBtn}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
          >
            <Icon name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    group: { marginBottom: theme.spacing.lg },
    label: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
      fontFamily: 'SpaceGrotesk_500Medium',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.cardBorderHi,
    },
    cardError: {
      borderColor: theme.colors.danger,
    },
    input: {
      flex: 1,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      fontFamily: 'SpaceGrotesk_400Regular',
      padding: 0,
    },
    eyeBtn: { padding: 4 },
    error: { color: theme.colors.danger, fontSize: theme.fontSize.xs, marginTop: theme.spacing.xs },
  });
