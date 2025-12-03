// src/screens/PhoneLoginScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import { AuthService } from '../services/auth';
import { getItem, setItem } from '../services/storage';
import { theme } from '../styles/theme';
import { getFontSize, hp, wp } from '../utils/responsive';

type RootStackParamList = {
  PhoneLogin: undefined;
  Otp: { phoneNumber: string };
  MpinSetup: { phoneNumber: string };
  MpinLogin: { phoneNumber: string };
};

type PhoneLoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PhoneLogin'>;

interface Props {
  navigation: PhoneLoginScreenNavigationProp;
}

// Country codes data
interface CountryCode {
  code: string;
  name: string;
  dial_code: string;
  flag: string;
}

const countryCodes: CountryCode[] = [
  { code: 'IN', name: 'India', dial_code: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dial_code: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial_code: '+44', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', dial_code: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dial_code: '+966', flag: '🇸🇦' },
  { code: 'PK', name: 'Pakistan', dial_code: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dial_code: '+880', flag: '🇧🇩' },
  { code: 'SG', name: 'Singapore', dial_code: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', dial_code: '+60', flag: '🇲🇾' },
  { code: 'CA', name: 'Canada', dial_code: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dial_code: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dial_code: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dial_code: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dial_code: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dial_code: '+34', flag: '🇪🇸' },
  { code: 'JP', name: 'Japan', dial_code: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dial_code: '+86', flag: '🇨🇳' },
  { code: 'KR', name: 'South Korea', dial_code: '+82', flag: '🇰🇷' },
  { code: 'RU', name: 'Russia', dial_code: '+7', flag: '🇷🇺' },
  { code: 'BR', name: 'Brazil', dial_code: '+55', flag: '🇧🇷' },
];

const PhoneLoginScreen: React.FC<Props> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Country code selection
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Load saved phone number and country code
  useEffect(() => {
    const loadSavedData = async () => {
      const savedPhone = await getItem('phone_number');
      const savedCountryCode = await getItem('country_code');
      
      if (savedPhone) {
        setPhoneNumber(savedPhone);
        console.log("📱 LOADED SAVED PHONE NUMBER:", savedPhone);
      }
      
      if (savedCountryCode) {
        const country = countryCodes.find(c => c.dial_code === savedCountryCode);
        if (country) {
          setSelectedCountry(country);
          console.log("📱 LOADED SAVED COUNTRY CODE:", savedCountryCode);
        }
      }
    };
    
    loadSavedData();
  }, []);

  const handleContinue = async () => {
    // Remove any non-digit characters
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhoneNumber.length < 7 || cleanPhoneNumber.length > 15) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number (7-15 digits)');
      return;
    }

    // Format phone number with country code
    const formattedPhone = `${selectedCountry.dial_code}${cleanPhoneNumber}`;
    
    console.log("📱 LOGIN ATTEMPT:", {
      raw: phoneNumber,
      clean: cleanPhoneNumber,
      formatted: formattedPhone,
      countryCode: selectedCountry.dial_code
    });
    
    setLoading(true);

    try {
      const response = await AuthService.adminLoginInitiate(formattedPhone);

      if (response.success) {
        // Store phone number and country code for future use
        await setItem('phone_number', cleanPhoneNumber);
        await setItem('country_code', selectedCountry.dial_code);
        
        if (response.data.device_trusted && response.data.has_mpin) {
          // Store admin_id for MPIN login
          if (response.data.user_id) {
            await setItem('admin_id', response.data.user_id);
            console.log("💾 STORED ADMIN ID:", response.data.user_id);
          }
          navigation.navigate('MpinLogin', { phoneNumber: formattedPhone });
        } else {
          await AuthService.sendOtp(formattedPhone, 'admin_login');
          navigation.navigate('Otp', { phoneNumber: formattedPhone });
        }
      } else {
        Alert.alert('Error', response.message || 'Something went wrong');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCountryCodeItem = (country: CountryCode) => (
    <TouchableOpacity
      key={country.code}
      style={[
        styles.countryItem,
        selectedCountry.code === country.code && styles.countryItemSelected
      ]}
      onPress={() => {
        setSelectedCountry(country);
        setShowCountryPicker(false);
      }}
    >
      <Text style={styles.countryFlag}>{country.flag}</Text>
      <Text style={styles.countryName}>{country.name}</Text>
      <Text style={styles.countryCode}>{country.dial_code}</Text>
    </TouchableOpacity>
  );

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

            <Text style={styles.title}>Admin Login</Text>
            <Text style={styles.subtitle}>
              Enter your phone number to continue
            </Text>

            <View style={styles.phoneContainer}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.phoneInputContainer}>
                {/* Country Code Selector */}
                <TouchableOpacity
                  style={styles.countryCodeButton}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={styles.countryCodeText}>
                    {selectedCountry.flag} {selectedCountry.dial_code}
                  </Text>
                  <Ionicons name="chevron-down" size={getFontSize(16)} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                
                {/* Phone Number Input */}
                <View style={styles.phoneInputWrapper}>
                  <Input
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={15}
                    style={styles.phoneInput}
                  />
                </View>
              </View>
            </View>

            <Button
              title={loading ? "Processing..." : "Continue"}
              onPress={handleContinue}
              loading={loading}
              disabled={!phoneNumber}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Code Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TouchableOpacity
                onPress={() => setShowCountryPicker(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={getFontSize(24)} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.countryList}>
              {countryCodes.map(renderCountryCodeItem)}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  phoneContainer: {
    marginBottom: hp('2%'),
    width: '100%',
  },
  label: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: hp('1%'),
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: wp('2%'),
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    minWidth: wp('25%'),
    minHeight: hp('6%'),
  },
  countryCodeText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginRight: wp('2%'),
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  // Country Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: hp('70%'),
    minHeight: hp('30%'),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalCloseButton: {
    padding: wp('2%'),
    minWidth: wp('12%'),
    minHeight: hp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryList: {
    maxHeight: hp('60%'),
    paddingHorizontal: wp('4%'),
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.border}50`,
  },
  countryItemSelected: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  countryFlag: {
    fontSize: wp('6%'),
    marginRight: wp('3%'),
    width: wp('8%'),
  },
  countryName: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  countryCode: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});

export default PhoneLoginScreen;