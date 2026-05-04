import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { Text, View } from '@components';
import { COLORS, icons } from '@constants';
import moment from 'moment';
import styles from './styles';
import { NavigationProp, useNavigation } from '@react-navigation/native';

type NotificationCardProps = {
  title: string;
  body: string;
  date: string | Date;
  type: string;
  isNew: boolean;
  screen: string;
  attributes: string;
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  body,
  date,
  type,
  isNew,
  screen,
  attributes,
}) => {

  const navigation = useNavigation<NavigationProp<any>>();
  const getIcon = (type: NotificationCardProps['type']) => {
    switch (type) {
      case 'Security':
        return icons.security;
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
      <TouchableOpacity
        onPress={() => navigation.navigate(
          screen,
          attributes
        )}
        style={styles.headerContainer}
      >
        
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
              {moment(date).format('DD/MM/YYYY')} | {moment(date).format('h:mma')}
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
        {body}
      </Text>
    </View>
  );
};

export default NotificationCard;
