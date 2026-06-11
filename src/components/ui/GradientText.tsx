import React from 'react';
import { Text, TextStyle, StyleProp, TextProps } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface Props extends Omit<TextProps, 'style'> {
  children: string;
  style?: StyleProp<TextStyle>;
  colors?: [string, string];
}

export default function GradientText({ children, style, colors, ...textProps }: Props) {
  const { theme } = useTheme();
  const gradientColors = colors ?? [theme.colors.primary, theme.colors.violet];
  return (
    <MaskedView
      maskElement={
        <Text style={[style, { backgroundColor: 'transparent' }]} {...textProps}>{children}</Text>
      }
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      >
        <Text style={[style, { opacity: 0 }]} {...textProps}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
