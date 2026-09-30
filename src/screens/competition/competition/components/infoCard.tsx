import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '@constants';
import { Icon } from '@components';
import styles from '../styles';

interface InfoCardProps {
  icon: string;
  label: string;
  value: string;
  accent?: boolean;
}


export default function InfoCard({ icon, label, value, accent }: InfoCardProps) {
  return (
    <View style={[styles.infoCard, accent && styles.infoCardAccent]}>
      <View style={styles.infoCardHeader}>
        <Icon
          type="materialCommunityIcons"
          name={icon as any}
          size={20}
          color={accent ? COLORS.white : COLORS.secondary}
        />
        <Text style={[styles.infoCardLabel, accent && styles.infoCardLabelAccent]}>{label}</Text>
      </View>
      <Text style={[styles.infoCardValue, accent && styles.infoCardValueAccent]}>
        {value}
      </Text>
    </View>
  );
}