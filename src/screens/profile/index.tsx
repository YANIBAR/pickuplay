import { View, Text, Alert, ImageSourcePropType, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { COLORS, SIZES, icons, images } from '@constants';
import { useNavigation } from '@react-navigation/native';
import { Button, Icon, Header } from '@components';
import RBSheet from "react-native-raw-bottom-sheet";
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useUserData } from '@services/useUserData';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { JAVA_API } from '@env';
import { authenticatedApi } from '@services/api';
import GameCard, { Game } from './gameCard'; // ← adjust path to your gameCard location
import { toTitleCase } from '@utils/helpers';

type Nav = {
  navigate: (value: string) => void
}

const Profile = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const { userData, error, refreshUserData } = useUserData();
  const isLogged = userData?.id;
  const refRBSheet = useRef<any>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // ─── Games state ───────────────────────────────────────────────
  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [showAllGames, setShowAllGames] = useState(false);
  const GAMES_PREVIEW = 3;

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
  // ──────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    try {
      const keysToRemove = [
        'access_token', 'id', 'firstName', 'lastName', 'email',
        'phone', 'role', 'preferredLanguage', 'profileImage', 'gameId',
      ];
      await AsyncStorage.multiRemove(keysToRemove);
      await refreshUserData();
      setLogoutModalVisible(false);
      refRBSheet.current?.close();
      navigate("login");
    } catch (e) {
      console.error('Failed to log out', e);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const renderHeader = () => (
    <TouchableOpacity style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <Text style={[styles.headerTitle, { color: COLORS.grayscale900 }]}>Profile</Text>
      </View>
      <TouchableOpacity onPress={() => navigate("setting")}>
        <Image
          source={icons.settingOutline}
          style={[styles.headerIcon, { tintColor: COLORS.grayscale900 }]}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  useEffect(() => {
    getProfilePicture();
    fetchGames();
  }, []);

  const getProfilePicture = async () => {
    const token = await AsyncStorage.getItem('access_token');

    const response = await fetch(`${JAVA_API}profile/image`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const blob = await response.blob();

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result); // "data:image/jpeg;base64,..."
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    setSelectedImage(base64);
  };

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
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const data = await response.json();
      setSelectedImage(file.uri);
      Alert.alert('Success', data.message);
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Upload failed');
    }
  };

  const handleImagePicker = () => {
    Alert.alert('Select Image', 'Choose how to select an image', [
      { text: 'Camera', onPress: () => launchCameraForImage() },
      { text: 'Photo Library', onPress: () => launchGalleryForImage() },
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
    ]);
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
            source={selectedImage ? { uri: selectedImage} : images.idAvatar}
            resizeMode="contain"
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.pickImage} onPress={handleImagePicker}>
            <Icon type="materialCommunityIcons" name="pencil-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, { color: COLORS.grayscale900 }]}>
          {toTitleCase(userData?.firstName)} {toTitleCase(userData?.lastName)}
        </Text>
      </View>
  );

  // ─── Games section renderer ────────────────────────────────────
  const renderGames = () => {
    if (gamesLoading) {
      return (
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }
    if (gamesError) {
      return (
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <Text style={{ color: COLORS.red, marginBottom: 8 }}>{gamesError}</Text>
          <TouchableOpacity onPress={fetchGames}>
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Try Again</Text>
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
            You have no activity yet.{' '}
            <Text style={styles.emptyBold}>
              Check back here once you play your first game. ⚽
            </Text>
          </Text>
        </View>
      );
    }
    const visibleGames = showAllGames ? games : games.slice(0, GAMES_PREVIEW);
    const handleGamePress = (game: Game) => {
      navigate('gameDetail', { game });
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
              alignSelf: 'center',
              marginTop: 8,
              marginBottom: 4,
              paddingVertical: 10,
              paddingHorizontal: 32,
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: COLORS.primary,
            }}
          >
            <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 14 }}>
              Show More
            </Text>
          </TouchableOpacity>
        )}
      </>
    );
  };
  // ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.area]}>
      <ScrollView style={[styles.container]}>
        {renderHeader()}
        {isLogged ? (
          <View style={[styles.bottomContainer, { backgroundColor: COLORS.white }]}>
            {renderProfile()}

            {/* Stats summary */}
            <View style={styles.summaryViewContainer}>
              <View style={styles.viewItemContainer}>
                <View style={styles.viewIconContainer}>
                  <Image source={icons.sport2 as ImageSourcePropType} resizeMode='contain' style={styles.viewIcon} />
                </View>
                <Text style={[styles.viewTitle, { color: COLORS.grayscale900 }]}>{games.length} {t("games")}</Text>
                <Text style={[styles.viewSubtitle, { color: COLORS.grayscale700 }]}>{t("Joined")}</Text>
              </View>
              <View style={styles.viewItemContainer}>
                <View style={styles.viewIconContainer}>
                  <Image source={icons.timeCircle as ImageSourcePropType} resizeMode='contain' style={styles.viewIcon} />
                </View>
                <Text style={[styles.viewTitle, { color: COLORS.grayscale900 }]}>45.5 hr</Text>
                <Text style={[styles.viewSubtitle, { color: COLORS.grayscale700 }]}>{t("Played")}</Text>
              </View>
              <View style={styles.viewItemContainer}>
                <View style={styles.viewIconContainer}>
                  <Image source={icons.fieldOutline as ImageSourcePropType} resizeMode='contain' style={{ height: 44, width: 44, tintColor: COLORS.primary }} />
                </View>
                <Text style={[styles.viewTitle, { color: COLORS.grayscale900 }]}>0 fields</Text>
                <Text style={[styles.viewSubtitle, { color: COLORS.grayscale700 }]}>rented</Text>
              </View>
            </View>


            {/* Organized Games */}
            <View style={styles.locationItemContainer}>
              <Text style={styles.sectionTitle}>Organized Games</Text>
              {renderGames()}
            </View>
          </View>
        ) : (
          <View style={[styles.bottomContainer, { backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 24 }]}>
            {/* Icon */}
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: COLORS.primary + '15',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
              <Image
                source={icons.user as ImageSourcePropType}
                resizeMode='contain'
                style={{ width: 40, height: 40, tintColor: COLORS.primary }}
              />
            </View>

            {/* Heading */}
            <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.grayscale900, marginBottom: 8, textAlign: 'center' }}>
              {t("You're not signed in")}
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.grayscale700, textAlign: 'center', marginBottom: 32, lineHeight: 20 }}>
              {t("Sign in to view your profile, stats, and organized games.")}
            </Text>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={() => navigate("login")}
              style={{
                width: '100%',
                backgroundColor: COLORS.primary,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '600' }}>
                {t("Sign In")}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: COLORS.grayscale700, fontSize: 14 }}>
                {t("Don't have an account?")}{"  "}
              </Text>
              <TouchableOpacity onPress={() => navigate("register")}>
                <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}>
                  {t("Sign Up")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Logout Bottom Sheet */}
      <RBSheet
        ref={refRBSheet}
        closeOnPressMask={true}
        height={240}
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
          draggableIcon: { backgroundColor: COLORS.grayscale200, height: 4 },
          container: { borderTopRightRadius: 32, borderTopLeftRadius: 32, height: 240, backgroundColor: COLORS.white }
        }}
      >
        <Text style={styles.bottomTitle}>Logout</Text>
        <View style={[styles.separateLine, { backgroundColor: COLORS.grayscale200 }]} />
        <Text style={[styles.bottomSubtitle, { color: COLORS.black }]}>
          {t('logout.confirmation')}
        </Text>
        <View style={styles.bottomContainer}>
          <Button
            title={t('logout.confirm_button')}
            filled
            style={styles.logoutButton}
            onPress={handleLogout}
          />
          <Button
            title={t('c.cancel')}
            style={{
              width: (SIZES.width - 32) / 2 - 8,
              backgroundColor: COLORS.transparentPrimary,
              borderRadius: 32,
              borderColor: COLORS.transparentPrimary
            }}
            textColor={COLORS.primary}
            onPress={() => refRBSheet.current?.close()}
          />
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default Profile;