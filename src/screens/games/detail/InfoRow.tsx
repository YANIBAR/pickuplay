import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Icon } from '@components';
import { COLORS } from '@constants';

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  isAddress?: boolean;
}

export default function InfoRow({ icon, label, value, isAddress }: InfoRowProps) {
  const handleGetDirections = () => {
    const address = encodeURIComponent(value);
    const url = Platform.OS === 'ios'
      ? `maps://app?daddr=${address}`
      : `google.navigation:q=${address}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${address}`);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Icon type="materialCommunityIcons" name={icon as any} size={24} color={COLORS.secondary} />
      <View style={styles.textContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          
        </View>
        <Text style={styles.value}>{value} 
        {isAddress && (
            <TouchableOpacity onPress={handleGetDirections}>
              <Icon type="materialCommunityIcons" name="directions" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#000',
    marginTop: 2,
  },
});