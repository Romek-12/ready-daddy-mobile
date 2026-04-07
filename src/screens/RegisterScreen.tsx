import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import DateScrollPicker from '../components/DateScrollPicker';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { registerSchema, type RegisterForm } from '../lib/validation';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import type { Theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

interface ExtendedRegisterForm extends RegisterForm {
  babyName1?: string;
  babyName2?: string;
}

export default function RegisterScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const s = React.useMemo(() => createStyles(theme), [theme]);
  const { register } = useAuth();
  const [dateType, setDateType] = useState<'conception' | 'due'>('conception');
  const [loading, setLoading] = useState(false);
  const [showBabyNames, setShowBabyNames] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<ExtendedRegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      conceptionDate: '',
      partnerName: '',
      babyName1: '',
      babyName2: '',
    },
  });

  const selectedDate = watch('conceptionDate');

  const showAlert = (title: string, msg: string) => {
    if (Platform.OS === 'web') window.alert(`${title}: ${msg}`);
    else Alert.alert(title, msg);
  };

  const onSubmit = async (data: ExtendedRegisterForm) => {
    let conceptionDate = data.conceptionDate;
    if (dateType === 'due') {
      const due = new Date(conceptionDate);
      due.setDate(due.getDate() - 280);
      conceptionDate = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`;
    }

    const [year, month, day] = conceptionDate.split('-').map(Number);
    const conceptionDateObj = new Date(year, month - 1, day);
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    if (dateType === 'conception') {
      if (conceptionDateObj > today) {
        showAlert('Błąd', 'Data poczęcia nie może być w przyszłości');
        return;
      }
      if (conceptionDateObj < maxDate) {
        showAlert('Błąd', 'Data poczęcia jest za dawna (max 1 rok wstecz)');
        return;
      }
    }

    setLoading(true);
    try {
      await register(
        data.email.trim(),
        data.password,
        conceptionDate,
        data.partnerName?.trim() || undefined,
        data.babyName1?.trim() || undefined,
        data.babyName2?.trim() || undefined
      );
    } catch (err: any) {
      showAlert('Błąd rejestracji', err.message || 'Spróbuj ponownie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        <View style={s.logoWrap}>
          <Logo width={100} height={100} color={theme.colors.primary} />
        </View>

        <Text style={s.title}>Dołącz do nas</Text>
        <Text style={s.subtitle}>Hej Papa · Tata W Akcji</Text>

        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <FormInput
              label="Email"
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

        {/* Password */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <FormInput
              label="Hasło"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="••••••••"
              isPassword
              error={error?.message}
            />
          )}
        />

        {/* Partner Name */}
        <Controller
          control={control}
          name="partnerName"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Imię partnerki (opcjonalne)"
              value={value}
              onChangeText={onChange}
              placeholder="np. Anna"
            />
          )}
        />

        {/* Date Type Toggle */}
        <View style={s.dateTypeContainer}>
          <TouchableOpacity
            style={[s.dateTypeBtn, dateType === 'conception' && s.dateTypeBtnActive]}
            onPress={() => setDateType('conception')}
          >
            <Text style={[s.dateTypeText, dateType === 'conception' && s.dateTypeTextActive]}>Datę poczęcia</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.dateTypeBtn, dateType === 'due' && s.dateTypeBtnActive]}
            onPress={() => setDateType('due')}
          >
            <Text style={[s.dateTypeText, dateType === 'due' && s.dateTypeTextActive]}>Termin porodu</Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        <Controller
          control={control}
          name="conceptionDate"
          render={({ field: { value } }) => (
            <View style={s.datePickerContainer}>
              <DateScrollPicker
                initialDate={value}
                onDateChange={(date) => setValue('conceptionDate', date)}
              />
            </View>
          )}
        />

        {/* Baby Names Section - Collapsible */}
        <TouchableOpacity
          style={s.babyNamesToggle}
          onPress={() => setShowBabyNames(!showBabyNames)}
        >
          <Text style={s.babyNamesToggleText}>Znasz już imię dziecka? Wpisz je! (opcjonalnie)</Text>
          <Icon
            name={showBabyNames ? 'expand-less' : 'expand-more'}
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        {showBabyNames && (
          <View style={s.babyNamesSection}>
            <Controller
              control={control}
              name="babyName1"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Imię dziecka"
                  value={value}
                  onChangeText={onChange}
                  placeholder="np. Zosia"
                />
              )}
            />

            <Controller
              control={control}
              name="babyName2"
              render={({ field: { onChange, value } }) => (
                <View>
                  <FormInput
                    label="Drugie imię (opcjonalne)"
                    value={value}
                    onChangeText={onChange}
                    placeholder="np. Piotrek"
                  />
                  <Text style={s.babyNamesHelper}>
                    Możesz wpisać dwa imiona — jedno dla dziewczynki, jedno dla chłopca.
                  </Text>
                </View>
              )}
            />
          </View>
        )}

        {/* Register Button */}
        <Button
          title="Zarejestruj się"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          accessibilityLabel="Zarejestruj się"
        />

        {/* Login Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={s.linkContainer}
          accessibilityRole="button"
          accessibilityLabel="Przejdź do logowania"
        >
          <Text style={s.linkText}>
            Masz już konto? <Text style={s.linkBold}>Zaloguj się</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  inner: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.hero,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: theme.colors.primary,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  dateTypeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  dateTypeBtn: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  dateTypeBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dateTypeText: {
    fontSize: theme.fontSize.sm,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: theme.colors.textSecondary,
  },
  dateTypeTextActive: {
    color: theme.colors.black,
  },
  datePickerContainer: {
    marginBottom: theme.spacing.lg,
  },
  babyNamesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  babyNamesToggleText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: theme.colors.primary,
  },
  babyNamesSection: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  babyNamesHelper: {
    fontSize: theme.fontSize.xs,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  linkText: {
    fontSize: theme.fontSize.md,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: theme.colors.textSecondary,
  },
  linkBold: {
    color: theme.colors.primary,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
});
