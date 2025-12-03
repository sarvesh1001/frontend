import { Dimensions, Platform } from 'react-native';
import { isLargeDevice, isSmallDevice } from './responsive';

const { width, height } = Dimensions.get('window');

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const deviceType = {
  isSmallDevice: isSmallDevice(),
  isLargeDevice: isLargeDevice(),
  isTablet: width >= 768 && height >= 1024,
  isPhone: width < 768,
};

export const platformSpecific = {
  // Touch targets
  minTouchTarget: Platform.OS === 'ios' ? 44 : 48,
  
  // Padding adjustments
  safeAreaPadding: Platform.OS === 'ios' ? 20 : 16,
  
  // Font adjustments
  fontScale: Platform.OS === 'ios' ? 1 : 1.1,
  
  // Button heights
  buttonHeight: Platform.OS === 'ios' ? 48 : 52,
};

// Get responsive dimensions based on device
export const getResponsiveValue = (baseValue: number): number => {
  const baseWidth = 375; // iPhone X
  const scale = width / baseWidth;
  
  if (deviceType.isTablet) {
    return baseValue * 1.2;
  }
  
  if (deviceType.isSmallDevice) {
    return baseValue * 0.9;
  }
  
  if (deviceType.isLargeDevice) {
    return baseValue * 1.1;
  }
  
  return baseValue * scale;
};