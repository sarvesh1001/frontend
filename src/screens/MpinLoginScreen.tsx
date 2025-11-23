import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useRef, useState } from 'react';
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
  MpinLogin: { phoneNumber: string; userType: 'admin' | 'user' };
  Home: undefined;
};

type MpinLoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MpinLogin'>;
type MpinLoginScreenRouteProp = RouteProp<RootStackParamList, 'MpinLogin'>;

interface Props {
  navigation: MpinLoginScreenNavigationProp;
  route: MpinLoginScreenRouteProp;
}

const MpinLoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userType } = route.params;
  const [mpin, setMpin] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const clearMpinFields = () => {
    setMpin(['', '', '', '', '', '']);
    inputs.current[0]?.focus();
  };

  const handleMpinChange = (value: string, index: number) => {
    if (value.length > 1) {
      const pastedMpin = value.split('').slice(0, 6);
      const newMpin = [...mpin];

      pastedMpin.forEach((char, i) => {
        if (i < 6) newMpin[i] = char;
      });

      setMpin(newMpin);

      const lastFilledIndex = pastedMpin.findIndex(char => !char) - 1;
      const focusIndex = lastFilledIndex >= 0 ? lastFilledIndex : pastedMpin.length - 1;
      if (focusIndex < 5 && inputs.current[focusIndex + 1]) {
        inputs.current[focusIndex + 1]?.focus();
      }
      return;
    }

    const newMpin = [...mpin];
    newMpin[index] = value;
    setMpin(newMpin);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !mpin[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async () => {
    const mpinString = mpin.join('');

    if (mpinString.length !== 6) {
      Alert.alert('Invalid MPIN', 'Please enter your 6-digit MPIN');
      return;
    }

    setLoading(true);

    try {
      let response;

      if (userType === 'admin') {
        response = await AuthService.verifyAdminMpin(mpinString);
      } else {
        response = await AuthService.verifyUserMpin(mpinString);
      }

      if (response.success) {
        navigation.replace('Home');
      } else {
        const err =
          response?.data?.message ||
          response?.message ||
          'Invalid MPIN';

        Alert.alert('Error', err);
        clearMpinFields();
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        'Something went wrong. Please try again.';

      Alert.alert('Error', errorMessage);
      clearMpinFields();
    } finally {
      setLoading(false);
    }
  };

  const isMpinComplete = mpin.join('').length === 6;

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

            <Text style={styles.title}>Enter MPIN</Text>
            <Text style={styles.subtitle}>
              Enter your 6-digit MPIN to continue
            </Text>

            <View style={styles.mpinContainer}>
              {mpin.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputs.current[index] = ref;
                  }}
                  style={[styles.mpinInput, digit && styles.mpinInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleMpinChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={index === 0 ? 6 : 1}
                  secureTextEntry
                  selectTextOnFocus
                />
              ))}
            </View>

            <Button
              title="Login"
              onPress={handleLogin}
              loading={loading}
              disabled={!isMpinComplete}
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
  mpinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: hp('6%'),
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
  mpinInputFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
});

export default MpinLoginScreen;
