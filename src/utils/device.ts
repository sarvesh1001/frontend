import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { getItem, setItem } from '../services/storage';

// Keychain/Keystore keys
const SECURE_DEVICE_ID_KEY = 'prayantra_persistent_device_id';
const SECURE_FINGERPRINT_KEY = 'prayantra_persistent_fingerprint';

// Generate and store persistent device ID using Secure Hardware
const generateAndStorePersistentDeviceId = async (): Promise<string> => {
  try {
    // First, try to get existing device ID from SecureStore (Keychain/Keystore)
    let deviceId = await SecureStore.getItemAsync(SECURE_DEVICE_ID_KEY);
    
    if (!deviceId) {
      console.log("🔐 NO EXISTING DEVICE ID, GENERATING NEW ONE...");
      
      // Generate cryptographically secure random bytes
      const randomBytes = Crypto.getRandomBytes(32);
      const timestamp = Date.now().toString(36);
      
      // Create a unique identifier using device info + random data
      const uniqueString = `${Device.modelName}-${Device.brand}-${Platform.OS}-${timestamp}-${Array.from(randomBytes).join('')}`;
      
      // Generate SHA-256 hash
      const deviceHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        uniqueString
      );
      
      // Use first 16 chars for device ID, store the rest for fingerprint
      deviceId = `prayantra-${Platform.OS}-${deviceHash.substring(0, 16)}`;
      
      // Store in SecureStore (Keychain/Keystore) - persists across reinstalls
      await SecureStore.setItemAsync(SECURE_DEVICE_ID_KEY, deviceId);
      
      // Also store the full hash for fingerprint generation
      await SecureStore.setItemAsync(SECURE_FINGERPRINT_KEY, deviceHash);
      
      console.log("🔐 GENERATED & STORED PERSISTENT DEVICE ID:", deviceId);
    } else {
      console.log("🔐 RETRIEVED EXISTING PERSISTENT DEVICE ID:", deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('❌ Secure device ID generation failed:', error);
    // Fallback to in-app storage (less persistent)
    const fallbackId = `prayantra-${Platform.OS}-${Date.now()}`;
    console.log("⚠️  Using fallback device ID");
    return fallbackId;
  }
};

// Generate persistent device fingerprint using stored hash
const generatePersistentDeviceFingerprint = async (deviceId: string): Promise<string> => {
  try {
    // Get the stored hash from SecureStore
    const storedHash = await SecureStore.getItemAsync(SECURE_FINGERPRINT_KEY);
    
    let fingerprintHash: string;
    
    if (storedHash) {
      // Use the existing stored hash (persistent across reinstalls)
      fingerprintHash = storedHash;
      console.log("🔐 USING EXISTING PERSISTENT FINGERPRINT HASH");
    } else {
      // Generate new hash (shouldn't happen if device ID exists)
      console.log("⚠️  NO STORED FINGERPRINT HASH, GENERATING NEW...");
      const randomBytes = Crypto.getRandomBytes(32);
      const uniqueString = `${Device.modelName}-${Device.brand}-${Platform.OS}-${Date.now()}-${Array.from(randomBytes).join('')}`;
      fingerprintHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        uniqueString
      );
      await SecureStore.setItemAsync(SECURE_FINGERPRINT_KEY, fingerprintHash);
    }

    // Create fingerprint using device info + persistent hash
    const fingerprintData = {
      // Core identifiers
      device_id: deviceId,
      persistent_hash: fingerprintHash.substring(16, 32), // Use second half of hash
      
      // Device information (for recognition)
      device_model: Device.modelName || 'Unknown',
      device_brand: Device.brand || 'Unknown',
      device_manufacturer: Device.manufacturer || 'Unknown',
      device_type: Device.deviceType || 1,
      
      // Platform information
      platform: Platform.OS,
      os_version: Device.osVersion || 'Unknown',
      platform_version: Platform.Version,
      
      // Device capabilities
      total_memory: Device.totalMemory,
      is_emulator: !Device.isDevice,
      
      // App context
      app_name: 'Prayantra Admin',
      app_version: '1.0.0',
      app_platform: Platform.OS,
      
      // Security context
      is_trusted_device: false,
      trust_level: 'initial',
      secure_storage: 'keychain_keystore', // Indicates we're using secure hardware
      
      // Timestamp of first generation
      first_seen: new Date().toISOString().split('T')[0]
    };

    return JSON.stringify(fingerprintData);
  } catch (error) {
    console.error('❌ Persistent fingerprint generation failed:', error);
    // Fallback fingerprint
    return JSON.stringify({
      device_id: deviceId,
      platform: Platform.OS,
      app_name: 'Prayantra Admin',
      secure_storage: 'fallback',
      timestamp: new Date().toISOString()
    });
  }
};

