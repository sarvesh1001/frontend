import { Ionicons } from '@expo/vector-icons';
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
import { getItem } from '../services/storage';
import { theme } from '../styles/theme';
import { hp, wp } from '../utils/responsive';

type RootStackParamList = {
  CompanyManagement: undefined;
  AddCompany: undefined;
  Home: undefined;
};

type CompanyManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CompanyManagement'>;

interface Props {
  navigation: CompanyManagementScreenNavigationProp;
}

const CompanyManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompanies();
    loadAdminData();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to get companies
      // For now, we'll simulate loading
      setTimeout(() => {
        setCompanies([]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading companies:', error);
      Alert.alert('Error', 'Failed to load companies');
      setLoading(false);
    }
  };

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

  const handleAddCompany = () => {
    navigation.navigate('AddCompany');
  };

  const handleUpdateSubscription = () => {
    Alert.alert('Coming Soon', 'Update subscription feature will be available soon');
  };

  const handleCompanyDetails = () => {
    if (companies.length === 0) {
      Alert.alert('No Companies', 'You need to create a company first');
      return;
    }
    Alert.alert('Coming Soon', 'Company details feature will be available soon');
  };

  const handleRenewSubscription = () => {
    if (companies.length === 0) {
      Alert.alert('No Companies', 'You need to create a company first');
      return;
    }
    Alert.alert('Coming Soon', 'Renew subscription feature will be available soon');
  };

  const handleDeactivateCompany = () => {
    if (companies.length === 0) {
      Alert.alert('No Companies', 'You need to create a company first');
      return;
    }
    Alert.alert('Coming Soon', 'Deactivate company feature will be available soon');
  };

  const handleViewReports = () => {
    if (companies.length === 0) {
      Alert.alert('No Companies', 'You need to create a company first');
      return;
    }
    Alert.alert('Coming Soon', 'View reports feature will be available soon');
  };

  const handleBulkOperations = () => {
    if (companies.length === 0) {
      Alert.alert('No Companies', 'You need to create a company first');
      return;
    }
    Alert.alert('Coming Soon', 'Bulk operations feature will be available soon');
  };

  const handleDataExport = () => {
    if (companies.length === 0) {
      Alert.alert('No Companies', 'You need to create a company first');
      return;
    }
    Alert.alert('Coming Soon', 'Data export feature will be available soon');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Company Management</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Company Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={styles.statsIconContainer}>
                <Ionicons name="business" size={32} color={theme.colors.primary} />
              </View>
              <View style={styles.statsInfo}>
                <Text style={styles.statsTitle}>Company Overview</Text>
                <Text style={styles.statsSubtitle}>
                  Manage all your company accounts and subscriptions
                </Text>
              </View>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{companies.length}</Text>
                <Text style={styles.statLabel}>Total Companies</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {companies.filter(c => c.subscription_status === 'active').length}
                </Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {companies.filter(c => c.subscription_status === 'expiring').length}
                </Text>
                <Text style={styles.statLabel}>Expiring</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions Grid */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {/* Row 1 */}
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={handleAddCompany}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
                </View>
                <Text style={styles.actionTitle}>Create New Company</Text>
                <Text style={styles.actionDescription}>
                  Set up a new company with RBAC
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={handleUpdateSubscription}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="sync" size={28} color="#4CAF50" />
                </View>
                <Text style={styles.actionTitle}>Update Subscription</Text>
                <Text style={styles.actionDescription}>
                  Change tier or upgrade/downgrade
                </Text>
              </TouchableOpacity>

              {/* Row 2 */}
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={handleCompanyDetails}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="business" size={28} color="#FF9800" />
                </View>
                <Text style={styles.actionTitle}>Company Details</Text>
                <Text style={styles.actionDescription}>
                  View and edit company information
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={handleRenewSubscription}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                  <Ionicons name="refresh" size={28} color="#9C27B0" />
                </View>
                <Text style={styles.actionTitle}>Renew Subscription</Text>
                <Text style={styles.actionDescription}>
                  Extend subscription period
                </Text>
              </TouchableOpacity>

              {/* Row 3 */}
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={handleDeactivateCompany}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="power" size={28} color="#F44336" />
                </View>
                <Text style={styles.actionTitle}>Deactivate Company</Text>
                <Text style={styles.actionDescription}>
                  Temporarily suspend a company
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={handleViewReports}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#E0F7FA' }]}>
                  <Ionicons name="analytics" size={28} color="#00BCD4" />
                </View>
                <Text style={styles.actionTitle}>View Reports</Text>
                <Text style={styles.actionDescription}>
                  Analytics and usage reports
                </Text>
              </TouchableOpacity>

              {/* Row 4 */}
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={handleBulkOperations}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#E8EAF6' }]}>
                  <Ionicons name="layers" size={28} color="#3F51B5" />
                </View>
                <Text style={styles.actionTitle}>Bulk Operations</Text>
                <Text style={styles.actionDescription}>
                  Manage multiple companies at once
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={handleDataExport}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#F1F8E9' }]}>
                  <Ionicons name="download" size={28} color="#8BC34A" />
                </View>
                <Text style={styles.actionTitle}>Data Export</Text>
                <Text style={styles.actionDescription}>
                  Export company data and reports
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Companies Section (Will be populated when companies exist) */}
          {companies.length > 0 && (
            <View style={styles.companiesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Companies</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              
              {/* TODO: Add list of recent companies here */}
              <View style={styles.emptyCompanies}>
                <Ionicons name="business-outline" size={48} color={theme.colors.border} />
                <Text style={styles.emptyCompaniesText}>
                  No companies created yet
                </Text>
              </View>
            </View>
          )}

          {/* Empty State (When no companies exist) */}
          {companies.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="business-outline" size={64} color={theme.colors.border} />
              </View>
              <Text style={styles.emptyStateTitle}>No Companies Yet</Text>
              <Text style={styles.emptyStateText}>
                You haven't created any companies yet. Start by creating your first company to manage subscriptions, employees, and departments.
              </Text>
              <View style={styles.emptyStateActions}>
                <Button
                  title="Create First Company"
                  onPress={handleAddCompany}
                  icon="add-circle-outline"
                  fullWidth
                  style={styles.createFirstButton}
                />
              </View>
            </View>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: wp('2%'),
  },
  headerTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('4%'),
  },
  statsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: wp('4%'),
    marginTop: hp('2%'),
    marginBottom: hp('4%'),
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  statsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('4%'),
  },
  statsInfo: {
    flex: 1,
  },
  statsTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: hp('0.5%'),
  },
  statsSubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: hp('0.5%'),
  },
  statLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  actionsSection: {
    marginBottom: hp('4%'),
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: hp('2%'),
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -wp('1.5%'),
  },
  actionCard: {
    width: '46%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: wp('4%'),
    marginHorizontal: wp('1.5%'),
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  actionTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: hp('0.5%'),
  },
  actionDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  companiesSection: {
    marginBottom: hp('4%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  viewAllText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyCompanies: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('6%'),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyCompaniesText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: hp('2%'),
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('10%'),
    paddingVertical: hp('8%'),
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${theme.colors.border}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('4%'),
  },
  emptyStateTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: hp('2%'),
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: hp('4%'),
  },
  emptyStateActions: {
    width: '100%',
    maxWidth: wp('80%'),
  },
  createFirstButton: {
    marginBottom: 0,
  },
});

export default CompanyManagementScreen;