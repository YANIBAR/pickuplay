import { View, Text, Alert, ImageSourcePropType, TouchableOpacity, Image, ActivityIndicator, PermissionsAndroid, Platform } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { COLORS, FONTS, SIZES, icons, images } from '@constants';
import { useNavigation } from '@react-navigation/native';
import { Button, Icon, Header, NotSignedInView } from '@components';
import RBSheet from "react-native-raw-bottom-sheet";
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useUserData } from '@services/useUserData';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { JAVA_API } from '@env';
import { authenticatedApi } from '@services/api';
import GameCard, { Game } from './gameCard'; // ← adjust path to your gameCard location
import { getCurrentCity, toTitleCase } from '@utils/helpers';
import Geolocation from '@react-native-community/geolocation';
import { isStoredTokenExpired } from '@utils/api/auth';

type Nav = {
  navigate: (value: string) => void
}

const Profile = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const { userData, error, refreshUserData } = useUserData();
  const [isLogged, setIsLogged] = useState(false);
  const refRBSheet = useRef<any>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // ─── Games state ───────────────────────────────────────────────
  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [showAllGames, setShowAllGames] = useState(false);
  const GAMES_PREVIEW = 3;
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfileInfo = async () => {
    if (!userData?.id) return;
    try {
      setProfileLoading(true);
      const response = await authenticatedApi.get(`profile/${userData.id}`);
      const data = response.result?.data ?? response.data ?? null;
      setProfileInfo(data);
    } catch (err: any) {
      console.error('Error fetching profile info:', err);
    } finally {
      setProfileLoading(false);
    }
  };
  
  const fetchGames = async () => {
    try {
      setGamesLoading(true);
      setGamesError(null);
      const response = await authenticatedApi.get(`profile/games`);
      let gamesData = response.result?.data ?? response.data ?? [];
      if (!Array.isArray(gamesData)) gamesData = [];
      setGames(gamesData);
    } catch (err: any) {
      console.error('Error fetching games:', err);
      setGamesError('Failed to load games.');
    } finally {
      setGamesLoading(false);
    }
  };

  const renderHeader = () => (
    <TouchableOpacity style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <Text style={[styles.headerTitle, { color: COLORS.grayscale900 }]}>Profile</Text>
      </View>
      <TouchableOpacity onPress={() => navigate("setting")}>
        <Image
          source={icons.settings}
          style={[styles.headerIcon, { tintColor: COLORS.secondary }]}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
 
  useEffect(() => {
    const checkToken = async () => {
      const expired = await isStoredTokenExpired();
      setIsLogged(!expired); // ← also note the `!` — logged = NOT expired
    };

    checkToken();
    if(isLogged) {
      setSelectedImage(`${JAVA_API}profile/${userData?.id}/image`);
      fetchGames();
      //console.log(getCurrentCity());
      fetchProfileInfo();
    }
  }, [userData?.id]);

  const uploadImage = async (file: any) => {
  if (!file) return;

  const formData = new FormData();

  formData.append('picture', {
    uri: file.uri,
    name: file.fileName || 'default-image.jpg',
    type: file.type || 'image/jpeg',
  });

  try {
    const token = await AsyncStorage.getItem('access_token');

    const response = await fetch(`${JAVA_API}profile/upload-image`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      },
      body: formData,
    });

    if (!response.ok) throw new Error(`HTTP status ${response.status}`);

    const data = await response.json();

    setSelectedImage(file.uri);

    Alert.alert(
      t('profile.uploadSuccessTitle'),
      t('profile.uploadSuccessMessage')
    );

  } catch (error) {
    console.error('Upload failed:', error);

    Alert.alert(
      t('common.error'),
      t('profile.uploadFailed')
    );
  }
};