// Generate secure user agent
const generateSecureUserAgent = (): string => {
  const appName = 'Prayantra';
  const appVersion = '1.0';
  const platform = Platform.OS;
  
  if (platform === 'ios') {
    return `${appName}/${appVersion} (iOS)`;
  } else if (platform === 'android') {
    return `${appName}/${appVersion} (Android)`;
  } else {
    return `${appName}/${appVersion} (${platform})`;
  }
};

// Check biometric capabilities
const checkBiometricCapabilities = async (): Promise<{
  isBiometricSupported: boolean;
  biometricType: string;
  isEnrolled: boolean;
}> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedBiometrics = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    let biometricType = 'none';
    let isBiometricSupported = false;

    if (hasHardware && isEnrolled) {
      isBiometricSupported = true;
      
      const biometricTypes = {
        [LocalAuthentication.AuthenticationType.FINGERPRINT]: 'fingerprint',
        [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]: 'face_id',
        [LocalAuthentication.AuthenticationType.IRIS]: 'iris',
      };

      if (supportedBiometrics.length > 0) {
        const primaryBiometric = supportedBiometrics[0];
        biometricType = biometricTypes[primaryBiometric] || 'biometric';
      }
    }

    return {
      isBiometricSupported,
      biometricType,
      isEnrolled,
    };
  } catch (error) {
    console.error('Error checking biometric capabilities:', error);
    return {
      isBiometricSupported: false,
      biometricType: 'none',
      isEnrolled: false,
    };
  }
};

// Verify SecureStore availability and persistence
const verifySecureStorage = async (): Promise<boolean> => {
  try {
    const testKey = 'prayantra_storage_test';
    const testValue = `test-${Date.now()}`;
    
    // Write test value
    await SecureStore.setItemAsync(testKey, testValue);
    
    // Read back
    const retrievedValue = await SecureStore.getItemAsync(testKey);
    
    // Clean up
    await SecureStore.deleteItemAsync(testKey);
    
    const isWorking = retrievedValue === testValue;
    console.log(`🔐 SECURE STORAGE TEST: ${isWorking ? 'PASSED' : 'FAILED'}`);
    
    return isWorking;
  } catch (error) {
    console.error('❌ Secure storage verification failed:', error);
    return false;
  }
};

// Main device info function using Secure Hardware
export const getDeviceInfo = async (): Promise<{
  deviceId: string;
  deviceFingerprint: string;
  userAgent: string;
  biometricType: string;
  isBiometricSupported: boolean;
  secureStorageAvailable: boolean;
}> => {
  try {
    // Verify secure storage is working
    const secureStorageAvailable = await verifySecureStorage();
    
    if (!secureStorageAvailable) {
      console.warn("⚠️ SECURE STORAGE NOT AVAILABLE, USING FALLBACK");
    }

    // Generate or retrieve persistent device ID from SecureStore
    const deviceId = await generateAndStorePersistentDeviceId();
    
    // Generate persistent device fingerprint using stored hash
    const deviceFingerprint = await generatePersistentDeviceFingerprint(deviceId);
    
    // Generate secure user agent
    const userAgent = generateSecureUserAgent();
    
    // Check biometric capabilities
    const biometricInfo = await checkBiometricCapabilities();

    // Store in AsyncStorage for quick access (cache)
    await setItem('device_id', deviceId);
    await setItem('device_fingerprint', deviceFingerprint);
    await setItem('user_agent', userAgent);
    await setItem('secure_storage_available', secureStorageAvailable.toString());

    console.log("✅ SECURE HARDWARE DEVICE INFO GENERATED");
    console.log("📱 DEVICE ID:", deviceId);
    console.log("🔐 SECURE STORAGE:", secureStorageAvailable ? "Keychain/Keystore" : "Fallback");
    console.log("🔐 FINGERPRINT LENGTH:", deviceFingerprint.length);
    
    return {
      deviceId,
      deviceFingerprint,
      userAgent,
      biometricType: biometricInfo.biometricType,
      isBiometricSupported: biometricInfo.isBiometricSupported,
      secureStorageAvailable
    };
  } catch (error) {
    console.error('❌ Secure hardware device info generation failed:', error);
    throw new Error('Failed to initialize secure device identity');
  }
};

