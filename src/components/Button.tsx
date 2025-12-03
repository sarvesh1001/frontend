import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { theme } from '../styles/theme';
import { getFontSize, hp, wp } from '../utils/responsive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  icon,
  size = 'medium',
}) => {
  const getButtonStyle = () => {
    const base = [styles.button, fullWidth && styles.fullWidth];
    
    // Size adjustments
    const sizeStyle = {
      small: styles.buttonSmall,
      medium: styles.buttonMedium,
      large: styles.buttonLarge,
    }[size];
    
    // Variant styles
    const variantStyle = {
      primary: styles.primaryButton,
      secondary: styles.secondaryButton,
      outline: styles.outlineButton,
      danger: styles.dangerButton,
    }[variant];
    
    return [...base, sizeStyle, variantStyle];
  };

  const getTextStyle = () => {
    const variantText = {
      primary: styles.primaryText,
      secondary: styles.secondaryText,
      outline: styles.outlineText,
      danger: styles.dangerText,
    }[variant];
    
    const sizeText = {
      small: styles.textSmall,
      medium: styles.textMedium,
      large: styles.textLarge,
    }[size];
    
    return [styles.buttonText, sizeText, variantText];
  };

  const getButtonHeight = () => {
    return {
      small: hp('5%'),
      medium: Platform.OS === 'ios' ? 48 : 52,
      large: hp('7%'),
    }[size];
  };

  return (
    <TouchableOpacity
      style={[
        ...getButtonStyle(),
        { minHeight: getButtonHeight() },
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? theme.colors.primary : '#FFFFFF'} 
          size="small" 
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && (
            <Ionicons 
              name={icon as any} 
              size={getFontSize(20)} 
              color={disabled ? theme.colors.textSecondary : variant === 'outline' ? theme.colors.primary : '#FFFFFF'} 
              style={styles.icon} 
            />
          )}
          <Text style={[
            ...getTextStyle(),
            disabled && styles.disabledText,
          ]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: wp('6%'),
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  buttonSmall: {
    paddingVertical: hp('1%'),
  },
  buttonMedium: {
    paddingVertical: hp('1.5%'),
  },
  buttonLarge: {
    paddingVertical: hp('2%'),
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  dangerButton: {
    backgroundColor: theme.colors.error,
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
    borderColor: theme.colors.border,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: wp('2%'),
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: getFontSize(14),
  },
  textMedium: {
    fontSize: getFontSize(16),
  },
  textLarge: {
    fontSize: getFontSize(18),
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: theme.colors.primary,
  },
  dangerText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
});

export default Button;