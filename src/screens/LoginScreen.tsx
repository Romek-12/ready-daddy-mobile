import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { loginSchema, type LoginForm } from '../lib/validation';
import AuroraBackground from '../components/ui/AuroraBackground';
import GradientText from '../components/ui/GradientText';
import GlassInput from '../components/ui/GlassInput';
import GradientButton from '../components/ui/GradientButton';
import Kicker from '../components/ui/Kicker';
import SocialAuthButtons from '../components/SocialAuthButtons';
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
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={s.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Kicker style={s.kicker}>Ready Daddy · 1.0</Kicker>
        <View style={s.orbWrap}>
          <LinearGradient
            colors={[theme.colors.primaryGlow, theme.colors.violetGlow, 'transparent']}
            start={{ x: 0.3, y: 0.3 }}
            end={{ x: 1, y: 1 }}
            style={s.orb}
          />
          <Text style={s.orbLabel}>WITAJ Z POWROTEM</Text>
        </View>
        <View style={s.titleRow}>
          <Text style={s.title}>Cześć.</Text>
          <GradientText style={s.title}>Dobry ruch.</GradientText>
        </View>
        <Text style={s.subtitle}>Zaloguj się, żeby śledzić ciążę razem z partnerką.</Text>

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

        <SocialAuthButtons />

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={s.link} accessibilityRole="button" accessibilityLabel="Przejdź do resetu hasła">
          <Text style={s.linkText}>Nie pamiętasz hasła? <Text style={s.linkBold}>Zresetuj je</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={s.link} accessibilityRole="button" accessibilityLabel="Przejdź do rejestracji">
          <Text style={s.linkText}>Nie masz konta? <Text style={s.linkBold}>Zarejestruj się</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </AuroraBackground>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.xl, paddingBottom: theme.spacing.xxl },
  kicker: { marginBottom: theme.spacing.lg },
  orbWrap: { alignItems: 'center', marginBottom: theme.spacing.xl, height: 180, justifyContent: 'center' },
  orb: { width: 180, height: 180, borderRadius: 90, position: 'absolute' },
  orbLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSize.kicker,
    color: theme.colors.white,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  titleRow: { flexDirection: 'column', alignItems: 'flex-start' },
  title: { fontSize: theme.fontSize.hero, fontFamily: theme.fonts.title, fontVariationSettings: '"wght" 700', color: theme.colors.text, letterSpacing: 1 },
  subtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, marginTop: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  link: { marginTop: theme.spacing.xl, alignItems: 'center' },
  linkText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md },
  linkBold: { color: theme.colors.primary, fontWeight: theme.fontWeight.semibold },
});
