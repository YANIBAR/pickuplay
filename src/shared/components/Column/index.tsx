import React, { FC, ReactNode } from 'react';
import { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { View } from '@components';
import styles from './styles';

interface ColumnProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

const Row: FC<ColumnProps> = ({ style, children, ...rest }) => {
  return (
    <View style={[styles.column, style]} {...rest}>
      {children}
    </View>
  );
};

export default Row;
