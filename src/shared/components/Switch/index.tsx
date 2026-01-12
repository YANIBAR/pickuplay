/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  StyleProp,
  Switch,
  SwitchProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { Text, View } from '@components';
import styles from './styles';

interface Props extends SwitchProps {
  title?: string;
  value?: boolean;
  disabled?: boolean;
  onChange?: () => void;
  textStyle?: StyleProp<TextStyle>;
  disabledStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

const Component: React.FC<Props> = ({
  title,
  value,
  disabled,
  onChange,
  textStyle,
  disabledStyle,
  containerStyle,
  ...props
}: Props) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Switch
        value={value}
        onValueChange={onChange}
        ios_backgroundColor="#3e3e3e"
        trackColor={{ false: '#767577' }}
        style={[disabled && [{ opacity: 0.5 }, disabledStyle]]}
        thumbColor={value ? '#0d6efd' : '#f4f3f4'}
        {...props}
      />
      {title && (
        <Text style={[styles.title, textStyle]} onPress={onChange}>
          {title}
        </Text>
      )}
    </View>
  );
};

export default Component;
