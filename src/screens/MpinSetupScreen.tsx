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
import Input from '../components/Input';
import Logo from '../components/Logo';
import { AuthService } from '../services/auth';
import { theme } from '../styles/theme';
import { hp, wp } from '../utils/responsive';

type RootStackParamList = {
  MpinSetup: { phoneNumber: string };
  Home: undefined;
};

type MpinSetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MpinSetup'>;
type MpinSetupScreenRouteProp = RouteProp<RootStackParamList, 'MpinSetup'>;

interface Props {
  navigation: MpinSetupScreenNavigationProp;
  route: MpinSetupScreenRouteProp;
}

const MpinSetupScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phoneNumber } = route.params;
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [loading, setLoading] = useState(false);

  const inputs = useRef<(TextInput | null)[]>([]);

  const clearMpinFields = () => {
    setMpin('');
    setConfirmMpin('');
    inputs.current[0]?.focus();
  };

  const handleSetupMpin = async () => {
    if (mpin.length !== 6) {
      Alert.alert('Invalid MPIN', 'MPIN must be 6 digits');
      return;
    }

    if (mpin !== confirmMpin) {
      Alert.alert('MPIN Mismatch', 'MPIN and confirm MPIN do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.setupAdminMpin(mpin);

      if (response.success) {
        await verifyMpin();
      } else {
        Alert.alert('Error', response.message || 'Failed to setup MPIN');
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', errorMessage);
      clearMpinFields();
    } finally {
      setLoading(false);
    }
  };

  const verifyMpin = async () => {
    try {
      const response = await AuthService.verifyAdminMpin(mpin);

      if (response.success) {
        navigation.replace('Home');
      } else {
        Alert.alert('Error', response.message || 'Failed to verify MPIN');
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error.message || 'Failed to verify MPIN';
      Alert.alert('Error', errorMessage);
      clearMpinFields();
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

            <Text style={styles.title}>Setup MPIN</Text>
            <Text style={styles.subtitle}>
              Create a 6-digit MPIN for secure login
            </Text>

            <Input
              label="Enter MPIN"
              placeholder="Enter 6-digit MPIN"
              value={mpin}
              onChangeText={setMpin}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              ref={(ref: any) => (inputs.current[0] = ref)}
            />

            <Input
              label="Confirm MPIN"
              placeholder="Re-enter 6-digit MPIN"
              value={confirmMpin}
              onChangeText={setConfirmMpin}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              ref={(ref: any) => (inputs.current[1] = ref)}
            />

            <Button
              title="Setup MPIN"
              onPress={handleSetupMpin}
              loading={loading}
              disabled={!mpin || !confirmMpin || mpin.length !== 6 || confirmMpin.length !== 6}
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

export default MpinSetupScreen;