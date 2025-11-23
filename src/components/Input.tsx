import React, { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../styles/theme';
import { hp, wp } from '../utils/responsive';

export interface InputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  error?: string;
  maxLength?: number;
  editable?: boolean;
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
    },
    ref
  ) => {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}

        <TextInput
          ref={ref} // <-- forward the ref here
          style={[
            styles.input,
            error && styles.inputError,
            !editable && styles.inputDisabled,
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
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
    marginBottom: hp('1%'),
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    fontSize: theme.typography.body.fontSize,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
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
    fontSize: theme.typography.caption.fontSize,
    marginTop: hp('0.5%'),
  },
});
