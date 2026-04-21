import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme';

interface InnerProps {
  children: ReactNode;
  colors: Theme['colors'];
}

interface State {
  hasError: boolean;
}

class ErrorBoundaryInner extends Component<InnerProps, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      const { colors } = this.props;
      const s = createStyles(colors);
      return (
        <View style={s.container}>
          <Text style={s.emoji}>😵</Text>
          <Text style={s.title}>Coś poszło nie tak</Text>
          <Text style={s.subtitle}>Aplikacja napotkała nieoczekiwany błąd.</Text>
          <TouchableOpacity style={s.button} onPress={this.handleReset}>
            <Text style={s.buttonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function ErrorBoundary({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return <ErrorBoundaryInner colors={theme.colors}>{children}</ErrorBoundaryInner>;
}

const createStyles = (colors: Theme['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 32,
    },
    emoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
    },
    button: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
    },
    buttonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '600',
    },
  });
