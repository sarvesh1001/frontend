import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { AuthService } from '../services/auth';
import { setItem } from '../services/storage';
import { theme } from '../styles/theme';
import { hp, wp } from '../utils/responsive';

type RootStackParamList = {
  Otp: { phoneNumber: string; userType: 'admin' | 'user' };
  MpinSetup: { phoneNumber: string; userType: 'admin' | 'user' };
  MpinLogin: { phoneNumber: string; userType: 'admin' | 'user' };
  Home: undefined;
};

type OtpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Otp'>;
type OtpScreenRouteProp = RouteProp<RootStackParamList, 'Otp'>;

interface Props {
  navigation: OtpScreenNavigationProp;
  route: OtpScreenRouteProp;
}

const OtpScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phoneNumber, userType } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      const pastedOtp = value.split('').slice(0, 6);
      const newOtp = [...otp];

      pastedOtp.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });

      setOtp(newOtp);

      const focusIndex = pastedOtp.length - 1;
      if (focusIndex < 5 && inputs.current[focusIndex + 1]) {
        inputs.current[focusIndex + 1]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  // ============================================================
  // VERIFY OTP
  // ============================================================
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      let response;

      if (userType === 'admin') {
        response = await AuthService.verifyAdminOtp(phoneNumber, otpString);

        if (response.success) {
          // Store admin_id
          if (response.data.admin_id) {
            await setItem('admin_id', response.data.admin_id);
          }

          if (response.data.has_mpin) {
            navigation.navigate('MpinLogin', { phoneNumber, userType });
          } else {
            navigation.navigate('MpinSetup', { phoneNumber, userType });
          }
        } else {
          Alert.alert('Error', response.message || 'Invalid OTP');
        }
      } else {
        response = await AuthService.verifyUserOtp(phoneNumber, otpString);

        if (response.success) {
          // Store user_id
          if (response.data.user_id) {
            await setItem('user_id', response.data.user_id);
          }

          if (response.data.has_mpin) {
            navigation.navigate('MpinLogin', { phoneNumber, userType });
          } else {
            navigation.navigate('MpinSetup', { phoneNumber, userType });
          }
        } else {
          Alert.alert('Error', response.message || 'Invalid OTP');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESEND OTP
  // ============================================================
  const handleResendOtp = async () => {
    setResendLoading(true);

    try {
      const purpose = userType === 'admin' ? 'admin_login' : 'login';
      await AuthService.sendOtp(phoneNumber, purpose);
      setTimer(30);
      Alert.alert('Success', 'OTP has been resent to your phone');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const isOtpComplete = otp.join('').length === 6;

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

            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit OTP to {phoneNumber}
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputs.current[index] = ref;
                  }}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={index === 0 ? 6 : 1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <Button
              title="Verify OTP"
              onPress={handleVerifyOtp}
              loading={loading}
              disabled={!isOtpComplete}
              fullWidth
              style={styles.verifyButton}
            />

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive OTP? </Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              ) : (
                <Button
                  title="Resend OTP"
                  onPress={handleResendOtp}
                  loading={resendLoading}
                  variant="outline"
                  fullWidth={false}
                  style={styles.resendButton}
                />
              )}
            </View>
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: hp('6%'),
  },
  otpInput: {
    width: wp('12%'),
    height: wp('12%'),
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  otpInputFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  verifyButton: {
    marginBottom: hp('4%'),
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  timerText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  resendButton: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
  },
});

export default OtpScreen;
