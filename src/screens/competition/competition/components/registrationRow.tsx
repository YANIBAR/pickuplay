import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles';

interface RegistrationRowProps {
  label: string;
  value: string;
}

export default function RegistrationRow({ label, value }: RegistrationRowProps) {
  return (
    <View style={styles.regRow}>
      <Text style={styles.regLabel}>{label}</Text>
      <Text style={styles.regValue}>{value}</Text>
    </View>
  );
}