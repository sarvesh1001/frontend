import { COLORS } from '../utils/constants';
import { wp } from '../utils/responsive';

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
      fontSize: wp('8%'),
      fontWeight: 'bold' as const,
    },
    h2: {
      fontSize: wp('6%'),
      fontWeight: '600' as const,
    },
    h3: {
      fontSize: wp('5%'),
      fontWeight: '600' as const,
    },
    body: {
      fontSize: wp('4%'),
    },
    caption: {
      fontSize: wp('3.5%'),
    },
  },
  borderRadius: {
    sm: wp('2%'),
    md: wp('3%'),
    lg: wp('4%'),
  },
};

// Remove ThemeProvider and just export theme
export default theme;