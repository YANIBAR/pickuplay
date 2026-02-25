import { View, Text, Share, StyleSheet, TouchableOpacity, Image, Alert, ImageSourcePropType, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { COLORS, SIZES, icons, images, screens } from '@constants';
import { useNavigation } from '@react-navigation/native';
import { SettingsItem, Button, MoreModal, Icon, Header, Modal } from '@components';
import RBSheet from "react-native-raw-bottom-sheet";
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';
import { useUserData } from '@services/useUserData';
import { calendarFormat } from 'moment';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

type Nav = {
  navigate: (value: string) => void
}
// Mock joined games — replace with real API data
const JOINED_GAMES = [
  {
    id: '1',
    title: 'Evening Match',
    facility: 'Hay Riad Field',
    date: 'Mon, Jun 10',
    time: '19:00',
    players: 8,
    sportType: 1,
    maxPlayers: 10,
  },
  {
    id: '2',
    title: 'Weekend Kickoff',
    facility: 'Agdal Sports Park',
    date: 'Sat, Jun 15',
    time: '10:00',
    players: 10,
    sportType: 7,
    maxPlayers: 10,
  },
  {
    id: '3',
    title: 'Morning League',
    facility: 'Souissi Complex',
    date: 'Sun, Jun 16',
    time: '08:30',
    players: 6,
    sportType: 2,
    maxPlayers: 10,
  },
  {
    id: '4',
    title: 'Friday Night Game',
    facility: 'Maârif Arena',
    date: 'Fri, Jun 21',
    time: '21:00',
    players: 9,
    sportType: 4,
    maxPlayers: 10,
  },
  {
    id: '5',
    title: 'Champions Cup',
    facility: 'Hay Mohammadi',
    date: 'Sat, Jun 22',
    time: '17:00',
    players: 10,
    sportType: 1,
    maxPlayers: 10,
  },
];
const Profile = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const [directionModalVisible, setDirectionModalVisible] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const { userData, error, refreshUserData } = useUserData();
  const isLogged = !userData?.id;
  const refRBSheet = useRef<any>(null);


  const handleDropdownSelect = (item: any) => {
    setModalVisible(false);

    // Perform actions based on the selected item
    switch (item.value) {
      case 'share':
        handleInvite();
        break;
      case 'help':
        navigate('HelpCenter');
        break;
      case 'privacy':
        navigate('PrivacyPolicy');
        break;
      case 'terms':
        navigate('terms');
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    setModalVisible(false);
  };


  const getGameIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      1: 'soccer',
      2: 'basketball',
      3: 'volleyball',
      5: 'tennis',
      4: 'hockey-sticks',
      6: 'table-tennis',
      7: 'football'
    };
    return iconMap[type] || 'sports';
  };
