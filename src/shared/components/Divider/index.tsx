/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View } from '@components';
import styles from './styles';

interface Props {
  color?: string;
  size?: number;
  margin?: number;
  transparent?: boolean;
}

const Component: React.FC<Props> = ({
  size = 1,
  color = '#eee',
  margin = 0,
  transparent,
}: Props) => {
  return (
    <View
      style={[
        styles.divider,
        {
          height: size,
          backgroundColor: color,
          marginVertical: margin,
        },
        transparent && { backgroundColor: 'transparent' },
      ]}
    />
  );
};

export default Component;
