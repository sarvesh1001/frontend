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
import { theme } from '../styles/theme';
import { hp, wp } from '../utils/responsive';

type RootStackParamList = {
  ForgotMpin: { phoneNumber: string };
  MpinLogin: { phoneNumber: string };
};

type ForgotMpinScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotMpin'>;
type ForgotMpinScreenRouteProp = RouteProp<RootStackParamList, 'ForgotMpin'>;

interface Props {
  navigation: ForgotMpinScreenNavigationProp;
  route: ForgotMpinScreenRouteProp;
}

const ForgotMpinScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newMpin, setNewMpin] = useState(['', '', '', '', '', '']);
  const [confirmMpin, setConfirmMpin] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'initiate' | 'verify'>('initiate');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const otpInputs = useRef<(TextInput | null)[]>([]);
  const mpinInputs = useRef<(TextInput | null)[]>([]);
  const confirmMpinInputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      const pastedOtp = value.split('').slice(0, 6);
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const focusIndex = pastedOtp.length - 1;
      if (focusIndex < 5 && otpInputs.current[focusIndex + 1]) {
        otpInputs.current[focusIndex + 1]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleMpinChange = (value: string, index: number, type: 'mpin' | 'confirm') => {
    const refs = type === 'mpin' ? mpinInputs : confirmMpinInputs;
    const setter = type === 'mpin' ? setNewMpin : setConfirmMpin;
    const current = type === 'mpin' ? newMpin : confirmMpin;

    if (value.length > 1) {
      const pastedMpin = value.split('').slice(0, 6);
      const newMpinArray = [...current];
      pastedMpin.forEach((char, i) => {
        if (i < 6) newMpinArray[i] = char;
      });
      setter(newMpinArray);
      const focusIndex = pastedMpin.length - 1;
      if (focusIndex < 5 && refs.current[focusIndex + 1]) {
        refs.current[focusIndex + 1]?.focus();
      }
      return;
    }

    const newMpinArray = [...current];
    newMpinArray[index] = value;
    setter(newMpinArray);

    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number, type: 'otp' | 'mpin' | 'confirm') => {
    const refs = 
      type === 'otp' ? otpInputs : 
      type === 'mpin' ? mpinInputs : confirmMpinInputs;
    const current = 
      type === 'otp' ? otp : 
      type === 'mpin' ? newMpin : confirmMpin;

    if (e.nativeEvent.key === 'Backspace' && !current[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleInitiateForgotMpin = async () => {
    setLoading(true);
    try {
      const response = await AuthService.forgotAdminMpin(phoneNumber);
      if (response.success) {
        setStep('verify');
        setTimer(30);
        Alert.alert('Success', 'OTP has been sent to your phone');
      } else {
        if (response.retry_after) {
          setCooldown(response.retry_after);
          Alert.alert('Too Many Requests', `Please wait ${response.retry_after} seconds before trying again`);
        } else {
          Alert.alert('Error', response.message || 'Failed to initiate MPIN reset');
        }
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.data.retry_after;
        setCooldown(retryAfter);
        Alert.alert('Too Many Requests', `Please wait ${retryAfter} seconds before trying again`);
      } else {
        Alert.alert('Error', error.message || 'Failed to initiate MPIN reset');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const response = await AuthService.forgotAdminMpin(phoneNumber);
      if (response.success) {
        setTimer(30);
        Alert.alert('Success', 'OTP has been resent to your phone');
      } else {
        if (response.retry_after) {
          setCooldown(response.retry_after);
          Alert.alert('Too Many Requests', `Please wait ${response.retry_after} seconds before requesting a new OTP`);
        } else {
          Alert.alert('Error', response.message || 'Failed to resend OTP');
        }
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.data.retry_after;
        setCooldown(retryAfter);
        Alert.alert('Too Many Requests', `Please wait ${retryAfter} seconds before requesting a new OTP`);
      } else {
        Alert.alert('Error', error.message || 'Failed to resend OTP');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyAndReset = async () => {
    const otpString = otp.join('');
    const newMpinString = newMpin.join('');
    const confirmMpinString = confirmMpin.join('');

    if (otpString.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP');
      return;
    }

    if (newMpinString.length !== 6) {
      Alert.alert('Invalid MPIN', 'MPIN must be 6 digits');
      return;
    }

    if (newMpinString !== confirmMpinString) {
      Alert.alert('MPIN Mismatch', 'New MPIN and confirm MPIN do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.verifyForgotAdminMpin(phoneNumber, otpString, newMpinString);
      
      if (response.success) {
        Alert.alert('Success', 'MPIN has been reset successfully', [
          { 
            text: 'OK', 
            onPress: () => navigation.replace('MpinLogin', { phoneNumber })
          }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to reset MPIN');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reset MPIN');
    } finally {
      setLoading(false);
    }
  };

  const isOtpComplete = otp.join('').length === 6;
  const isMpinComplete = newMpin.join('').length === 6;
  const isConfirmMpinComplete = confirmMpin.join('').length === 6;
  const canResend = timer === 0 && cooldown === 0;

  if (step === 'initiate') {
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

              <Text style={styles.title}>Forgot MPIN</Text>
              <Text style={styles.subtitle}>
                We'll send an OTP to {phoneNumber} to reset your MPIN
              </Text>

              <Button
                title={cooldown > 0 ? `Wait ${cooldown}s` : "Send OTP"}
                onPress={handleInitiateForgotMpin}
                loading={loading}
                disabled={cooldown > 0}
                fullWidth
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

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

            <Text style={styles.title}>Reset MPIN</Text>
            <Text style={styles.subtitle}>
              Enter OTP and new MPIN
            </Text>

            <Text style={styles.sectionLabel}>OTP</Text>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    otpInputs.current[index] = ref;
                  }}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index, 'otp')}
                  keyboardType="numeric"
                  maxLength={index === 0 ? 6 : 1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>New MPIN</Text>
            <View style={styles.mpinContainer}>
              {newMpin.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    mpinInputs.current[index] = ref;
                  }}
                  style={[styles.mpinInput, digit && styles.mpinInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleMpinChange(value, index, 'mpin')}
                  onKeyPress={(e) => handleKeyPress(e, index, 'mpin')}
                  keyboardType="numeric"
                  maxLength={index === 0 ? 6 : 1}
                  secureTextEntry
                  selectTextOnFocus
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>Confirm MPIN</Text>
            <View style={styles.mpinContainer}>
              {confirmMpin.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    confirmMpinInputs.current[index] = ref;
                  }}
                  style={[styles.mpinInput, digit && styles.mpinInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleMpinChange(value, index, 'confirm')}
                  onKeyPress={(e) => handleKeyPress(e, index, 'confirm')}
                  keyboardType="numeric"
                  maxLength={index === 0 ? 6 : 1}
                  secureTextEntry
                  selectTextOnFocus
                />
              ))}
            </View>

            <Button
              title="Reset MPIN"
              onPress={handleVerifyAndReset}
              loading={loading}
              disabled={!isOtpComplete || !isMpinComplete || !isConfirmMpinComplete}
              fullWidth
              style={styles.verifyButton}
            />

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive OTP? </Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              ) : cooldown > 0 ? (
                <Text style={styles.cooldownText}>Wait {cooldown}s</Text>
              ) : (
                <Button
                  title={resendLoading ? "Sending..." : "Resend OTP"}
                  onPress={handleResendOtp}
                  loading={resendLoading}
                  disabled={!canResend}
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
  sectionLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginBottom: hp('1%'),
    marginTop: hp('2%'),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: hp('2%'),
  },
  mpinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: hp('2%'),
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
  mpinInput: {
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
  mpinInputFilled: {
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
  cooldownText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    fontWeight: '600',
  },
  resendButton: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
  },
});

export default ForgotMpinScreen;