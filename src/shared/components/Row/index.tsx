import React, { FC, ReactNode } from 'react';
import { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { View } from '@components';
import styles from './styles';

interface RowProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

const Row: FC<RowProps> = ({ style, children, ...rest }) => {
  return (
    <View style={[styles.row, style]} {...rest}>
      {children}
    </View>
  );
};

export default Row;
