import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { setItem } from '../services/storage';
import { theme } from '../styles/theme';
import { hp, wp } from '../utils/responsive';

type RootStackParamList = {
  LoginType: undefined;
  PhoneLogin: { userType: 'admin' | 'user' };
};

type LoginTypeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LoginType'>;

interface Props {
  navigation: LoginTypeScreenNavigationProp;
}

const LoginTypeScreen: React.FC<Props> = ({ navigation }) => {
  const handleAdminLogin = async () => {
    await setItem('user_type', 'admin');
    navigation.navigate('PhoneLogin', { userType: 'admin' });
  };

  const handleUserLogin = async () => {
    await setItem('user_type', 'user');
    navigation.navigate('PhoneLogin', { userType: 'user' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Logo />
        
        <Text style={styles.title}>Choose Login Type</Text>
        <Text style={styles.subtitle}>Select how you want to login to Prayantra</Text>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Admin Login"
            onPress={handleAdminLogin}
            variant="primary"
            fullWidth
            style={styles.button}
          />
          
          <Button
            title="User Login"
            onPress={handleUserLogin}
            variant="outline"
            fullWidth
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    paddingTop: hp('10%'),
    alignItems: 'center',
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
    marginBottom: hp('8%'),
  },
  buttonContainer: {
    width: '100%',
    maxWidth: wp('80%'),
  },
  button: {
    marginBottom: hp('2%'),
  },
});

export default LoginTypeScreen;