const handleImagePicker = () => {
  Alert.alert(
    t('profile.selectImageTitle'),
    t('profile.selectImageDescription'),
    [
      {
        text: t('profile.camera'),
        onPress: () => launchCameraForImage()
      },
      {
        text: t('profile.photoLibrary'),
        onPress: () => launchGalleryForImage()
      },
      {
        text: t('common.cancel'),
        onPress: () => {},
        style: 'cancel'
      },
    ]
  );
};

  const launchCameraForImage = () => {
    launchCamera({ mediaType: 'photo', cameraType: 'back', quality: 0.8 }, (response) => {
      if (response.assets?.[0]) {
        setSelectedImage(response.assets[0]);
        uploadImage(response.assets[0]);
      }
    });
  };

  const launchGalleryForImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, (response) => {
      if (response.assets?.[0]) {
        setSelectedImage(response.assets[0]);
        uploadImage(response.assets[0]);
      }
    });
  };
  
  const renderProfile = () => (
    <View style={styles.profileContainer}>
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: `${JAVA_API}profile/${userData?.id}/image` }}
          resizeMode="contain"
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.pickImage} onPress={handleImagePicker}>
          <Icon type="materialCommunityIcons" name="pencil-outline" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <Text style={[FONTS.h3]}>
        {profileInfo?.firstName ?? userData?.firstName}{" "}
        {profileInfo?.lastName ?? userData?.lastName}
      </Text>
    </View>
  );

  const renderGames = () => {
    if (gamesLoading) {
      return (
        <View style={{ alignItems: "center", paddingVertical: 24 }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }

    if (gamesError) {
      return (
        <View style={{ alignItems: "center", paddingVertical: 16 }}>
          <Text style={{ color: COLORS.red, marginBottom: 8 }}>{gamesError}</Text>

          <TouchableOpacity onPress={fetchGames}>
            <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
              {t("common.tryAgain")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (games.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconBg}>
            <Text style={styles.emptyIconText}>⚽</Text>
          </View>

          <Text style={styles.emptyText}>
            {t("profile.noActivity")}{" "}
            <Text style={styles.emptyBold}>
              {t("profile.firstGame")}
            </Text>
          </Text>
        </View>
      );
    }

    const visibleGames = showAllGames ? games : games.slice(0, GAMES_PREVIEW);

    const handleGamePress = (game: Game) => {
      navigate("gameDetail", { game });
    };

    return (
      <>
        {visibleGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPress={handleGamePress}
          />
        ))}

        {games.length > GAMES_PREVIEW && (
          <TouchableOpacity
            onPress={() => navigate("myGames")}
            style={{
              alignSelf: "center",
              marginTop: 8,
              marginBottom: 4,
              paddingVertical: 10,
              paddingHorizontal: 32,
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: COLORS.primary
            }}
          >
            <Text style={{ color: COLORS.primary, fontWeight: "600", fontSize: 14 }}>
              {t("common.showMore")}
            </Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.area]}>
      <ScrollView style={[styles.container]}>
        {renderHeader()}

        {isLogged ? (
          <View style={[styles.bottomContainer, { backgroundColor: COLORS.white }]}>

            {renderProfile()}

            {/* Stats */}
            <View style={styles.summaryViewContainer}>

              <View style={styles.viewItemContainer}>
                <View style={styles.viewIconContainer}>
                  <Image source={icons.sport2} resizeMode="contain" style={styles.viewIcon} />
                </View>

                <Text style={[styles.viewTitle, { color: COLORS.grayscale900, fontWeight: "700" }]}>
                  {profileInfo ? profileInfo.gameStatistics.gameCount : 0} {t("menu.games")}
                </Text>

                <Text style={[styles.viewSubtitle, { color: COLORS.grayscale700 }]}>
                  {t("profile.joined")}
                </Text>
              </View>

              <View style={styles.viewItemContainer}>
                <View style={styles.viewIconContainer}>
                  <Image source={icons.timeCircle} resizeMode="contain" style={styles.viewIcon} />
                </View>

                <Text style={[styles.viewTitle, { color: COLORS.grayscale900, fontWeight: "700" }]}>
                  {profileInfo ? Math.floor(profileInfo.gameStatistics.totalMinutes / 60) : 0} hr
                </Text>

                <Text style={[styles.viewSubtitle, { color: COLORS.grayscale700 }]}>
                  {t("profile.played")}
                </Text>
              </View>

              <View style={styles.viewItemContainer}>
                <View style={styles.viewIconContainer}>
                  <Image source={icons.fieldOutline} resizeMode="contain" style={{ height: 44, width: 44, tintColor: COLORS.primary }} />
                </View>

                <Text style={[styles.viewTitle, { color: COLORS.grayscale900, fontWeight: "700" }]}>
                  0 {t("profile.fields")}
                </Text>

                <Text style={[styles.viewSubtitle, { color: COLORS.grayscale700 }]}>
                  {t("profile.rented")}
                </Text>
              </View>

            </View>

            {/* Organized Games */}
            <View style={styles.locationItemContainer}>
              <Text style={styles.sectionTitle}>
                {t("profile.organizedGames")}
              </Text>

              {renderGames()}
            </View>

          </View>

        ) : (

          <View style={[styles.bottomContainer, {
            backgroundColor: COLORS.white,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 60,
            paddingHorizontal: 24
          }]}>

           <NotSignedInView
            heading="Sign in to join game"
            description="Access your upcoming and past sessions when signed in."
            containerStyle={{ flex: 1 }}
          />

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
  
};

export default Profile;