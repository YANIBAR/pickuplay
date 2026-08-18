/* eslint-disable react-native/no-inline-styles */
import React, { FC } from 'react';
import {
  StyleProp,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { ActivityIndicator, Icon } from '@components';
import { COLORS } from '@constants';
import styles from './styles';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  color?: string;
  icon?: string;
  size?: Size;
  textColor?: string;
  textSize?: number;
  filled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const Button: FC<ButtonProps> = ({
  title,
  color,
  icon,
  textColor,
  textSize,
  filled = false,
  loading = false,
  style,
  onPress,
  disabled,
  ...rest
}) => {
  const filledBgColor = color || COLORS.primary;
  const outlinedBgColor = COLORS.white;
  const bgColor = filled ? filledBgColor : outlinedBgColor;
  const resolvedTextColor = filled
    ? COLORS.white || textColor
    : textColor || COLORS.primary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bgColor },
        disabled && {
          opacity: 0.7,
          borderColor: '#CCCCCC',
          backgroundColor: COLORS.primary,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      {...rest}>
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.white} />
      ) : (
        
        <Text
          style={[
            styles.text,
            { color: resolvedTextColor, fontSize: textSize },
            disabled && { color: '#FFFFFF' },
          ]}>
          {title}
            <Icon type="ionicons" name={icon} color="white" style={{ marginRight: 8 }} />
          </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
