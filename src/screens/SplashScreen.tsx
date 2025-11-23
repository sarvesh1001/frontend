import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Logo from '../components/Logo';
import { getItem } from '../services/storage';
import { theme } from '../styles/theme';

type RootStackParamList = {
  Splash: undefined;
  LoginType: undefined;
  Home: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = await getItem('access_token');
      
      setTimeout(() => {
        if (accessToken) {
          navigation.replace('Home');
        } else {
          navigation.replace('LoginType');
        }
      }, 2000);
    };

    checkAuth();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Logo />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});

export default SplashScreen;