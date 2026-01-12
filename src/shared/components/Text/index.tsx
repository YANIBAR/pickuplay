import React, { FC, ReactNode } from 'react';
import {
  StyleProp,
  Text,
  TextProps,
  TextStyle,
  ColorValue,
} from 'react-native';
import styles from './styles';

type Size = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type Align = 'left' | 'right' | 'center' | 'justify';

interface Props extends TextProps {
  size?: Size;
  title?: string;
  color?: ColorValue;
  align?: Align;
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
}

export const Component: FC<Props> = ({
  title,
  style,
  size = 'h4',
  align,
  color,
  children,
  ...rest
}: Props) => (
  <Text
    style={[
      styles.text,
      styles[size],
      {
        color: color,
        textAlign: align,
      },
      style,
    ]}
    {...rest}>
    {children || title}
  </Text>
);

export default Component;
