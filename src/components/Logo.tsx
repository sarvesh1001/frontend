import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../styles/theme';
import { hp, wp } from '../utils/responsive';

const Logo: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>P</Text>
      </View>
      <Text style={styles.appName}>PRAYANTRA</Text>
      <Text style={styles.tagline}>THE SYSTEM OF PROGRESS</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: hp('5%'),
  },
  logoCircle: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoText: {
    fontSize: wp('8%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: hp('1%'),
  },
  tagline: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});

export default Logo;