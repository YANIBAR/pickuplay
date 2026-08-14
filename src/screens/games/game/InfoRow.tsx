import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Icon } from '@components';
import { COLORS, FONTS } from '@constants';

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  isAddress?: boolean;
  isHost?: boolean;
}

export default function InfoRow({ icon, label, value, isAddress, isHost }: InfoRowProps) {
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
  const handleGetWhatsapp = async () => {
    const phoneNumber = '18162102864'; // Include country code
    const message = encodeURIComponent(`Join the game: ${label} at ${value}`);

    const appUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
    const webUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    try {
      const supported = await Linking.canOpenURL(appUrl);

      if (supported) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('Unable to open WhatsApp', error);
    }
  };

  return (
    <View style={styles.container}>
      <Icon type="materialCommunityIcons" name={icon as any} size={24} color={COLORS.secondary} />
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {isHost && (
        <TouchableOpacity onPress={handleGetWhatsapp}>
            <Icon type="materialCommunityIcons" name="whatsapp" size={28} color={COLORS.primary}/>
        </TouchableOpacity>
      )}
      {isAddress && (
        <TouchableOpacity onPress={handleGetDirections}>
            <Icon type="materialCommunityIcons" name="directions" size={28} color={COLORS.primary}/>
        </TouchableOpacity>
      )}
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
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    color: COLORS.black,
  },
  value: {
    fontSize: 16,
    color: COLORS.gray3,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});