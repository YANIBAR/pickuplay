import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
//import QRCode from 'react-native-qrcode-svg';
import { COLORS, images } from '@constants';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export type Membership = {
  id: string;
  name: string;
  city: string;
  expirationDate: string;
  accountNumber: string;
  type: string;
  status: string;
  membershipCode: string;
};
type MembershipCardProps = {
  membership: Membership;
  onPress: (membership: Membership) => void;
};
export default function MembershipCard({ membership, onPress }: MembershipCardProps) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  
  const colors = {
    ["kids"]: COLORS.primary,
    ["adults"]: COLORS.secondary,
    ["tourists"]: COLORS.third,
  };
  return (
    <TouchableOpacity 
      style={[styles.card, !membership.status && styles.inactif, { borderColor: colors[membership.type] }]} 
      onPress={() => navigation.navigate("activities", { membership })}
      disabled={!membership.status}
    >
      <View style={styles.cardContent}>
        <View style={styles.leftContent}>
          {/*<View style={styles.qrContainer}>
            membership.status ? (
              <View style={{ alignItems: 'center' }}>
                <QRCode
                  value={membership._id}
                  size={100}
                  backgroundColor="white"
                  color="#000"
                />
                <Text>{membership.membershipCode}</Text>
              </View>
            ) : (
            {membership.type === "Kids" ? (
              <Image 
                source={images.kids}
                style={styles.image}
              />
            ) : membership.type === "Tourists" ? (
              <Image 
                source={images.tourists}
                style={styles.image}
              />
            ) : (
              <Image 
                source={images.adult}
                style={styles.image}
              />
            )}
              
            )}
          </View>*/}
          <View style={styles.memberInfo}>
            <Text style={styles.name}>{membership.name} | {t(`membership.types.${membership.type.toLowerCase()}`)}</Text>
            <Text style={styles.details}>
              <Text style={styles.label}>{t('membership.city')}: </Text>
              {membership.city}
            </Text>
            <Text style={styles.details}>
              <Text style={styles.label}>{t('membership.type')}: </Text>
              {t(`membership.types.${membership.type.toLowerCase()}`)}
            </Text>
            <Text style={styles.details}>
              <Text style={styles.label}>{t('membership.valid_until')}: </Text>
              {new Date(membership.expirationDate).toLocaleDateString("fr-FR")}
            </Text>
            <Text style={styles.details}>
              <Text style={styles.label}>{t('membership.code')}: </Text>
              {membership.membershipCode}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 50,
    borderRightWidth: 6,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    flex: 1,
  },
  qrContainer: {
    marginRight: 16,
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  memberInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  accountNumber: {
    fontSize: 14,
    marginBottom: 2,
    color: '#666',
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  label: {
    fontWeight: '600',
    color: '#444',
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  typeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 8,
  },
  inactif: {
    opacity: 0.7,
  },
  image: {
    width: 110,
    height: 110
  },
  historyText: {
    marginLeft: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  }
});