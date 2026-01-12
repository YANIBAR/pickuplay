import React, { FC, ReactNode } from 'react';
import { Image, StyleProp, TouchableOpacity, ViewStyle } from 'react-native';
import { isEmpty } from 'lodash';
import { Icon, Text, View } from '@components';
import { COLORS, icons } from '@constants';
import styles from './styles';

interface CheckboxProps {
  checked?: boolean;
  disabled?: boolean;
  render?: () => ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  onValueChange: () => void;
  errorText?: string;
}

const Checkbox: FC<CheckboxProps> = ({
  render,
  checked,
  disabled,
  style,
  containerStyle,
  onValueChange,
  errorText,
}) => {
  return (
    <View style={{ flexDirection: 'column' }}>
      <View style={[styles.container, containerStyle]}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            style,
            !isEmpty(errorText) && [{ borderColor: COLORS.red }],
            disabled && [{ opacity: 0.5 }],
          ]}
          activeOpacity={1}
          onPress={onValueChange}>
          {checked && (
            <Image
              source={icons.squareCheckbox}
              style={styles.squareCheckbox}
            />
          )}
        </TouchableOpacity>
        <View>{render?.()}</View>
      </View>
      {errorText && (
        <View style={styles.errorContainer}>
          <Icon
            type="feather"
            name="info"
            color={COLORS.error}
            size={12}
            style={{ marginRight: 5 }}
          />
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      )}
    </View>
  );
};

export default Checkbox;
