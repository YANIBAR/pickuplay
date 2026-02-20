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
import { useUserData } from '@services/useUserData';

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
  
  const isLogged = !userData?.id; // Check if user is logged in based on id
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
      </TouchableOpacity>
    );
  };

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
          <Text style={[styles.title, { color: COLORS.greyscale900 }]}>
            {userData?.firstName} {userData?.lastName}
          </Text>
          <Text style={[styles.subtitle, { color: COLORS.greyscale900 }]}>
            {userData?.email}
          </Text>
        </View>
      )
    );
  };

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
              hasArrowRight={false}
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


            {/* My Games */}
            <SettingsItem
              icon={icons.fileUploadOutline}
              name={t('settings.myGames')}
              onPress={() => navigate('myGames')}
              hasArrowRight={false}
            />

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
        {/* Logout Button */}
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
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.area]}>
      <View style={[styles.container, { backgroundColor: COLORS.white }]}>
        {renderHeader()}
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderProfile()}
          {renderSettings()}
        </ScrollView>
      </View>

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

      {/* More Options Modal */}
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
              onPress={() => handleDropdownSelect(item)}
            >
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
              }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </MoreModal>
    </SafeAreaView>
  );
};

export default Profile;