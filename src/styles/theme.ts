import { COLORS } from '../utils/constants';
import { getFontSize, wp } from '../utils/responsive';

// Responsive theme with dynamic scaling
export const theme = {
  colors: COLORS,
  spacing: {
    xs: wp('2%'),
    sm: wp('3%'),
    md: wp('4%'),
    lg: wp('6%'),
    xl: wp('8%'),
  },
  typography: {
    h1: {
      fontSize: getFontSize(28), // Responsive
      fontWeight: 'bold' as const,
      lineHeight: getFontSize(28) * 1.3,
    },
    h2: {
      fontSize: getFontSize(24),
      fontWeight: '600' as const,
      lineHeight: getFontSize(24) * 1.3,
    },
    h3: {
      fontSize: getFontSize(20),
      fontWeight: '600' as const,
      lineHeight: getFontSize(20) * 1.3,
    },
    body: {
      fontSize: getFontSize(16),
      lineHeight: getFontSize(16) * 1.5,
    },
    caption: {
      fontSize: getFontSize(14),
      lineHeight: getFontSize(14) * 1.4,
    },
    small: {
      fontSize: getFontSize(12),
      lineHeight: getFontSize(12) * 1.4,
    },
  },
  borderRadius: {
    sm: wp('2%'),
    md: wp('3%'),
    lg: wp('4%'),
    xl: wp('6%'),
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5.84,
      elevation: 9,
    },
  },
};

// Device-specific adjustments
export const getResponsiveStyle = (size: 'small' | 'medium' | 'large') => {
  const adjustments = {
    small: {
      paddingMultiplier: 0.8,
      fontSizeMultiplier: 0.9,
    },
    medium: {
      paddingMultiplier: 1,
      fontSizeMultiplier: 1,
    },
    large: {
      paddingMultiplier: 1.2,
      fontSizeMultiplier: 1.1,
    },
  };
  
  return adjustments[size];
};

export default theme;