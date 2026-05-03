import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { resetPasswordSchema } from '../lib/validation';
import Icon from '../components/Icon';
import AuroraBackground from '../components/ui/AuroraBackground';
import GradientText from '../components/ui/GradientText';
import GlassCard from '../components/ui/GlassCard';
import GlassInput from '../components/ui/GlassInput';
import GradientButton from '../components/ui/GradientButton';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import type { Theme } from '../theme';

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const s = React.useMemo(() => createStyles(theme), [theme]);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: route.params?.token || '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: data.newPassword });
      if (error) throw error;

      Alert.alert(
        'Hasło zmienione!',
        'Możesz teraz zalogować się nowym hasłem.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    } catch (err: unknown) {
      Alert.alert('Błąd', err instanceof Error ? err.message : 'Nie udało się zresetować hasła. Spróbuj ponownie.');
    }
  };

  return (
    <AuroraBackground>
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Wróć">
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <GlassCard elevated style={s.iconCard}>
            <Icon name="lock-open" size={40} color={theme.colors.primary} />
          </GlassCard>
          <GradientText style={s.title}>Nowe hasło</GradientText>
          <Text style={s.subtitle}>Ustaw nowe hasło dla swojego konta.</Text>

          {/* Token field (hidden/pre-filled when arriving via deep link) */}
          <View style={s.inputGroup}>
            <Controller
              control={control}
              name="token"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <GlassInput
                  label="Kod resetowania"
                  icon="vpn-key"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  placeholder="Wklej kod tutaj"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />
          </View>

          {/* New password */}
          <View style={s.inputGroup}>
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <GlassInput
                  label="Nowe hasło"
                  icon="lock"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  placeholder="Min. 6 znaków"
                  isPassword
                />
              )}
            />
          </View>

          {/* Confirm password */}
          <View style={s.inputGroup}>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <GlassInput
                  label="Potwierdź hasło"
                  icon="lock"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  placeholder="Powtórz hasło"
                  isPassword
                />
              )}
            />
          </View>

          <GradientButton
            title="Ustaw nowe hasło"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  inner: { flexGrow: 1, padding: theme.spacing.xl, paddingTop: theme.spacing.md },
  backBtn: { marginBottom: theme.spacing.xl },
  iconWrap: { alignItems: 'center', marginBottom: theme.spacing.xl },
  iconCard: { alignSelf: 'center', padding: theme.spacing.lg, marginBottom: theme.spacing.xl },
  title: { fontSize: theme.fontSize.xxl, fontFamily: theme.fonts.title, fontVariationSettings: '"wght" 700', color: theme.colors.text, textAlign: 'center' },
  subtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', marginTop: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  inputGroup: { marginBottom: theme.spacing.lg },
});
