import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import { AuthService } from '../services/auth';
import { setItem } from '../services/storage';
import { theme } from '../styles/theme';
import { hp, wp } from '../utils/responsive';

type RootStackParamList = {
  PhoneLogin: { userType: 'admin' | 'user' };
  Otp: { phoneNumber: string; userType: 'admin' | 'user' };
  MpinSetup: { phoneNumber: string; userType: 'admin' | 'user' };
  MpinLogin: { phoneNumber: string; userType: 'admin' | 'user' };
};

type PhoneLoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PhoneLogin'>;
type PhoneLoginScreenRouteProp = RouteProp<RootStackParamList, 'PhoneLogin'>;

interface Props {
  navigation: PhoneLoginScreenNavigationProp;
  route: PhoneLoginScreenRouteProp;
}

const PhoneLoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userType } = route.params;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleContinue = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      // -------------------------------------------------------------
      // ADMIN FLOW
      // -------------------------------------------------------------
      if (userType === 'admin') {
        const response = await AuthService.adminLoginInitiate(phoneNumber);

        if (response.success) {
          if (response.data.device_trusted && response.data.has_mpin) {
            // Store admin_id for MPIN login
            if (response.data.user_id) {
              await setItem('admin_id', response.data.user_id);
            }
            navigation.navigate('MpinLogin', { phoneNumber, userType });
          } else {
            await AuthService.sendOtp(phoneNumber, 'admin_login');
            navigation.navigate('Otp', { phoneNumber, userType });
          }
        } else {
          Alert.alert('Error', response.message || 'Something went wrong');
        }

        return;
      }

      // -------------------------------------------------------------
      // USER FLOW
      // -------------------------------------------------------------
      const loginInitiateResponse = await AuthService.userLoginInitiate(phoneNumber);

      if (loginInitiateResponse.success) {
        if (loginInitiateResponse.data.device_trusted && loginInitiateResponse.data.has_mpin) {
          // Store user_id for MPIN login
          if (loginInitiateResponse.data.user_id) {
            await setItem('user_id', loginInitiateResponse.data.user_id);
          }
          navigation.navigate('MpinLogin', { phoneNumber, userType });
        } else {
          await AuthService.sendOtp(phoneNumber, 'login');
          navigation.navigate('Otp', { phoneNumber, userType });
        }
      } else {
        Alert.alert('Error', loginInitiateResponse.message || 'User not found or something went wrong');
      }

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Logo />

            <Text style={styles.title}>
              {userType === 'admin' ? 'Admin Login' : 'User Login'}
            </Text>
            <Text style={styles.subtitle}>
              Enter your phone number to continue
            </Text>

            <Input
              label="Phone Number"
              placeholder="Enter 10-digit phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <Button
              title="Continue"
              onPress={handleContinue}
              loading={loading}
              disabled={!phoneNumber || phoneNumber.length !== 10}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    paddingTop: hp('5%'),
    paddingBottom: hp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: hp('6%'),
  },
});

export default PhoneLoginScreen;
