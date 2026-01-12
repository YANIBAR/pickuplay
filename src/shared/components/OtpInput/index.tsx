import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import OtpInputs from 'react-native-otp-inputs';
import styles from './styles';

interface Props {
  digits: number;
  defaultValue?: string;
  secureTextEntry?: boolean;
  clearTextOnFocus?: boolean;
  onChange: (otpCode: string) => void;
  inputStyles?: StyleProp<ViewStyle>;
  inputContainerStyles?: StyleProp<ViewStyle>;
}

const Component: React.FC<Props> = ({
  digits,
  onChange,
  inputStyles,
  defaultValue,
  secureTextEntry,
  clearTextOnFocus,
  inputContainerStyles,
}: Props) => {
  // Add a handler function to filter input
  const handleInputChange = (code: string) => {
    // Convert to uppercase and filter to keep only uppercase letters and numbers
    const filteredCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    onChange(filteredCode);
  };

  return (
    <OtpInputs
      autoFocus={true}
      autofillFromClipboard
      handleChange={handleInputChange}
      numberOfInputs={digits}
      keyboardType="default" // Allow access to the full keyboard
      defaultValue={defaultValue}
      secureTextEntry={secureTextEntry}
      clearTextOnFocus={clearTextOnFocus}
      inputStyles={[styles.inputStyles, inputStyles]}
      style={[styles.container, inputContainerStyles]}
    />
  );
};

export default Component;
