import {
  heightPercentageToDP as hp,
  listenOrientationChange as loc,
  removeOrientationListener as rol,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen';

// Additional responsive functions
export const getFontSize = (size: number): number => {
  // Base font size calculation
  const baseWidth = 375; // iPhone X width
  const scale = wp('100%') / baseWidth;
  return Math.round(size * scale);
};

export const getLineHeight = (size: number): number => {
  return getFontSize(size) * 1.2;
};

export const getAspectRatio = (ratio: number): number => {
  return wp('100%') * ratio;
};

// Device type detection
export const isSmallDevice = (): boolean => {
  return wp('100%') < 360;
};

export const isLargeDevice = (): boolean => {
  return wp('100%') > 414;
};

// Screen orientation
export const isPortrait = (): boolean => {
  return hp('100%') > wp('100%');
};

export const isLandscape = (): boolean => {
  return wp('100%') > hp('100%');
};

export { hp, loc, rol, wp };
