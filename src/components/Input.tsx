import React, { forwardRef } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle
} from 'react-native';
import { theme } from '../styles/theme';
import { getFontSize, hp, wp } from '../utils/responsive';

export interface InputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  error?: string;
  maxLength?: number;
  editable?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  multiline?: boolean;
  numberOfLines?: number;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      secureTextEntry = false,
      keyboardType = 'default',
      error,
      maxLength,
      editable = true,
      style,
      inputStyle,
      multiline = false,
      numberOfLines = 1,
    },
    ref
  ) => {
    return (
      <View style={[styles.container, style]}>
        {label && <Text style={styles.label}>{label}</Text>}

        <TextInput
          ref={ref}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            error && styles.inputError,
            !editable && styles.inputDisabled,
            inputStyle,
            numberOfLines > 1 && { height: hp('6%') * numberOfLines },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={editable}
          autoCapitalize="none"
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          textAlignVertical={multiline ? 'top' : 'center'}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

export default Input;

const styles = StyleSheet.create({
  container: {
    marginBottom: hp('2%'),
    width: '100%',
  },
  label: {
    fontSize: getFontSize(14),
    color: theme.colors.text,
    marginBottom: hp('1%'),
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: wp('4%'),
    paddingVertical: Platform.OS === 'ios' ? hp('1.8%') : hp('1.5%'),
    fontSize: getFontSize(16),
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    minHeight: hp('6%'),
  },
  multilineInput: {
    minHeight: hp('12%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('2%'),
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputDisabled: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.textSecondary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: getFontSize(12),
    marginTop: hp('0.5%'),
  },
});