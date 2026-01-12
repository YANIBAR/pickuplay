import React, { FC, ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

interface Props extends ViewProps {
  children?: ReactNode;
}

const Component: FC<Props> = ({ children, ...reset }) => (
  <View {...reset}>{children}</View>
);

export default Component;
