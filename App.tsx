import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import HomeScreen from './src/screens/HomeScreen';
import LoginTypeScreen from './src/screens/LoginTypeScreen';
import MpinLoginScreen from './src/screens/MpinLoginScreen';
import MpinSetupScreen from './src/screens/MpinSetupScreen';
import OtpScreen from './src/screens/OtpScreen';
import PhoneLoginScreen from './src/screens/PhoneLoginScreen';
import SplashScreen from './src/screens/SplashScreen';

export type RootStackParamList = {
  Splash: undefined;
  LoginType: undefined;
  PhoneLogin: { userType: 'admin' | 'user' };
  Otp: { phoneNumber: string; userType: 'admin' | 'user' };
  MpinSetup: { phoneNumber: string; userType: 'admin' | 'user' };
  MpinLogin: { phoneNumber: string; userType: 'admin' | 'user' };
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="LoginType" component={LoginTypeScreen} />
        <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="MpinSetup" component={MpinSetupScreen} />
        <Stack.Screen name="MpinLogin" component={MpinLoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}