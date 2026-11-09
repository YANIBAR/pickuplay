import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform,  Clipboard, Alert } from 'react-native';
import { Icon } from '@components';
import { COLORS, FONTS } from '@constants';

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  isAddress?: boolean;
  isHost?: boolean;
  phoneNumber?: string;
  isLoggedIn?: boolean;
  onLoginPress?: () => void;
}

export default function InfoRow({
  icon,
  label,
  value,
  isAddress,
  isHost,
  phoneNumber,
  isLoggedIn = false,
  onLoginPress,
}: InfoRowProps) {
  const hideAddress = isAddress && !isLoggedIn;
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
    if (!phoneNumber) return;

    // WhatsApp expects digits only: no +, spaces, dashes, or parentheses
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi ${value}, I'd like to join your game!`);
    const appUrl = `whatsapp://send?phone=${cleanPhone}&text=${message}`;
    const webUrl = `https://wa.me/${cleanPhone}?text=${message}`;

      const supported = await Linking.canOpenURL(appUrl);
      await Linking.openURL(supported ? appUrl : webUrl);
  };
  const handleCopyAddress = () => {
    Clipboard.setString(value);
    Alert.alert('Copied!', 'Address copied to clipboard.');
  };

  return (
    <View style={styles.container}>
      <Icon
        type="materialCommunityIcons"
        name={icon as any}
        size={24}
        color={COLORS.secondary}
      />

      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>

        {hideAddress ? (
          <TouchableOpacity
            onPress={handleCopyAddress}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Icon
              type="materialCommunityIcons"
              name="lock-outline"
              size={18}
              color={COLORS.primary}
            />
            <Text style={[styles.value, { marginLeft: 6, color: COLORS.primary }]}>
              Log in to view the exact location
            </Text>
          </TouchableOpacity>
        ) : (
            <Text style={styles.value}>{value}</Text>
        )}
      </View>

      {isHost && phoneNumber && (
        <TouchableOpacity onPress={handleGetWhatsapp}>
          <Icon
            type="materialCommunityIcons"
            name="whatsapp"
            size={28}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      )}

      {isAddress && isLoggedIn && (
        <>
          <TouchableOpacity
            onPress={handleCopyAddress}
            activeOpacity={0.6}
            style={{ padding: 8 }}
          >
            <Icon
              type="materialCommunityIcons"
              name="content-copy"
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
            <TouchableOpacity onPress={handleGetDirections}>
              <Icon
                type="materialCommunityIcons"
                name="directions"
                size={28}
                color={COLORS.primary}
              />
            </TouchableOpacity>
        </>
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