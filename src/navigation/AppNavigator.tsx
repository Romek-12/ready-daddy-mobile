import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/Icon';
import ErrorBoundary from '../components/ErrorBoundary';
import type { RootStackParamList, HomeStackParamList, DadStackParamList, MainTabParamList, JournalStackParamList } from '../types/navigation';
import { TAB_BAR_HEIGHT } from '../constants';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import WeekDetailScreen from '../screens/WeekDetailScreen';
import ActionCardsScreen from '../screens/ActionCardsScreen';
import CheckupsScreen from '../screens/CheckupsScreen';
import PlanningScreen from '../screens/PlanningScreen';
import BirthPrepScreen from '../screens/BirthPrepScreen';
import DadModuleScreen from '../screens/DadModuleScreen';
import FourthTrimesterScreen from '../screens/FourthTrimesterScreen';
import PostBirthScreen from '../screens/PostBirthScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

import DadPologScreen from '../screens/DadPologScreen';
import DadRelacjaScreen from '../screens/DadRelacjaScreen';
import DadNoworodekScreen from '../screens/DadNoworodekScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import JournalScreen from '../screens/journal/JournalScreen';
import JournalEntryScreen from '../screens/journal/JournalEntryScreen';
import AddEntryScreen from '../screens/journal/AddEntryScreen';
import BadgesScreen from '../screens/BadgesScreen';
import FirstYearHomeScreen from '../screens/first-year/FirstYearHomeScreen';
import MonthScreen from '../screens/first-year/MonthScreen';
import AddVisitScreen from '../screens/AddVisitScreen';
import NameDrawScreen from '../screens/NameDrawScreen';
import BlurSpikeScreen from '../screens/BlurSpikeScreen';
import { BadgeProvider } from '../context/BadgeContext';
import BadgeUnlockModal from '../components/gamification/BadgeUnlockModal';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const DadStack = createNativeStackNavigator<DadStackParamList>();
const JournalStack = createNativeStackNavigator<JournalStackParamList>();

function JournalStackNavigator() {
  const { theme } = useTheme();
  const noHeader = { headerShown: false, contentStyle: { backgroundColor: theme.colors.background } };
  return (
    <JournalStack.Navigator screenOptions={noHeader}>
      <JournalStack.Screen name="JournalMain" component={JournalScreen} />
      <JournalStack.Screen name="JournalEntry" component={JournalEntryScreen} />
      <JournalStack.Screen name="AddEntry" component={AddEntryScreen} />
    </JournalStack.Navigator>
  );
}

function DadStackNavigator() {
  const { theme } = useTheme();
  const noHeader = { headerShown: false, contentStyle: { backgroundColor: theme.colors.background } };
  return (
    <DadStack.Navigator screenOptions={noHeader}>
      <DadStack.Screen name="DadModuleMain" component={DadModuleScreen} />
      <DadStack.Screen name="DadPolog" component={DadPologScreen} />
      <DadStack.Screen name="DadRelacja" component={DadRelacjaScreen} />
      <DadStack.Screen name="DadNoworodek" component={DadNoworodekScreen} />
    </DadStack.Navigator>
  );
}

function HomeStackNavigator() {
  const { theme } = useTheme();
  const noHeader = { headerShown: false, contentStyle: { backgroundColor: theme.colors.background } };
  return (
    <HomeStack.Navigator screenOptions={noHeader}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} />
      <HomeStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <HomeStack.Screen name="WeekDetail" component={WeekDetailScreen} />
      <HomeStack.Screen name="BirthPrep" component={BirthPrepScreen} />
      <HomeStack.Screen name="DadModule" component={DadModuleScreen} />
      <HomeStack.Screen name="FourthTrimester" component={FourthTrimesterScreen} />
      <HomeStack.Screen name="PostBirth" component={PostBirthScreen} />
      <HomeStack.Screen name="Checkups" component={CheckupsScreen} />
      <HomeStack.Screen name="Planning" component={PlanningScreen} />
      <HomeStack.Screen name="DadPolog" component={DadPologScreen} />
      <HomeStack.Screen name="DadRelacja" component={DadRelacjaScreen} />
      <HomeStack.Screen name="DadNoworodek" component={DadNoworodekScreen} />
      <HomeStack.Screen name="Badges" component={BadgesScreen} />
      <HomeStack.Screen name="FirstYear" component={FirstYearHomeScreen} />
      <HomeStack.Screen name="Month" component={MonthScreen} />
      <HomeStack.Screen name="AddVisit" component={AddVisitScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="NameDraw" component={NameDrawScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="BlurSpike" component={BlurSpikeScreen} options={{ headerShown: false }} />
    </HomeStack.Navigator>
  );
}

function MainTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.cardBorder,
          elevation: 0,
          height: TAB_BAR_HEIGHT,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontFamily: theme.fonts.semibold, marginTop: 2 },
        headerShown: false,
        tabBarItemStyle: { justifyContent: 'center' },
        lazy: true,
      }}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator}
        options={{ tabBarLabel: 'Główna', tabBarIcon: ({ color }: { color: string; focused: boolean }) => (
          <Icon name="home" size={24} color={color} />
        ) }} />
      <Tab.Screen name="WeekDetailTab" component={WeekDetailScreen}
        options={{ tabBarLabel: 'Tydzień', tabBarIcon: ({ color }: { color: string; focused: boolean }) => (
          <Icon name="fetus" size={24} color={color} />
        ) }} />
      <Tab.Screen name="ActionCards" component={ActionCardsScreen}
        options={{ tabBarLabel: 'Karty', tabBarIcon: ({ color }: { color: string; focused: boolean }) => (
          <Icon name="bolt" size={24} color={color} />
        ) }} />
      <Tab.Screen name="DadModuleTab" component={DadStackNavigator}
        options={{ tabBarLabel: 'Tata', tabBarIcon: ({ color }: { color: string; focused: boolean }) => (
          <Icon name="dad" size={24} color={color} />
        ) }} />
      <Tab.Screen name="Journal" component={JournalStackNavigator}
        options={{ tabBarLabel: 'Dziennik', tabBarIcon: ({ color }: { color: string; focused: boolean }) => (
          <Icon name="journal" size={24} color={color} />
        ) }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading, isFirstLogin, clearFirstLogin } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
    <BadgeProvider>
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
          {user ? (
            !user.conceptionDate ? (
              <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            ) : isFirstLogin ? (
              <Stack.Screen name="Onboarding">
                {() => <OnboardingScreen onDone={clearFirstLogin} />}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="Main" component={MainTabs} />
            )
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <BadgeUnlockModal />
    </SafeAreaProvider>
    </BadgeProvider>
    </ErrorBoundary>
  );
}
