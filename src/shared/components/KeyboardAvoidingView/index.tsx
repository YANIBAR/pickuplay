import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface KeyboardAvoidingViewProps {
  children: ReactNode;
}

const KeyboardView: React.FC<KeyboardAvoidingViewProps> = ({ children }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 } as StyleProp<ViewStyle>}>
      {children}
    </KeyboardAvoidingView>
  );
};

export default KeyboardView;
