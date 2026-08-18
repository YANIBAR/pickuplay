import { View, Text, Share, StyleSheet, TouchableOpacity, Image, Alert, ImageSourcePropType } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { COLORS, SIZES, icons, images, screens } from '@constants';
import { useNavigation } from '@react-navigation/native';
import { SettingsItem, Button, MoreModal, Header } from '@components';
import RBSheet from "react-native-raw-bottom-sheet";
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useUserData } from '@services/useUserData';
import { isStoredTokenExpired } from '@utils/api/auth';
import { publicApi } from '@services/api';

type Nav = {
  navigate: (value: string) => void
}

const Profile = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const refRBSheet = useRef<any>(null);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Use the custom hook for user data management
  const { userData, error, refreshUserData } = useUserData();
  const [isLogged, setIsLogged] = useState(false);
  const inviteMessage = t('Admission to a variety of attraction...');
  
  const dropdownItems = [
    { label: t('settings.inviteFriends'), value: 'share', icon: icons.shareOutline },
    { label: t('settings.helpCenter'), value: 'help', icon: icons.infoCircle },
    { label: t('settings.privacyPolicy'), value: 'privacy', icon: icons.lockedComputerOutline },
    { label: t('settings.termsConditions'), value: 'terms', icon: icons.shieldOutline },
  ];

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
  const handleChangePassword = () =>  {
      const email = userData?.email;
      try {
        // Send the request to the backend
        const response = publicApi.post(`otp/send`, { email });
        
        // If successful, navigate to the OTP verification screen
        navigate(screens.otpverification, { email, action: 'resetPassword' });
      } catch (error) {
        // Handle any errors that occur during the request
        console.error('Error during forgot password request:', error);
        
        // Optionally, you can show an alert or other feedback to the user
        Alert.alert('Forgot Password Failed', 'There was an issue with your request. Please try again.');
      }
    };

  const handleLogout = async () => {
    try {
      const keysToRemove = [
        'access_token',
        'refresh_token',
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
      navigate("welcome");
    } catch (e) {
      console.error('Failed to log out', e);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const handleInvite = async () => {
    try {
      const userName = userData?.firstName || 'Your friend';

      // 👇 unique referral link
      const referralLink = `https://pickuplay.com/`;

      const message = `⚽ ${userName} invited you to join Pickuplay!

        Find and join games near you instantly.

        🎁 Use my invite and join your first game!
        👉 ${referralLink}

        📲 Download the app and start playing!`;

            const result = await Share.share({
              message,
              title: 'Join me on Pickuplay',
            });

            if (result.action === Share.sharedAction) {
              console.log('Referral shared successfully');
            }
          } catch (error) {
            console.error('Error sharing referral:', error);
            Alert.alert('Error', 'An error occurred while sharing the invite.');
          }
        };
  useEffect(() => {
    const checkToken = async () => {
      const expired = await isStoredTokenExpired();
      setIsLogged(!expired); // ← also note the `!` — logged = NOT expired
    };
    checkToken();
  }, []);

  /**
   * Render Settings
   */
  const renderSettings = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
      <View style={[styles.settingsContainer, { backgroundColor: isDarkMode ? COLORS.black : COLORS.white }]}>
        {/* Profile Items */}      
        {isLogged==true && (
          <>

            <SettingsItem
              icon={icons.user}
              name={t('settings.editProfile')}
              onPress={() => navigate('editProfile')}
              hasArrowRight={false}
            />

            <SettingsItem
              icon={icons.bell3}
              name={t('settings.requests')}
              onPress={() => navigate('teamRequests')}
              hasArrowRight={false}
            />
            
            {/*<SettingsItem
              icon={icons.user}
              name={t('settings.changePassword')}
              onPress={handleChangePassword}
              hasArrowRight={false}
            />*/}

            {/* Language & Region */}
            <TouchableOpacity
              onPress={() => navigate('LanguageItem')}
              style={styles.settingsItemContainer}
            >
              <View style={styles.leftContainer}>
                <Image
                  source={icons.lang}
                  style={[styles.settingsIcon, { tintColor: COLORS.grayscale900 }]}
                />
                <Text style={[styles.settingsName, { color: COLORS.grayscale900 }]}>
                  {t('settings.languageRegion')}
                </Text>
              </View>
              <View style={styles.rightContainer}>
                <Image
                  source={icons.arrowRight}
                  style={[styles.settingsArrowRight, { tintColor: COLORS.grayscale900 }]}
                />
              </View>
            </TouchableOpacity>

            {/* Payment Methods */}
            <SettingsItem
              icon={icons.installment}
              name={t('settings.paymentMethods')}
              onPress={() => navigate('Payment')}
              hasArrowRight={false}
            />

          </>
        )}
        
        {/* Invite Friends */}
        <SettingsItem
          icon={icons.shareOutline}
          name={t('settings.inviteFriends')}
          onPress={() => handleInvite()}
          hasArrowRight={false}
        />
        {/* Help Center */}
        <SettingsItem
          icon={icons.infoCircle}
          name={t('settings.helpCenter')}
          onPress={() => navigate('HelpCenter')}
          hasArrowRight={false}
        />
        <SettingsItem
          icon={icons.lockedComputerOutline}
          name={t('settings.privacyPolicy')}
          onPress={() => navigate('PrivacyPolicy')}
          hasArrowRight={false}
        />
        <SettingsItem
          icon={icons.shieldOutline}
          name={t('settings.termsConditions')}
          onPress={() => navigate('terms')}
          hasArrowRight={false}
        />
        {isLogged==true && (
          <TouchableOpacity
            onPress={() => refRBSheet.current?.open()}
            style={styles.logoutContainer}
          >
            <View style={styles.logoutLeftContainer}>
              <Image
                source={icons.logout}
                style={[styles.logoutIcon, { tintColor: "red" }]}
              />
              <Text style={[styles.logoutName, { color: "red" }]}>
                {t('settings.logout')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.area]}>
      <Header title='Profile'/>
      <ScrollView showsVerticalScrollIndicator={false} style={[styles.container, { backgroundColor: COLORS.white }]}>
        {renderSettings()}
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
  );
};

export default Profile;