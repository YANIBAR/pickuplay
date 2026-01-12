import React, { FC } from 'react';
import { View, Text } from '@components';
import { COLORS } from '@constants';
import styles from './styles';

interface OrSeparatorProps {
  text: string;
}

const OrSeparator: FC<OrSeparatorProps> = ({ text }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: COLORS.grayscale200 }]} />
      <Text style={[styles.orText, { color: COLORS.black }]}>{text}</Text>
      <View style={[styles.line, { backgroundColor: COLORS.grayscale200 }]} />
    </View>
  );
};

export default OrSeparator;
