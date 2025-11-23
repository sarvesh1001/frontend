import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';
import { hp, wp } from '../utils/responsive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle; // Add style prop
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  style, // Add style prop
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return [styles.button, styles.primaryButton, fullWidth && styles.fullWidth];
      case 'secondary':
        return [styles.button, styles.secondaryButton, fullWidth && styles.fullWidth];
      case 'outline':
        return [styles.button, styles.outlineButton, fullWidth && styles.fullWidth];
      default:
        return [styles.button, styles.primaryButton, fullWidth && styles.fullWidth];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        ...getButtonStyle(),
        disabled && styles.disabledButton,
        style, // Apply style prop
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? theme.colors.primary : '#FFFFFF'} 
          size="small" 
        />
      ) : (
        <Text style={[styles.buttonText, getTextStyle(), disabled && styles.disabledText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('6%'),
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp('6%'),
  },
  fullWidth: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
    borderColor: theme.colors.border,
  },
  buttonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
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
  disabledText: {
    color: theme.colors.textSecondary,
  },
});

export default Button;