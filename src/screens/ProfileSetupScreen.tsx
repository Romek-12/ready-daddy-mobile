import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import type { RootStackParamList } from '../types/navigation';
import type { Theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

const schema = z.object({
  conceptionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Podaj datę w formacie RRRR-MM-DD'),
  partnerName: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProfileSetupScreen({ navigation }: Props) {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const s = React.useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { conceptionDate: '', partnerName: '' },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          conception_date: data.conceptionDate,
          partner_name: data.partnerName || null,
        })
        .eq('id', user.id);
      if (error) throw new Error(error.message);
      await updateUser({
        conceptionDate: data.conceptionDate,
        partnerName: data.partnerName || null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Uzupełnij profil</Text>
        <Text style={s.subtitle}>
          Podaj datę poczęcia dziecka, żeby spersonalizować aplikację.
        </Text>

        <Text style={s.label}>Data poczęcia *</Text>
        <Controller
          control={control}
          name="conceptionDate"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[s.input, errors.conceptionDate && s.inputError]}
              placeholder="RRRR-MM-DD"
              placeholderTextColor={theme.colors.textMuted}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
          )}
        />
        {errors.conceptionDate && (
          <Text style={s.error}>{errors.conceptionDate.message}</Text>
        )}

        <Text style={s.label}>Imię partnerki (opcjonalnie)</Text>
        <Controller
          control={control}
          name="partnerName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={s.input}
              placeholder="np. Ania"
              placeholderTextColor={theme.colors.textMuted}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        <TouchableOpacity
          style={[s.button, loading && s.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.black} />
          ) : (
            <Text style={s.buttonText}>Dalej</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.lg,
      flexGrow: 1,
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold as any,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
      fontWeight: theme.fontWeight.medium as any,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.surfaceLight,
      marginBottom: theme.spacing.sm,
    },
    inputError: {
      borderColor: theme.colors.danger,
    },
    error: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.danger,
      marginBottom: theme.spacing.sm,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: theme.colors.black,
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold as any,
    },
  });
