import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { COLORS, FONTS, SIZES, icons, images } from '@constants';
import { useNavigation } from '@react-navigation/native';
import { Button, Icon, Header, NotSignedInView } from '@components';
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useUserData } from '@services/useUserData';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { JAVA_API } from '@env';
import { authenticatedApi } from '@services/api';
import GameCard, { Game } from './gameCard';

type Nav = {
  navigate: (value: string, params?: any) => void;
};

// ─── Main Profile Component ───────────────────────────────────────────────────

const Profile = ({ route }: { route: any }) => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const userId = route.params.userId || {};
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = `${JAVA_API}profile/${userId}/image`;



  const fetchProfileInfo = async () => {
    try {
      setProfileLoading(true);
      const response = await authenticatedApi.get(`profile/${userId}`);
      const data = response.result?.data ?? response.data ?? null;
      setProfileInfo(data);

      console.log('Fetched profile infoss:', profileInfo);
    } catch (err: any) {
      console.error('Error fetching profile info:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
      fetchProfileInfo();
  }, [userId]);

  const renderProfile = () => (
    <View style={styles.profileContainer}>
      <View style={styles.avatarContainer}>
        <Image
          source={imageError || !userId ? images.avatar : { uri: imageUrl }}
          onError={() => setImageError(true)}
          resizeMode="center"
          style={styles.avatar}
        />
      </View>
      <Text style={[FONTS.h3]}>
        {profileInfo?.firstname}{' '}
        {profileInfo?.lastname}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.area]}>
      <ScrollView style={[styles.container]}>
        <Header title={t('menu.user')} />

          <View style={[styles.bottomContainer, { backgroundColor: COLORS.white }]}>

            {renderProfile()}

            {/* Stats */}
            <View style={styles.summaryViewContainer}>
              <View style={styles.viewItemContainer}>
                <View style={styles.viewIconContainer}>
                  <Image source={icons.sport2} resizeMode="contain" style={styles.viewIcon} />
                </View>
                <Text style={[styles.viewTitle, { color: COLORS.grayscale900, fontWeight: '700' }]}>
                  {profileInfo ? profileInfo.gameStatistics.gameCount : 0} {t('menu.games')}
                </Text>
                <Text style={[styles.viewSubtitle, { color: COLORS.grayscale700 }]}>
                  {t('profile.joined')}
                </Text>
              </View>

              <View style={styles.viewItemContainer}>
                <View style={styles.viewIconContainer}>
                  <Image source={icons.timeCircle} resizeMode="contain" style={styles.viewIcon} />
                </View>
                <Text style={[styles.viewTitle, { color: COLORS.grayscale900, fontWeight: '700' }]}>
                  {profileInfo ? Math.floor(profileInfo.gameStatistics.totalMinutes / 60) : 0} hr
                </Text>
                <Text style={[styles.viewSubtitle, { color: COLORS.grayscale700 }]}>
                  {t('profile.played')}
                </Text>
              </View>

              <View style={styles.viewItemContainer}>
                <View style={styles.viewIconContainer}>
                  <Image
                    source={icons.fieldOutline}
                    resizeMode="contain"
                    style={{ height: 44, width: 44, tintColor: COLORS.primary }}
                  />
                </View>
                <Text style={[styles.viewTitle, { color: COLORS.grayscale900, fontWeight: '700' }]}>
                  0 {t('profile.fields')}
                </Text>
                <Text style={[styles.viewSubtitle, { color: COLORS.grayscale700 }]}>
                  {t('profile.rented')}
                </Text>
              </View>
            </View>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile; 