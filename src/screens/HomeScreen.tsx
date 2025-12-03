// src/screens/HomeScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { AuthService } from '../services/auth';
import { getItem } from '../services/storage';
import { theme } from '../styles/theme';
import { checkBiometricAvailability } from '../utils/device';
import { hp, wp } from '../utils/responsive';

type RootStackParamList = {
  Home: undefined;
  QrScanner: undefined;
  PhoneLogin: undefined;
  CompanyManagement: undefined;
  AddCompany: undefined;
  Splash: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [biometricInfo, setBiometricInfo] = useState<{
    isBiometricSupported: boolean;
    biometricType: string;
  } | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
    loadDeviceInfo();
    loadBiometricInfo();
    loadPhoneNumber();
    
    // Start token refresh timer when HomeScreen mounts
    AuthService.startTokenRefreshTimer();
  }, []);

  const loadAdminData = async () => {
    const adminInfoStr = await getItem('admin_info');
    const adminId = await getItem('admin_id');
    
    if (adminInfoStr) {
      setAdminInfo(JSON.parse(adminInfoStr));
    } else if (adminId) {
      setAdminInfo({
        admin_id: adminId,
        admin_role_level: 'Administrator'
      });
    }
  };

  const loadDeviceInfo = async () => {
    const deviceId = await getItem('device_id');
    const userAgent = await getItem('user_agent');
    const deviceFingerprint = await getItem('device_fingerprint');
    
    if (deviceId && userAgent) {
      setDeviceInfo({
        deviceId,
        userAgent,
        deviceFingerprint
      });
    }
  };

  const loadBiometricInfo = async () => {
    const info = await checkBiometricAvailability();
    setBiometricInfo(info);
  };

  const loadPhoneNumber = async () => {
    const storedPhone = await getItem('phone_number');
    setPhoneNumber(storedPhone);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'You can log back in with your MPIN. Your phone number will be remembered.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              // This will stop the refresh timer but preserve phone number
              await AuthService.logout();
              // Navigate to Splash which will redirect to MPIN login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Splash' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Splash' }],
              });
            }
          }
        },
      ]
    );
  };

  const handleClearAccount = async () => {
    Alert.alert(
      'Remove Account',
      'This will remove your phone number from this device. You will need to enter it again next time.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            // Clear everything including phone number
            await AuthService.fullLogout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'PhoneLogin' }],
            });
          }
        },
      ]
    );
  };

  const navigateToQRScanner = () => {
    navigation.navigate('QrScanner');
  };

  const navigateToCompanyManagement = () => {
    navigation.navigate('CompanyManagement');
  };

  const getBiometricDisplayName = (type: string) => {
    switch (type) {
      case 'fingerprint': return 'Fingerprint';
      case 'face_id': return 'Face ID';
      case 'iris': return 'Iris Scanner';
      default: return 'Not Available';
    }
  };

  const getDeviceIdDisplay = (deviceId: string) => {
    if (!deviceId) return 'Not Available';
    return `${deviceId.substring(0, 10)}...${deviceId.substring(deviceId.length - 6)}`;
  };

  const viewDeviceFingerprint = () => {
    if (deviceInfo?.deviceFingerprint) {
      try {
        const fingerprintData = JSON.parse(deviceInfo.deviceFingerprint);
        Alert.alert(
          'Device Fingerprint',
          `Device: ${fingerprintData.device_model}\nPlatform: ${fingerprintData.platform}\nOS: ${fingerprintData.os_version}\nBiometric: ${getBiometricDisplayName(fingerprintData.biometric_type)}`,
          [{ text: 'OK' }]
        );
      } catch (error) {
        Alert.alert('Device Fingerprint', 'Unable to parse fingerprint data');
      }
    } else {
      Alert.alert('Device Fingerprint', 'No fingerprint data available');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Logo />
          <Text style={styles.welcomeText}>
            Welcome to Prayantra
          </Text>
          <Text style={styles.userType}>
            Administrator Dashboard
          </Text>
          {phoneNumber && (
            <Text style={styles.phoneInfo}>
              Logged in as: {phoneNumber}
            </Text>
          )}
        </View>

        <View style={styles.content}>
          {/* QR Scanner Quick Action */}
          <TouchableOpacity 
            style={styles.qrCard}
            onPress={navigateToQRScanner}
          >
            <View style={styles.qrIconContainer}>
              <Ionicons name="qr-code-outline" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.qrTextContainer}>
              <Text style={styles.qrTitle}>Scan QR for Web Login</Text>
              <Text style={styles.qrDescription}>
                Login to Prayantra Web on your computer
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Admin Information Card */}
          {adminInfo && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Admin Information</Text>
              <Text style={styles.infoText}>
                Admin ID: {getDeviceIdDisplay(adminInfo.admin_id)}
              </Text>
              <Text style={styles.infoText}>
                Role: {adminInfo.admin_role_level || 'Administrator'}
              </Text>
              {phoneNumber && (
                <Text style={styles.infoText}>
                  Phone: {phoneNumber}
                </Text>
              )}
            </View>
          )}

          {/* Device Information Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Device Information</Text>
            
            {deviceInfo && (
              <>
                <Text style={styles.infoText}>
                  Device ID: {getDeviceIdDisplay(deviceInfo.deviceId)}
                </Text>
                <Text style={styles.infoText}>
                  User Agent: {deviceInfo.userAgent}
                </Text>
              </>
            )}
            
            {biometricInfo && (
              <Text style={styles.infoText}>
                Biometric: {biometricInfo.isBiometricSupported 
                  ? getBiometricDisplayName(biometricInfo.biometricType) 
                  : 'Not Available'
                }
              </Text>
            )}

            <TouchableOpacity onPress={viewDeviceFingerprint}>
              <Text style={styles.viewFingerprintText}>
                View Device Fingerprint
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.actionButtons}>
              <Button
                title="Company Management"
                onPress={navigateToCompanyManagement}
                variant="outline"
                fullWidth
                style={styles.actionButton}
              />
              
              <Button
                title="Admin Profile"
                onPress={() => Alert.alert('Coming Soon', 'Admin profile feature will be available soon')}
                variant="outline"
                fullWidth
                style={styles.actionButton}
              />
              
              <Button
                title="User Management"
                onPress={() => Alert.alert('Coming Soon', 'User management feature will be available soon')}
                variant="outline"
                fullWidth
                style={styles.actionButton}
              />
              
              <Button
                title="System Settings"
                onPress={() => Alert.alert('Coming Soon', 'System settings feature will be available soon')}
                variant="outline"
                fullWidth
                style={styles.actionButton}
              />

              <Button
                title="Audit Logs"
                onPress={() => Alert.alert('Coming Soon', 'Audit logs feature will be available soon')}
                variant="outline"
                fullWidth
                style={styles.actionButton}
              />

              <Button
                title="Clear Account from Device"
                onPress={handleClearAccount}
                variant="outline"
                fullWidth
                style={styles.clearAccountButton}
                icon="log-out-outline"
              />
            </View>
          </View>

          <View style={styles.logoutSection}>
            <Button
              title="Logout"
              onPress={handleLogout}
              variant="outline"
              fullWidth
              style={styles.logoutButton}
            />
            <Text style={styles.logoutNote}>
              Your phone number will be remembered for faster login
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: hp('4%'),
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    marginBottom: hp('2%'),
  },
  welcomeText: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: hp('2%'),
  },
  userType: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: hp('1%'),
  },
  phoneInfo: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.primary,
    fontWeight: '500',
    marginTop: hp('1%'),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    paddingBottom: hp('4%'),
  },
  qrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: wp('4%'),
    borderRadius: theme.borderRadius.lg,
    marginBottom: hp('4%'),
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  qrIconContainer: {
    marginRight: wp('4%'),
  },
  qrTextContainer: {
    flex: 1,
  },
  qrTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: hp('0.5%'),
  },
  qrDescription: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    padding: wp('4%'),
    borderRadius: theme.borderRadius.lg,
    marginBottom: hp('4%'),
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  infoTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: hp('2%'),
  },
  infoText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: hp('1%'),
  },
  viewFingerprintText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: hp('1%'),
    textAlign: 'center',
  },
  actions: {
    marginBottom: hp('4%'),
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: hp('2%'),
  },
  actionButtons: {
    gap: hp('2%'),
  },
  actionButton: {
    marginBottom: 0,
  },
  clearAccountButton: {
    borderColor: theme.colors.error,
    marginBottom: 0,
  },
  logoutSection: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  logoutButton: {
    marginBottom: hp('1%'),
  },
  logoutNote: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: hp('1%'),
  },
});

export default HomeScreen;