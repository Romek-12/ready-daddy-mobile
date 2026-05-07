jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      Text: View,
      ScrollView: View,
      createAnimatedComponent: (Component: unknown) => Component,
      Value: jest.fn(() => ({ setValue: jest.fn() })),
      event: jest.fn(),
      add: jest.fn(),
      eq: jest.fn(),
      set: jest.fn(),
      cond: jest.fn(),
      interpolate: jest.fn(),
      call: jest.fn(),
    },
    useSharedValue: (val: unknown) => ({ value: val }),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    withSpring: (val: unknown) => val,
    withTiming: (val: unknown) => val,
    withDelay: (_: unknown, val: unknown) => val,
    interpolate: jest.fn(),
    Extrapolation: { CLAMP: 'clamp' },
    runOnJS: (fn: unknown) => fn,
    createAnimatedComponent: (Component: unknown) => Component,
    Animated: { Value: jest.fn() },
    FlatList: View,
    ScrollView: View,
    Easing: {
      inOut: jest.fn(() => (t: number) => t),
      in: jest.fn(() => (t: number) => t),
      out: jest.fn(() => (t: number) => t),
      sin: (t: number) => t,
      linear: (t: number) => t,
      ease: (t: number) => t,
      quad: (t: number) => t,
      cubic: (t: number) => t,
      bezier: jest.fn(() => (t: number) => t),
    },
    withRepeat: (val: unknown) => val,
    withSequence: (...vals: unknown[]) => vals[0],
  };
});

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

jest.mock('./src/components/ui/AuroraBackground', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(View, null, children);
});

jest.mock('./src/components/ui/GlassCard', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
    React.createElement(View, { style }, children);
});

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: { children: unknown }) => children,
    SafeAreaConsumer: ({ children }: { children: (insets: typeof inset) => unknown }) => children(inset),
    useSafeAreaInsets: () => inset,
    SafeAreaView: ({ children }: { children: unknown }) => children,
  };
});
