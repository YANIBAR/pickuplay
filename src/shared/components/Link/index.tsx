import React, { ReactNode, useCallback } from 'react';
import { Linking, StyleProp, TextStyle, TouchableOpacity } from 'react-native';
import { Text } from '@components';
import styles from './styles';

interface LinkProps {
  href: string;
  title?: string;
  style?: StyleProp<TextStyle>;
  children?: ReactNode;
}

const Link: React.FC<LinkProps> = ({
  href,
  title,
  style,
  ...rest
}: LinkProps) => {
  const onPress = useCallback(async () => {
    await Linking.openURL(href);
  }, [href]);

  return (
    <TouchableOpacity style={styles.link} onPress={onPress} {...rest}>
      {title && <Text style={[styles.title, style]}>{title}</Text>}
    </TouchableOpacity>
  );
};

export default Link;
