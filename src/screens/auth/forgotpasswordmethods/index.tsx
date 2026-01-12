import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { COLORS, icons, illustrations } from '@constants';
import { useNavigation } from '@react-navigation/native';
import { Header, Button, View, Text } from '@components';
import styles from './styles';
import { useTranslation } from 'react-i18next';

type Nav = {
  navigate: (value: string) => void;
};

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const [selectedMethod, setSelectedMethod] = useState('sms');

  const handleMethodPress = (method: any) => {
    setSelectedMethod(method);
  };

  return (
  <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
    <View style={styles.container}>
      <Header title={t('passwordMethods.title')} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.passwordContainer}>
          <Image
            source={illustrations.password}
            resizeMode="contain"
            style={styles.password}
          />
        </View>
        <Text
          style={[
            styles.title,
            {
              color: COLORS.greyscale900,
            },
          ]}>
          {t('passwordMethods.subtitle')}
        </Text>
        <TouchableOpacity
          style={[
            styles.methodContainer,
            selectedMethod === 'sms' && {
              borderColor: COLORS.primary,
              borderWidth: 2,
            },
          ]}
          onPress={() => handleMethodPress('sms')}>
          <View style={styles.iconContainer}>
            <Image
              source={icons.chat}
              resizeMode="contain"
              style={styles.icon}
            />
          </View>
          <View>
            <Text style={styles.methodTitle}>{t('passwordMethods.viaSMS')}</Text>
            <Text
              style={[
                styles.methodSubtitle,
                {
                  color: COLORS.black,
                },
              ]}>
              +1 111 ******99
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.methodContainer,
            selectedMethod === 'email' && {
              borderColor: COLORS.primary,
              borderWidth: 2,
            },
          ]}
          onPress={() => handleMethodPress('email')}>
          <View style={styles.iconContainer}>
            <Image
              source={icons.email}
              resizeMode="contain"
              style={styles.icon}
            />
          </View>
          <View>
            <Text style={styles.methodTitle}>{t('passwordMethods.viaEmail')}</Text>
            <Text
              style={[
                styles.methodSubtitle,
                {
                  color: COLORS.black,
                },
              ]}>
              and***ley@yourdomain.com
            </Text>
          </View>
        </TouchableOpacity>
        <Button
          filled
          title={t('passwordMethods.continue')}
          style={styles.button}
          onPress={() =>
            navigate(
              selectedMethod === 'sms'
                ? 'forgotpasswordphone'
                : 'forgotpasswordemail',
            )
          }
        />
      </ScrollView>
    </View>
    </SafeAreaView>
  );
  
};

export default ForgotPassword;
