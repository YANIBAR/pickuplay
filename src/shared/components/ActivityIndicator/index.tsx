import React, { FC } from 'react';
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  ColorValue,
} from 'react-native';
import { COLORS } from '@constants';

interface IndicatorProps extends ActivityIndicatorProps {
  color?: ColorValue;
  size?: number | 'small' | 'large';
}

const Indicator: FC<IndicatorProps> = ({
  size,
  color = COLORS.white,
  ...rest
}) => <ActivityIndicator size={size} color={color} {...rest} />;

export default Indicator;
