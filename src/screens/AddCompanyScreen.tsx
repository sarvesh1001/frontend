import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Input from '../components/Input';
import Loader from '../components/Loader';
import { AuthService } from '../services/auth';
import { theme } from '../styles/theme';
import { Department, SubscriptionTier } from '../types';
import { getFontSize, hp, wp } from '../utils/responsive';

type RootStackParamList = {
  AddCompany: undefined;
  CompanyManagement: undefined;
};

type AddCompanyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddCompany'>;

interface Props {
  navigation: AddCompanyScreenNavigationProp;
}

const subscriptionTiers: SubscriptionTier[] = ['basic', 'premium', 'diamond', 'gold', 'platinum'];
const dataRegions = ['ap-south-1', 'us-east-1', 'eu-west-1'];

// Country codes data
interface CountryCode {
  code: string;
  name: string;
  dial_code: string;
  flag: string;
}

const countryCodes: CountryCode[] = [
  { code: 'IN', name: 'India', dial_code: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dial_code: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial_code: '+44', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', dial_code: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dial_code: '+966', flag: '🇸🇦' },
  { code: 'PK', name: 'Pakistan', dial_code: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dial_code: '+880', flag: '🇧🇩' },
  { code: 'SG', name: 'Singapore', dial_code: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', dial_code: '+60', flag: '🇲🇾' },
  { code: 'CA', name: 'Canada', dial_code: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dial_code: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dial_code: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dial_code: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dial_code: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dial_code: '+34', flag: '🇪🇸' },
  { code: 'JP', name: 'Japan', dial_code: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dial_code: '+86', flag: '🇨🇳' },
  { code: 'KR', name: 'South Korea', dial_code: '+82', flag: '🇰🇷' },
  { code: 'RU', name: 'Russia', dial_code: '+7', flag: '🇷🇺' },
  { code: 'BR', name: 'Brazil', dial_code: '+55', flag: '🇧🇷' },
];

const AddCompanyScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  
  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('premium');
  const [maxEmployees, setMaxEmployees] = useState('');
  const [dataRegion, setDataRegion] = useState('ap-south-1');
  const [subscriptionMonths, setSubscriptionMonths] = useState('12');
  const [subscriptionDays, setSubscriptionDays] = useState('0');
  
  // Country code selection
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]); // Default to India
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const depts = await AuthService.getDepartments();
      setDepartments(depts);
      
      // Start with empty selection (Administration is auto-created by backend)
      setSelectedDepartments([]);
      
    } catch (error) {
      console.error('Error loading departments:', error);
      Alert.alert('Error', 'Failed to load departments');
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!ownerPhone.trim()) {
      newErrors.ownerPhone = 'Owner phone number is required';
    } else if (!ownerPhone.match(/^\d{7,15}$/)) {
      // Validate phone number without country code (7-15 digits)
      newErrors.ownerPhone = 'Please enter a valid phone number (7-15 digits)';
    }

    if (!maxEmployees.trim()) {
      newErrors.maxEmployees = 'Max employees is required';
    } else if (parseInt(maxEmployees) <= 0) {
      newErrors.maxEmployees = 'Max employees must be greater than 0';
    }

    if (!subscriptionMonths.trim()) {
      newErrors.subscriptionMonths = 'Subscription months is required';
    } else if (parseInt(subscriptionMonths) < 0) {
      newErrors.subscriptionMonths = 'Subscription months cannot be negative';
    }

    if (!subscriptionDays.trim()) {
      newErrors.subscriptionDays = 'Subscription days is required';
    } else if (parseInt(subscriptionDays) < 0) {
      newErrors.subscriptionDays = 'Subscription days cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDepartmentToggle = (departmentName: string) => {
    // Don't allow toggling Administration department (it's auto-created by backend)
    if (departmentName === 'Administration') {
      return;
    }

    setSelectedDepartments(prev => {
      if (prev.includes(departmentName)) {
        return prev.filter(name => name !== departmentName);
      } else {
        return [...prev, departmentName];
      }
    });
  };

  const handleCreateCompany = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Filter out Administration department since it's created automatically by backend
      const departmentsToSend = selectedDepartments.filter(
        dept => dept !== 'Administration'
      );

      // Combine country code and phone number
      const formattedPhone = `${selectedCountry.dial_code}${ownerPhone.trim()}`;

      const companyData = {
        company_name: companyName.trim(),
        owner_phone: formattedPhone,
        subscription_tier: subscriptionTier,
        max_employees: parseInt(maxEmployees),
        data_region: dataRegion,
        subscription_months: parseInt(subscriptionMonths),
        subscription_days: parseInt(subscriptionDays),
        departments: departmentsToSend,
      };

      console.log("🚀 Creating company with data:", {
        ...companyData,
        owner_phone: formattedPhone,
        departments: departmentsToSend
      });

      const response = await AuthService.createCompany(companyData);
      
      if (response.success) {
        Alert.alert(
          'Success',
          'Company created successfully with RBAC setup',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('CompanyManagement')
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Error creating company:', error);
      console.error('Full error response:', error.response?.data);
      
      if (error.response?.status === 409) {
        Alert.alert(
          'Company Already Exists',
          error.response?.data?.message || 'A company with this name already exists for this owner'
        );
      } else if (error.response?.status === 403) {
        Alert.alert(
          'Forbidden',
          error.response?.data?.message || 'You do not have permission to create a company'
        );
      } else if (error.response?.status === 400) {
        Alert.alert(
          'Bad Request',
          error.response?.data?.message || 'Invalid company data. Please check your inputs.'
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message || error.message || 'Failed to create company. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const renderDepartmentItem = (department: Department) => {
    const isSelected = selectedDepartments.includes(department.name);
    const isAdministration = department.name === 'Administration';

    return (
      <TouchableOpacity
        key={department.name}
        style={[
          styles.departmentItem,
          isSelected && !isAdministration && styles.departmentItemSelected,
          isAdministration && styles.departmentItemDisabled
        ]}
        onPress={() => {
          if (!isAdministration) {
            handleDepartmentToggle(department.name);
          }
        }}
        disabled={isAdministration}
      >
        <View style={styles.departmentContent}>
          <View style={styles.departmentInfo}>
            <Text style={[
              styles.departmentName,
              isSelected && !isAdministration && styles.departmentNameSelected,
              isAdministration && styles.departmentNameDisabled
            ]}>
              {department.name}
              {isAdministration && ' (Auto-created)'}
            </Text>
            <Text style={styles.departmentDescription}>
              {department.description}
            </Text>
          </View>
          <View style={[
            styles.checkbox,
            isSelected && !isAdministration && styles.checkboxSelected,
            isAdministration && styles.checkboxAutoCreated
          ]}>
            {isAdministration ? (
              <Ionicons name="checkmark-circle" size={wp('4%')} color="#4CAF50" />
            ) : (
              <>
                {isSelected && (
                  <Ionicons name="checkmark" size={wp('4%')} color="#FFFFFF" />
                )}
              </>
            )}
          </View>
        </View>
        {isAdministration && (
          <Text style={styles.disabledNote}>
            Automatically created for company owner
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderCountryCodeItem = (country: CountryCode) => (
    <TouchableOpacity
      key={country.code}
      style={[
        styles.countryItem,
        selectedCountry.code === country.code && styles.countryItemSelected
      ]}
      onPress={() => {
        setSelectedCountry(country);
        setShowCountryPicker(false);
      }}
    >
      <Text style={styles.countryFlag}>{country.flag}</Text>
      <Text style={styles.countryName}>{country.name}</Text>
      <Text style={styles.countryCode}>{country.dial_code}</Text>
    </TouchableOpacity>
  );

  if (departmentsLoading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={getFontSize(24)} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Company</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : hp('2%')}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Company Information</Text>
              
              <Input
                label="Company Name *"
                placeholder="Enter company name"
                value={companyName}
                onChangeText={setCompanyName}
                error={errors.companyName}
                maxLength={100}
              />

              <View style={styles.phoneContainer}>
                <Text style={styles.label}>Owner Phone Number *</Text>
                <View style={styles.phoneInputContainer}>
                  {/* Country Code Selector */}
                  <TouchableOpacity
                    style={styles.countryCodeButton}
                    onPress={() => setShowCountryPicker(true)}
                  >
                    <Text style={styles.countryCodeText}>
                      {selectedCountry.flag} {selectedCountry.dial_code}
                    </Text>
                    <Ionicons name="chevron-down" size={getFontSize(16)} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  
                  {/* Phone Number Input */}
                  <View style={styles.phoneInputWrapper}>
                    <Input
                      placeholder="Phone number"
                      value={ownerPhone}
                      onChangeText={setOwnerPhone}
                      keyboardType="phone-pad"
                      error={errors.ownerPhone}
                      maxLength={15}
                      style={styles.phoneInput}
                    />
                  </View>
                </View>
                {errors.ownerPhone && (
                  <Text style={styles.errorText}>{errors.ownerPhone}</Text>
                )}
              </View>

              <Input
                label="Max Employees *"
                placeholder="Enter maximum number of employees"
                value={maxEmployees}
                onChangeText={setMaxEmployees}
                keyboardType="numeric"
                error={errors.maxEmployees}
                maxLength={6}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subscription Details</Text>
              
              <View style={styles.tierContainer}>
                <Text style={styles.label}>Subscription Tier *</Text>
                <View style={styles.tierButtons}>
                  {subscriptionTiers.map((tier) => (
                    <TouchableOpacity
                      key={tier}
                      style={[
                        styles.tierButton,
                        subscriptionTier === tier && styles.tierButtonSelected
                      ]}
                      onPress={() => setSubscriptionTier(tier)}
                    >
                      <Text style={[
                        styles.tierButtonText,
                        subscriptionTier === tier && styles.tierButtonTextSelected
                      ]}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Input
                    label="Subscription Months *"
                    placeholder="Months"
                    value={subscriptionMonths}
                    onChangeText={setSubscriptionMonths}
                    keyboardType="numeric"
                    error={errors.subscriptionMonths}
                    maxLength={3}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Input
                    label="Subscription Days *"
                    placeholder="Days"
                    value={subscriptionDays}
                    onChangeText={setSubscriptionDays}
                    keyboardType="numeric"
                    error={errors.subscriptionDays}
                    maxLength={3}
                  />
                </View>
              </View>

              <View style={styles.regionContainer}>
                <Text style={styles.label}>Data Region *</Text>
                <View style={styles.regionButtons}>
                  {dataRegions.map((region) => (
                    <TouchableOpacity
                      key={region}
                      style={[
                        styles.regionButton,
                        dataRegion === region && styles.regionButtonSelected
                      ]}
                      onPress={() => setDataRegion(region)}
                    >
                      <Text style={[
                        styles.regionButtonText,
                        dataRegion === region && styles.regionButtonTextSelected
                      ]}>
                        {region}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Departments</Text>
              <Text style={styles.sectionSubtitle}>
                Select additional departments for your company. Administration is automatically created for the owner.
              </Text>
              
              <View style={styles.departmentsContainer}>
                {departments.map(renderDepartmentItem)}
              </View>
            </View>

            <Button
              title={loading ? "Creating Company..." : "Create Company"}
              onPress={handleCreateCompany}
              loading={loading}
              disabled={loading}
              fullWidth
              style={styles.createButton}
              size="large"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Code Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TouchableOpacity
                onPress={() => setShowCountryPicker(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={getFontSize(24)} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.countryList}>
              {countryCodes.map(renderCountryCodeItem)}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    minWidth: wp('12%'),
    minHeight: hp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  placeholder: {
    width: wp('10%'),
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp('2%'),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('8%'),
  },
  section: {
    marginBottom: hp('4%'),
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: hp('2%'),
  },
  sectionSubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: hp('2%'),
    lineHeight: theme.typography.body.lineHeight,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  phoneContainer: {
    marginBottom: hp('2%'),
    width: '100%',
  },
  label: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: hp('1%'),
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: wp('2%'),
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    minWidth: wp('25%'),
    minHeight: hp('6%'),
  },
  countryCodeText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginRight: wp('2%'),
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    marginTop: hp('0.5%'),
  },
  tierContainer: {
    marginBottom: hp('2%'),
  },
  tierButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp('2%'),
  },
  tierButton: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: wp('20%'),
  },
  tierButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tierButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  tierButtonTextSelected: {
    color: '#FFFFFF',
  },
  regionContainer: {
    marginTop: hp('2%'),
  },
  regionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp('2%'),
  },
  regionButton: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  regionButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  regionButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: '500',
  },
  regionButtonTextSelected: {
    color: '#FFFFFF',
  },
  departmentsContainer: {
    gap: hp('1%'),
  },
  departmentItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: wp('4%'),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  departmentItemSelected: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
  },
  departmentItemDisabled: {
    backgroundColor: `${theme.colors.border}20`,
    borderColor: theme.colors.border,
  },
  departmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  departmentInfo: {
    flex: 1,
    marginRight: wp('2%'),
  },
  departmentName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: hp('0.5%'),
  },
  departmentNameSelected: {
    color: theme.colors.primary,
  },
  departmentNameDisabled: {
    color: theme.colors.textSecondary,
  },
  departmentDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.caption.lineHeight,
  },
  checkbox: {
    width: wp('6%'),
    height: wp('6%'),
    borderRadius: wp('1.5%'),
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxAutoCreated: {
    backgroundColor: 'transparent',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  disabledNote: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: hp('1%'),
  },
  createButton: {
    marginTop: hp('2%'),
  },
  // Country Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: hp('70%'),
    minHeight: hp('30%'),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalCloseButton: {
    padding: wp('2%'),
    minWidth: wp('12%'),
    minHeight: hp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryList: {
    maxHeight: hp('60%'),
    paddingHorizontal: wp('4%'),
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.border}50`,
  },
  countryItemSelected: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  countryFlag: {
    fontSize: wp('6%'),
    marginRight: wp('3%'),
    width: wp('8%'),
  },
  countryName: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  countryCode: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});

export default AddCompanyScreen;