import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme';

type SocialProvider = 'google' | 'facebook';

export default function SocialAuthButtons() {
  const { signInWithGoogle, signInWithFacebook } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState<SocialProvider | null>(null);

  const handlePress = async (provider: SocialProvider) => {
    setLoading(provider);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithFacebook();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Coś poszło nie tak';
      Alert.alert('Błąd logowania', message);
    } finally {
      setLoading(null);
    }
  };

  const isLoading = loading !== null;

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>lub</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={() => handlePress('google')}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {loading === 'google' ? (
          <ActivityIndicator size="small" color="#3C4043" />
        ) : (
          <Text style={styles.googleLetter}>G</Text>
        )}
        <Text style={styles.googleText}>Kontynuuj z Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.facebookButton]}
        onPress={() => handlePress('facebook')}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {loading === 'facebook' ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.facebookLetter}>f</Text>
        )}
        <Text style={styles.facebookText}>Kontynuuj z Facebook</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.cardBorder,
    },
    dividerText: {
      marginHorizontal: theme.spacing.sm,
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      minHeight: 48,
    },
    googleButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    googleLetter: {
      fontSize: 18,
      fontWeight: '700',
      color: '#4285F4',
    },
    googleText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      fontWeight: '600',
    },
    facebookButton: {
      backgroundColor: '#1877F2',
    },
    facebookLetter: {
      fontSize: 20,
      fontWeight: '700',
      color: '#fff',
    },
    facebookText: {
      fontSize: theme.fontSize.md,
      color: '#fff',
      fontWeight: '600',
    },
  });
}
