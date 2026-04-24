import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { loginSchema, type LoginForm } from '../lib/validation';
import Logo from '../components/Logo';
import AuroraBackground from '../components/ui/AuroraBackground';
import GradientText from '../components/ui/GradientText';
import GlassInput from '../components/ui/GlassInput';
import GradientButton from '../components/ui/GradientButton';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import type { Theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const s = React.useMemo(() => createStyles(theme), [theme]);
  const { login } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data.email.trim(), data.password);
    } catch (err: unknown) {
      Alert.alert('Błąd logowania', err instanceof Error ? err.message : 'Spróbuj ponownie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground>
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.inner}>
        <View style={s.iconWrap}><Logo width={120} height={120} color={theme.colors.primary} /></View>
        <GradientText style={s.title}>Ready Daddy</GradientText>
        <Text style={s.subtitle}>Zaloguj się do swojego konta</Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <GlassInput
              label="Email"
              icon="mail"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="twoj@email.pl"
              keyboardType="email-address"
              autoCapitalize="none"
              error={error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <GlassInput
              label="Hasło"
              icon="lock"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="••••••••"
              isPassword
              error={error?.message}
            />
          )}
        />

        <GradientButton
          title="Zaloguj się"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          accessibilityLabel="Zaloguj się"
        />

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={s.link} accessibilityRole="button" accessibilityLabel="Przejdź do resetu hasła">
          <Text style={s.linkText}>Nie pamiętasz hasła? <Text style={s.linkBold}>Zresetuj je</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={s.link} accessibilityRole="button" accessibilityLabel="Przejdź do rejestracji">
          <Text style={s.linkText}>Nie masz konta? <Text style={s.linkBold}>Zarejestruj się</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  inner: { flex: 1, justifyContent: 'center', padding: theme.spacing.xl },
  iconWrap: { alignItems: 'center', marginBottom: theme.spacing.md },
  title: { fontSize: theme.fontSize.hero, fontFamily: theme.fonts.title, color: theme.colors.text, textAlign: 'center', letterSpacing: 2 },
  subtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', marginTop: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  link: { marginTop: theme.spacing.xl, alignItems: 'center' },
  linkText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md },
  linkBold: { color: theme.colors.primary, fontWeight: theme.fontWeight.semibold },
});