// Check biometric availability
export const checkBiometricAvailability = async (): Promise<{
  isBiometricSupported: boolean;
  biometricType: string;
}> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedBiometrics = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    let biometricType = 'none';
    let isBiometricSupported = false;

    if (hasHardware && isEnrolled) {
      isBiometricSupported = true;
      
      const biometricTypes = {
        [LocalAuthentication.AuthenticationType.FINGERPRINT]: 'fingerprint',
        [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]: 'face_id',
        [LocalAuthentication.AuthenticationType.IRIS]: 'iris',
      };

      if (supportedBiometrics.length > 0) {
        const primaryBiometric = supportedBiometrics[0];
        biometricType = biometricTypes[primaryBiometric] || 'biometric';
      }
    }

    return {
      isBiometricSupported,
      biometricType,
    };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return {
      isBiometricSupported: false,
      biometricType: 'none',
    };
  }
};

// Get stored device info (prioritizes SecureStore)
export const getStoredDeviceInfo = async (): Promise<{
  deviceId: string;
  deviceFingerprint: string;
  userAgent: string;
  secureStorageAvailable: boolean;
}> => {
  try {
    // First, try to get from SecureStore (Keychain/Keystore)
    let deviceId = await SecureStore.getItemAsync(SECURE_DEVICE_ID_KEY);
    let deviceFingerprint: string | null = null;
    
    if (deviceId) {
      // We have a persistent device ID, generate fingerprint from stored hash
      deviceFingerprint = await generatePersistentDeviceFingerprint(deviceId);
      console.log("🔐 USING PERSISTENT SECURE STORAGE DEVICE INFO");
    }
    
    // If no persistent data, check AsyncStorage cache
    if (!deviceId || !deviceFingerprint) {
      console.warn("⚠️ NO PERSISTENT DATA, CHECKING CACHE...");
      deviceId = await getItem('device_id');
      deviceFingerprint = await getItem('device_fingerprint');
    }

    // If still no data, regenerate everything
    if (!deviceId || !deviceFingerprint) {
      console.warn("⚠️ NO DEVICE INFO FOUND, REGENERATING...");
      const newDeviceInfo = await getDeviceInfo();
      return {
        deviceId: newDeviceInfo.deviceId,
        deviceFingerprint: newDeviceInfo.deviceFingerprint,
        userAgent: newDeviceInfo.userAgent,
        secureStorageAvailable: newDeviceInfo.secureStorageAvailable
      };
    }

    const userAgent = await getItem('user_agent') || generateSecureUserAgent();
    const secureStorageAvailable = await getItem('secure_storage_available') === 'true';

    console.log("✅ USING PERSISTENT DEVICE INFO");
    console.log("📱 DEVICE ID:", deviceId.substring(0, 20) + '...');
    console.log("🔐 STORAGE:", secureStorageAvailable ? "Secure" : "Cache");
    
    return {
      deviceId,
      deviceFingerprint,
      userAgent,
      secureStorageAvailable
    };
  } catch (error) {
    console.error('❌ Error getting stored device info:', error);
    throw error;
  }
};

// Initialize device info on app start
export const initializeDeviceInfo = async (): Promise<void> => {
  console.log("🚀 INITIALIZING SECURE HARDWARE DEVICE INFORMATION...");
  try {
    await getDeviceInfo();
    console.log("✅ SECURE HARDWARE DEVICE INFORMATION INITIALIZED");
  } catch (error) {
    console.error("❌ SECURE HARDWARE DEVICE INITIALIZATION FAILED:", error);
    throw error;
  }
};

// Clear all device data (only on explicit logout/uninstall)
export const clearPersistentDeviceData = async (): Promise<void> => {
  try {
    // Clear SecureStore (Keychain/Keystore)
    await SecureStore.deleteItemAsync(SECURE_DEVICE_ID_KEY);
    await SecureStore.deleteItemAsync(SECURE_FINGERPRINT_KEY);
    
    console.log("✅ PERSISTENT DEVICE DATA CLEARED FROM SECURE STORAGE");
  } catch (error) {
    console.error('❌ Error clearing persistent device data:', error);
  }
};

// Migration function (if needed in future updates)
export const migrateToSecureStorage = async (): Promise<boolean> => {
  try {
    const oldDeviceId = await getItem('device_id');
    const hasSecureId = await SecureStore.getItemAsync(SECURE_DEVICE_ID_KEY);
    
    if (oldDeviceId && !hasSecureId) {
      console.log("🔄 MIGRATING DEVICE ID TO SECURE STORAGE...");
      await SecureStore.setItemAsync(SECURE_DEVICE_ID_KEY, oldDeviceId);
      console.log("✅ MIGRATION COMPLETE");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
};