const handleInvite = async () => {
    try {
      const userName = userData?.firstName ? `${userData.firstName}` : 'Your friend';
      
      const referralMessage = `🎉 ${userName} invited you to MGO Pass!\n\n${inviteMessage}\n\n🎟️ Get admission to a variety of attractions in Casanlanca!\n\n💰 🌐 Learn more: https://pickuplay.com/#how-it-works?id=${userData?.id}\n📱 Download the app and start exploring!`;
      
      const result = await Share.share({
        message: referralMessage,
        url: 'https://pickuplay.com/',
        title: 'MGO Pass - Make $5 Refer a Friend',
      });

      if (result.action === Share.sharedAction) {
        console.log('Success', 'Referral link shared successfully!');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dialog dismissed');
      }
    } catch (error) {
      console.error('Error sharing referral:', error);
      Alert.alert('Error', 'An error occurred while sharing the referral link.');
    }
  };
  const handleLogout = async () => {
    try {
      const keysToRemove = [
        'access_token',
        'id',
        'firstName',
        'lastName',
        'email',
        'phone',
        'role',
        'preferredLanguage',
        'profileImage',
        'gameId',
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      
      // Refresh user data after logout
      await refreshUserData();
      
      setLogoutModalVisible(false);
      refRBSheet.current?.close();
      navigate("login");
    } catch (e) {
      console.error('Failed to log out', e);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };
  /**
   * render header
   */
  const renderHeader = () => {
    return (
      <TouchableOpacity style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Image
            source={icons.back as ImageSourcePropType}
            resizeMode="contain"
            style={styles.backIcon}
          />
          <Text style={[styles.headerTitle, {
            color: COLORS.greyscale900
          }]}>Profile</Text>
        </View>
        <TouchableOpacity onPress={() => navigate("setting")}>
          <Image
            source={icons.settingOutline}
            style={[styles.headerIcon, {
              tintColor: COLORS.greyscale900
            }]}
          />
        </TouchableOpacity>
        
      </TouchableOpacity>
    )
  }

  const handleImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose how to select an image',
      [
        {
          text: 'Camera',
          onPress: () => launchCameraForImage(),
        },
        {
          text: 'Photo Library',
          onPress: () => launchGalleryForImage(),
        },
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };
  const launchCameraForImage = () => {
  launchCamera(
    { mediaType: 'photo', cameraType: 'back', quality: 0.8 },
    (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera picker');
      } else if (response.errorCode) {
        Alert.alert('Error', `Camera error: ${response.errorMessage}`);
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
      }
    }
  );
};

const launchGalleryForImage = () => {
  launchImageLibrary(
    { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
    (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', `Gallery error: ${response.errorMessage}`);
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
      }
    }
  );
};
  /**
   * render user profile
   */
  const renderProfile = () => {    
    return (
      isLogged && (
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Image source={images.idAvatar} resizeMode="contain" style={styles.avatar} />
            <TouchableOpacity
                style={styles.pickImage}
                
                onPress={handleImagePicker}>
                <Icon type="materialCommunityIcons"
                  name="pencil-outline"
                  size={24}
                  color={COLORS.white} />
              </TouchableOpacity>
          </View>
          <Text style={[styles.title, { color: COLORS.greyscale900 }]}>
            {userData?.firstName} {userData?.lastName}
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigate("editProfile")}>
            <Text style={styles.primaryButtonText}>
              <Icon type="materialCommunityIcons" name="pencil-outline" color={COLORS.primary} /> Edit profile
            </Text>
          </TouchableOpacity>

        </View>
      )
    );
  };
  return (
    <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
      <ScrollView style={[styles.container, { backgroundColor: COLORS.white }]}>
        {renderHeader()}

        <View style={[styles.bottomContainer, { backgroundColor: COLORS.white }]}>
            {renderProfile()}
            <View style={styles.separateLine} />
            <View style={styles.summaryViewContainer}>
                <View style={styles.viewItemContainer}>
                    <View style={styles.viewIconContainer}>
                        <Image
                            source={icons.sport2 as ImageSourcePropType}
                            resizeMode='contain'
                            style={styles.viewIcon}
                        />
                    </View>
                    <Text style={[styles.viewTitle, { 
                        color: COLORS.greyscale900
                    }]}>31 games</Text>
                    <Text style={[styles.viewSubtitle, { 
                        color: COLORS.grayscale700
                    }]}>{t("Played")}</Text>
                </View>
                <View style={styles.viewItemContainer}>
                    <View style={styles.viewIconContainer}>
                        <Image
                            source={icons.timeCircle as ImageSourcePropType}
                            resizeMode='contain'
                            style={styles.viewIcon}
                        />
                    </View>
                    <Text style={[styles.viewTitle, { 
                        color: COLORS.greyscale900
                    }]}>45.5 hr</Text>
                    <Text style={[styles.viewSubtitle, { 
                        color: COLORS.grayscale700
                    }]}>{t("Played")}</Text>
                </View>
                <View style={styles.viewItemContainer}>
                    <View style={styles.viewIconContainer}>
                      <Image
                          source={icons.whistle as ImageSourcePropType}
                          resizeMode='contain'
                          style={[ { 
                            height: 64,
                            width: 64,
                            tintColor: COLORS.primary
                    }]}
                      />
                    </View>
                    <Text style={[styles.viewTitle, { 
                        color: COLORS.greyscale900
                    }]}> 12 games </Text>
                    <Text style={[styles.viewSubtitle, { 
                        color: COLORS.grayscale700
                    }]}>Organized</Text>
                </View>
            </View>
            <View style={styles.separateLine} />
            <View style={styles.locationItemContainer}>
              <Text style={styles.sectionTitle}>Joined Games</Text>
              {JOINED_GAMES.length === 0 ? (
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
              ) : (
                JOINED_GAMES.map((game) => (
                  <View key={game.id} style={styles.gameCard}>
                    <View style={styles.gameIconBg}>
                      <Icon 
                        type="materialCommunityIcons" 
                        name={getGameIcon(game.sportType)} 
                        size={24} 
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.gameInfo}>
                      <Text style={styles.gameName}>{game.title}</Text>
                      <Text style={styles.gameSub}>
                        <Icon  type="entypo" name="location-pin" size={16} color={COLORS.primary}/> {game.facility}
                      </Text>
                      <Text style={styles.gameSub}>
                        <Icon  type="entypo" name="clock" size={16} color={COLORS.primary}/> {game.date} {game.time}-{game.time}
                      </Text>
                    </View>
                    <View style={styles.gameRight}>
                      <Text style={styles.gamePlayers}>
                        {game.players}/{game.maxPlayers}
                      </Text>
                      <Text style={styles.gamePlayersLabel}>players</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
        </View>
      </ScrollView>
      {/* Logout Confirmation Modal */}
      <RBSheet
        ref={refRBSheet}
        closeOnPressMask={true}
        height={240}
        customStyles={{
          wrapper: {
            backgroundColor: "rgba(0,0,0,0.5)",
          },
          draggableIcon: {
            backgroundColor: COLORS.grayscale200,
            height: 4
          },
          container: {
            borderTopRightRadius: 32,
            borderTopLeftRadius: 32,
            height: 240,
            backgroundColor: COLORS.white
          }
        }}
      >
        <Text style={styles.bottomTitle}>Logout</Text>
        <View style={[styles.separateLine, {
          backgroundColor: COLORS.grayscale200,
        }]} />
        <Text style={[styles.bottomSubtitle, {
          color: COLORS.black
        }]}>
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
  )
};


export default Profile;