import React from 'react';
import { View, Text, Switch } from 'react-native';
import { COLORS } from '@constants';
import { Icon } from '@components';
import styles from '../styles';

interface ToggleRowProps {
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}

export default function ToggleRow({ icon, label, description, value, onToggle }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={[styles.toggleIconWrap, value && styles.toggleIconWrapActive]}>
        <Icon
          type="materialCommunityIcons"
          name={icon as any}
          size={20}
          color={value ? COLORS.primary : COLORS.gray3}
        />
      </View>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.grayscale300, true: `${COLORS.primary}55` }}
        thumbColor={value ? COLORS.primary : COLORS.gray3}
      />
    </View>
  );
}