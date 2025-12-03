// src/screens/SplashScreen.tsx
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Logo from '../components/Logo';
import { AuthService } from '../services/auth';
import { getItem, removeItem, setItem } from '../services/storage';
import { theme } from '../styles/theme';
import { initializeDeviceInfo } from '../utils/device';

type RootStackParamList = {
  Splash: undefined;
  PhoneLogin: undefined;
  MpinLogin: { phoneNumber: string };
  Home: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const [status, setStatus] = useState('Initializing secure app...');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setStatus('Setting up secure device...');
        
        // Initialize secure device info
        await initializeDeviceInfo();
        
        setStatus('Checking authentication...');
        
        const accessToken = await getItem('access_token');
        const refreshToken = await getItem('refresh_token');
        const isFirstLaunch = await getItem('is_first_launch');
        const adminId = await getItem('admin_id');

        // Mark first launch
        if (!isFirstLaunch) {
          await setItem('is_first_launch', 'false');
          console.log("🎉 FIRST SECURE LAUNCH - DEVICE INFO GENERATED");
        }

        console.log("🔍 APP STATE CHECK:", {
          hasTokens: !!(accessToken && refreshToken),
          hasAdminId: !!adminId,
        });

        // No tokens → check if we have admin ID for MPIN login
        if (!accessToken || !refreshToken) {
          console.log("🔐 NO SECURE TOKENS FOUND");
          
          if (adminId) {
            // We have admin ID, get formatted phone number for MPIN login
            const phoneNumber = await AuthService.getStoredPhoneForMpin();
            
            if (phoneNumber) {
              console.log("📱 ADMIN ID & PHONE NUMBER FOUND, REDIRECTING TO MPIN LOGIN:", phoneNumber);
              setStatus('Redirecting to secure MPIN login...');
              return navigation.replace('MpinLogin', { phoneNumber });
            } else {
              console.log("📱 ADMIN ID FOUND BUT NO PHONE NUMBER, REDIRECTING TO PHONE LOGIN");
              setStatus('Redirecting to secure login...');
              return navigation.replace('PhoneLogin');
            }
          } else {
            // No admin ID stored, go to phone login
            console.log("📱 NO ADMIN ID STORED, REDIRECTING TO PHONE LOGIN");
            setStatus('Redirecting to secure login...');
            return navigation.replace('PhoneLogin');
          }
        }

        // We have tokens, validate session
        try {
          const response = await AuthService.validateSession();

          if (response.success) {
            console.log("✅ VALID SECURE SESSION - PROCEEDING TO HOME");
            setStatus('Loading secure dashboard...');
            return navigation.replace('Home');
          } else {
            console.log("❌ INVALID SECURE SESSION - REMOVING TOKENS");
            await Promise.all([
              removeItem('access_token'),
              removeItem('refresh_token'),
            ]);

            setStatus('Secure session expired, redirecting...');
            
            // Check if we have admin ID for MPIN login
            if (adminId) {
              const phoneNumber = await AuthService.getStoredPhoneForMpin();
              
              if (phoneNumber) {
                return navigation.replace('MpinLogin', { phoneNumber });
              }
            }
            return navigation.replace('PhoneLogin');
          }
        } catch (error) {
          console.log("❌ SECURE SESSION VALIDATION ERROR - FALLBACK TO LOGIN");
          await Promise.all([
            removeItem('access_token'),
            removeItem('refresh_token'),
          ]);
          setStatus('Secure connection issue, redirecting...');
          
          // Check if we have admin ID for MPIN login
          if (adminId) {
            const phoneNumber = await AuthService.getStoredPhoneForMpin();
            
            if (phoneNumber) {
              return navigation.replace('MpinLogin', { phoneNumber });
            }
          }
          return navigation.replace('PhoneLogin');
        }
      } catch (error) {
        console.error('❌ SECURE APP INITIALIZATION ERROR:', error);
        setStatus('Security error, redirecting...');
        // Fallback to phone login on any error
        navigation.replace('PhoneLogin');
      }
    };

    // Small delay for splash animation
    setTimeout(initializeApp, 1500);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Logo />
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  statusText: {
    marginTop: 20,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default SplashScreen;