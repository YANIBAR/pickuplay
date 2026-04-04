import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { Text, View } from '@components';
import { COLORS, icons } from '@constants';
import moment from 'moment';
import styles from './styles';

type NotificationCardProps = {
  title: string;
  description: string;
  date: string | Date;
  type: string;
  isNew: boolean;
  onPress: () => void;
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  description,
  date,
  type,
  isNew,
  onPress,
}) => {
  const getIcon = (type: NotificationCardProps['type']) => {
    switch (type) {
      case 'Security':
        return icons.squareCheckbox2;
      case 'Card':
        return icons.ticket;
      case 'Payment':
        return icons.wallet2;
      case 'Reminder':
        return icons.bell;
      case 'Update':
        return icons.infoSquare2;
      case 'Account':
        return icons.profile2;
      default:
        return icons.squareCheckbox2;
    }
  };

  const getIconBackgroundColor = (type: NotificationCardProps['type']) => {
    switch (type) {
      case 'Security':
        return COLORS.transparentSecurity;
      case 'Card':
        return COLORS.transparentCard;
      case 'Payment':
        return COLORS.transparentPayment;
      case 'Update':
        return COLORS.transparentUpdate;
      case 'Account':
        return COLORS.transparentAccount;
      default:
        return COLORS.transparentPrimary;
    }
  };

  const getIconColor = (type: NotificationCardProps['type']) => {
    switch (type) {
      case 'Security':
        return COLORS.security;
      case 'Card':
        return COLORS.card;
      case 'Payment':
        return COLORS.payment;
      case 'Update':
        return COLORS.update;
      case 'Account':
        return COLORS.account;
      default:
        return COLORS.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isNew ? COLORS.white : COLORS.transparentPrimary }]}>
      <TouchableOpacity onPress={onPress} style={styles.headerContainer}>
        <View style={styles.headerLeftContainer}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getIconBackgroundColor(type) },
            ]}>
            <Image
              source={getIcon(type)}
              resizeMode="contain"
              style={[styles.icon, { tintColor: getIconColor(type) }]}
            />
          </View>
          <View>
            <Text
              style={[
                styles.title,
                {
                  color: COLORS.grayscale900,
                },
              ]}>
              {title} 
            </Text>
            <Text
              style={[
                styles.date,
                {
                  color: COLORS.grayscale700,
                },
              ]}>
              {moment(date).format('DD/MM/YYYY')} | {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
        {isNew && (
          <View style={styles.headerRightContainer}>
            <Text style={styles.headerText}>New</Text>
          </View>
        )}
      </TouchableOpacity>
      <Text
        style={[
          styles.description,
          {
            color: COLORS.grayscale700,
          },
        ]}>
        {description}
      </Text>
    </View>
  );
};

export default NotificationCard;
