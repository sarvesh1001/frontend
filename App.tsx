import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import AddCompanyScreen from './src/screens/AddCompanyScreen';
import CompanyManagementScreen from './src/screens/CompanyManagementScreen';
import ForgotMpinScreen from './src/screens/ForgotMpinScreen';
import HomeScreen from './src/screens/HomeScreen';
import MpinLoginScreen from './src/screens/MpinLoginScreen';
import MpinSetupScreen from './src/screens/MpinSetupScreen';
import OtpScreen from './src/screens/OtpScreen';
import PhoneLoginScreen from './src/screens/PhoneLoginScreen';
import QrScannerScreen from './src/screens/QrScannerScreen';
import SplashScreen from './src/screens/SplashScreen';

export type RootStackParamList = {
  Splash: undefined;
  PhoneLogin: undefined;
  Otp: { phoneNumber: string };
  MpinSetup: { phoneNumber: string };
  MpinLogin: { phoneNumber: string };
  ForgotMpin: { phoneNumber: string };
  Home: undefined;
  QrScanner: undefined;
  CompanyManagement: undefined;
  AddCompany: undefined;
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
        <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="MpinSetup" component={MpinSetupScreen} />
        <Stack.Screen name="MpinLogin" component={MpinLoginScreen} />
        <Stack.Screen name="ForgotMpin" component={ForgotMpinScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="QrScanner" component={QrScannerScreen} />
        <Stack.Screen name="CompanyManagement" component={CompanyManagementScreen} />
        <Stack.Screen name="AddCompany" component={AddCompanyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}