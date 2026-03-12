import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { COLORS } from '@constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@components/Header';
import { ScrollView } from 'react-native-virtualized-view';
import LanguageItem from '@components/LanguageItem';
import styles from './styles';
import i18n from '@services/localisation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { authenticatedApi } from '@services/api';
import { Button } from '@components';

// Settings language screen
const SettingsLanguage = () => {
  const { t } = useTranslation();
  const [savedLang, setsavedLang] = useState(AsyncStorage.getItem('preferredLanguage'));
  const [userId, setUserId] = useState('');
  
  const [selectedItem, setSelectedItem] = useState(savedLang);

  useEffect(() => {
  const getLang = async () => {
    try {
      const lang = await AsyncStorage.getItem('preferredLanguage');
      setSelectedItem(lang);
    } catch (error) {
      console.error('Failed to load preferred language:', error);
    }
  };
  getLang();
}, []);

const updateLanguageOnServer = async (language: string) => {
  try {
    const response = await authenticatedApi.patch('profile', { preferredLanguage: language });
    console.log('Language updated on server:', response);
  } catch (error) {
    console.error('Error updating language on server:', error);
    throw error; // re-throw so handleSubmit can catch it
  }
};

const handleCheckboxPress = (itemTitle: string) => {
  // No async needed here anymore — just update selection state
  if (selectedItem === itemTitle) {
    setSelectedItem(null);
  } else {
    setSelectedItem(itemTitle);
  }
};

const handleSubmit = async () => {
  if (!selectedItem) {
    console.warn('No language selected');
    return;
  }

  try {
    // Update local storage
    await AsyncStorage.setItem('selectedLanguage', selectedItem);

    // Change language in i18n
    i18n.changeLanguage(selectedItem);

    // Update on server
    await updateLanguageOnServer(selectedItem);

    // Only update savedLang if everything succeeded
    setsavedLang(selectedItem);

  } catch (error) {
    console.error('Failed to save language settings:', error);
    // Optionally revert state if something failed
    setSelectedItem(savedLang);
  }
};
  return (
    <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>

      <Header title={t('settings.languageRegion')} />
      <View style={[styles.container, { backgroundColor: COLORS.white }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: COLORS.black }]}>{t('AvailableLanguages')}</Text>
          <View style={{ marginTop: 12 }}>
            <LanguageItem
              checked={selectedItem === 'en'}
              name="English"
              onPress={() => handleCheckboxPress('en')}
            />
            
          </View>
          <LanguageItem
            checked={selectedItem === 'es'}
            name="Spanish"
            onPress={() => handleCheckboxPress('es')}
          />
          <LanguageItem
            checked={selectedItem === 'ar'}
            name="العربية"
            onPress={() => handleCheckboxPress('ar')}
          />
          <Button
                title={t('cnp.modal.continue')}
                filled
                onPress={() => {
                  handleSubmit();
                }}
                style={{
                  width: '100%',
                  marginTop: 12,
                }}
              />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
};

export default SettingsLanguage