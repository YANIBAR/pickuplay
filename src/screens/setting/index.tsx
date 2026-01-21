import { View, Text, Share, StyleSheet, TouchableOpacity, Image, Alert, ImageSourcePropType } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { COLORS, SIZES, icons, images, screens } from '@constants';
import { useNavigation } from '@react-navigation/native';
import { SettingsItem, Button, MoreModal } from '@components';
import RBSheet from "react-native-raw-bottom-sheet";
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';

type Nav = {
  navigate: (value: string) => void
}

const Profile = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const refRBSheet = useRef<any>(null);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [user, setUser] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const inviteMessage = t('Admission to a variety of attraction...');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownItems = [
    { label: t('settings.inviteFriends'), value: 'share', icon: icons.shareOutline },
    { label: t('settings.helpCenter'), value: 'help', icon: icons.infoCircle },
    { label: t('settings.privacyPolicy'), value: 'privacy', icon: icons.lockedComputerOutline },
    { label: t('settings.termsConditions'), value: 'terms', icon: icons.shieldOutline },
  ];

  const handleDropdownSelect = (item: any) => {
    setSelectedItem(item.value);
    setModalVisible(false);

    // Perform actions based on the selected item
    switch (item.value) {
      case 'share':
        // Handle Share action
        handleInvite();
        setModalVisible(false);
        break;
      case 'help':
        // Handle Download E-Receipt action
        setModalVisible(false);
        navigate('HelpCenter');
        break;
      
      case 'privacy':
        // Handle Download E-Receipt action
        setModalVisible(false);
        navigate('PrivacyPolicy');
        break;
      case 'terms':
        // Handle Print action
        setModalVisible(false);
        navigate('terms');
        break;
      default:
        break;
    }
  };
  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return token;
    } catch (e) {
      console.error('Failed to fetch the token', e);
      return null;
    }
  };

  const handleClose = () => {
    setModalVisible(false)
  };
  const getUserData = async () => {
    try {
      const firstName = await AsyncStorage.getItem("firstName");
      const lastName = await AsyncStorage.getItem("lastName");
      const email = await AsyncStorage.getItem("email");
      
      const userData = {
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || ''
      };
      setIsLogged(true);
      setUser(userData);
      console.log("Storage after login:", userData);
    } catch (error) {
      console.error('Debug storage error:', error);
    }
  };
  const checkLogin = async () => {
    const token = await getToken();
    if (token) {
      // Verify token validity or directly use it
      setIsLogged(true);
    } 
  };
  useEffect(() => {
    getUserData();
    checkLogin();
  }, []);
  const handleLogout = async () => {
    // Unstore token and navigate to the next screen
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
      setUser(null); // Reset user state
      setIsLogged(false); // Reset logged in state
      setLogoutModalVisible(false);
      refRBSheet.current.close()
      navigate(screens.login);
    } catch (e) {
      console.error('Failed to log out', e);
    }
  };
  const handleInvite = async () => {
  try {
    // Get user's name for personalized sharing
    const userName = user?.firstName ? `${user.firstName}` : 'Your friend';
    
    // Create a more detailed invite message
    const referralMessage = `🎉 ${userName} invited you to MGO Pass!\n\n${inviteMessage}\n\n🎟️ Get admission to a variety of attractions in Casanlanca!\n\n💰 🌐 Learn more: https://pickuplay.com/#how-it-works?id=${user.id}\n📱 Download the app and start exploring!`;
    
    const result = await Share.share({
      message: referralMessage,
      url: 'https://pickuplay.com/', // This will be included on iOS
      title: 'MGO Pass - Make $5 Refer a Friend', // Title for the share dialog
    });

    if (result.action === Share.sharedAction) {
      if (result.gameType) {
        // Handle specific share game
        console.log('Shared via:', result.gameType);
      } else {
        // Shared successfully
        console.log('Success', 'Referral link shared successfully!');
      }
    } else if (result.action === Share.dismissedAction) {
      // User dismissed the share dialog
      console.log('Share dialog dismissed');
    }
  } catch (error) {
    console.error('Error sharing referral:', error);
    Alert.alert('Error', 'An error occurred while sharing the referral link.');
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
            source={images.logo}
            style={styles.logo}
          />
          <Text style={[styles.headerTitle, {
            color: COLORS.greyscale900
          }]}>Profile</Text>
        </View>
        {/* <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={icons.moreCircle}
            style={[styles.headerIcon, {
              tintColor: COLORS.greyscale900
            }]}
          />
        </TouchableOpacity> */}
        
      </TouchableOpacity>
    )
  }
  /**
   * render user profile
   */
  const renderProfile = () => {    
    return (
      isLogged && (
          <View style={styles.profileContainer}>
            <View>
              <Image source={images.logo} resizeMode="contain" style={styles.avatar} />
            </View>
            <Text style={[styles.title, { color: COLORS.greyscale900 }]}>{user?.firstName} { user?.lastName }</Text>
            <Text style={[styles.subtitle, { color: COLORS.greyscale900 }]}>{ user?.email }</Text>
          </View>
      )
    )
  }
  /**
   * Render Settings
   */
  const renderSettings = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
      <View style={[styles.settingsContainer, { backgroundColor: isDarkMode ? COLORS.black : COLORS.white }]}>
      {/* Profile Items */}      
      {isLogged && (
          <>
            <SettingsItem
              icon={icons.userOutline}
              name={t('settings.editProfile')}
              onPress={() => navigate('editProfile')}
            />
            
          </>
        )}
      {/* inviteFriends */}
      <SettingsItem
        icon={icons.shareOutline}
        name={t('settings.inviteFriends')}
        onPress={() => handleInvite()}
      />

      {/* helpCenter */}
      <SettingsItem
        icon={icons.infoCircle}
        name={t('settings.helpCenter')}
        onPress={() => navigate('HelpCenter')}
      />
      <SettingsItem
        icon={icons.lockedComputerOutline}
        name={t('settings.privacyPolicy')}
        onPress={() => navigate('PrivacyPolicy')}
      />
      <SettingsItem
        icon={icons.shieldOutline}
        name={t('settings.termsConditions')}
        onPress={() => navigate('terms')}
      />
      {/* Language & Region */}
      <TouchableOpacity
        onPress={() => navigate('LanguageItem')}
        style={styles.settingsItemContainer}
      >
        <View style={styles.leftContainer}>
          <Image
            source={icons.lang}
            style={[styles.settingsIcon, { tintColor: COLORS.greyscale900 }]}
          />
          <Text style={[styles.settingsName, { color: COLORS.greyscale900 }]}>
            {t('settings.languageRegion')}
          </Text>
        </View>
        <View style={styles.rightContainer}>
          <Image
            source={icons.arrowRight}
            style={[styles.settingsArrowRight, { tintColor: COLORS.greyscale900 }]}
          />
        </View>
      </TouchableOpacity>

      {isLogged && (
        <TouchableOpacity
        onPress={() => refRBSheet.current.open()}
          style={styles.logoutContainer}>
          <View style={styles.logoutLeftContainer}>
            <Image
              source={icons.logout}
              style={[styles.logoutIcon, {
                tintColor: "red"
              }]}
            />
            <Text style={[styles.logoutName, {
              color: "red"
            }]}>{t('settings.logout')}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
    )
  }
  return (
    
    <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
      <View style={[styles.container, { backgroundColor: COLORS.white }]}>
        {renderHeader()}
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderProfile()}
          {renderSettings()}
        </ScrollView>
      </View>
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
          }}>
          <Text style={styles.bottomTitle}>Logout</Text>
          <View style={[styles.separateLine, {
            backgroundColor: COLORS.grayscale200,
          }]} />
          <Text style={[styles.bottomSubtitle, {
            color: COLORS.black
          }]}>{t('logout.confirmation')}</Text>
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
              onPress={() => refRBSheet.current.close()}
            />
          </View>
        </RBSheet>
        {/* Modal for dropdown selection */}
      <MoreModal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onClose={handleClose}
      >
          <FlatList
            data={dropdownItems}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: 'center',
                  marginVertical: 12
                }}
                onPress={() => handleDropdownSelect(item)}>
                <Image
                  source={item.icon as ImageSourcePropType}
                  resizeMode='contain'
                  style={{
                    width: 20,
                    height: 20,
                    marginRight: 16,
                    tintColor: COLORS.black
                  }}
                />
                <Text style={{
                  fontSize: 14,
                  fontFamily: "semiBold",
                  color: COLORS.black
                }}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
      </MoreModal>
    </SafeAreaView>
  )
};

export default Profile