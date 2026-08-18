import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, View } from '@components';
import { COLORS, icons, images } from '@constants';
import styles from './styles';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Nav = {
  navigate: (value: string) => void;
};

const Welcome = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const [isLogged, setIsLogged] = useState(false);
  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return token;
    } catch (e) {
      console.error('Failed to fetch the token', e);
      return null;
    }
  };
  useEffect(() => {
    console.log("Welcome Screen Loaded");
    const checkLogin = async () => {
      const isLogged =  await getToken();
      if (isLogged) {
        setIsLogged(true);
      } 
    };
  
    checkLogin();
  }, []);

  const onPress = (): void => {
    AsyncStorage.setItem('hasLaunched', 'false');
  };
  return (
    <>
      <View style={[styles.container, { backgroundColor: COLORS.white }]}>
      {isLogged ? (
        <View style={styles.headerContainer}>
          <View style={styles.viewRight}>
            <TouchableOpacity
              onPress={() => navigate("notifications")}>
              <Image
                source={icons.notificationBell2}
                style={[styles.bellIcon, { tintColor: COLORS.grayscale900 }]}
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
        <Image source={images.homeLogo} resizeMode="contain" style={styles.logo} />
        <Text style={styles.title}>{t('welcome.title')}</Text>
        <Text style={styles.subtitle}>
          {t('welcome.subtitle')}
        </Text>
          <TouchableOpacity onPress={() => navigate('login')}>
            <Text style={styles.loginSubtitle}>Log In</Text>
          </TouchableOpacity>
        </View>
      <View style={styles.bottomContainer}>
        <Text
          style={[
            styles.bottomTitle,
            {
              color: COLORS.black,
            },
          ]}>
          
          {t('welcome.termOfUse')}
        </Text>
        <TouchableOpacity onPress={() => navigate("PrivacyPolicy")}>
          <Text
            style={[
              styles.bottomSubtitle,
              {
                color: COLORS.black,
              },
            ]}>
            {t('welcome.privacyPolicy')}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default Welcome;
