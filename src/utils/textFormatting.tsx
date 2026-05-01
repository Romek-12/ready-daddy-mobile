import React from 'react';
import { Text, View } from 'react-native';

/**
 * Renderuje tekst zawierający numerowaną listę (1. ... 2. ... 3. ...)
 * jako osobne linie zamiast jednego akapitu.
 * Jeśli tekst nie zawiera wzorca, zwraca zwykły <Text>.
 */
export function renderNumberedText(
  text: string,
  textStyle: object,
  containerStyle?: object
): React.ReactNode {
  const parts = text.split(/(?=\d+\.\s)/);

  if (parts.length <= 1) {
    return <Text style={textStyle}>{text}</Text>;
  }

  return (
    <View style={containerStyle}>
      {parts
        .filter(p => p.trim().length > 0)
        .map((part, index) => (
          <Text key={index} style={[textStyle, index > 0 && { marginTop: 6 }]}>
            {part.trim()}
          </Text>
        ))}
    </View>
  );
}
