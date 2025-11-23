import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { AuthService } from '../services/auth';
import { getItem } from '../services/storage';
import { theme } from '../styles/theme';
import { hp, wp } from '../utils/responsive';

type RootStackParamList = {
  Home: undefined;
  LoginType: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [userType, setUserType] = useState<'admin' | 'user' | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const storedUserType = await getItem('user_type');
    const companyContext = await getItem('company_context');
    
    setUserType(storedUserType as 'admin' | 'user');
    
    if (companyContext) {
      setUserInfo(JSON.parse(companyContext));
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              navigation.replace('LoginType');
            } catch (error) {
              console.error('Logout error:', error);
              navigation.replace('LoginType');
            }
          }
        },
      ]
    );
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
            {userType === 'admin' ? 'Administrator' : 'User'} Dashboard
          </Text>
        </View>

        <View style={styles.content}>
          {userInfo && userType === 'user' && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Company Information</Text>
              <Text style={styles.infoText}>
                Company: {userInfo.company_id}
              </Text>
              <Text style={styles.infoText}>
                Employee ID: {userInfo.employee_id}
              </Text>
              <Text style={styles.infoText}>
                Role: {userInfo.role_name}
              </Text>
              <Text style={styles.infoText}>
                Department: {userInfo.department_name}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.actionButtons}>
              <Button
                title="View Profile"
                onPress={() => Alert.alert('Coming Soon', 'Profile feature will be available soon')}
                variant="outline"
                fullWidth
                style={styles.actionButton}
              />
              
              <Button
                title="Settings"
                onPress={() => Alert.alert('Coming Soon', 'Settings feature will be available soon')}
                variant="outline"
                fullWidth
                style={styles.actionButton}
              />
              
              <Button
                title="Help & Support"
                onPress={() => Alert.alert('Coming Soon', 'Help & Support will be available soon')}
                variant="outline"
                fullWidth
                style={styles.actionButton}
              />
            </View>
          </View>

          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            fullWidth
            style={styles.logoutButton}
          />
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
  content: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    paddingBottom: hp('4%'),
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
  logoutButton: {
    marginTop: 'auto',
  },
});

export default HomeScreen;