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
import { API_BACKEND_URL } from '@env';
import axios from 'axios';

// Settings language screen
const SettingsLanguage = () => {
  const { t } = useTranslation();
  const [savedLang, setsavedLang] = useState(AsyncStorage.getItem('selectedLanguage'));
  const [userId, setUserId] = useState('');
  
  const [selectedItem, setSelectedItem] = useState(savedLang);
  const loadLanguage = async () => {
    try {
      const retrievedData = await AsyncStorage.multiGet(["id", "access_token", "firstName", "lastName", "email", "phone", "role"]);
      const userObject = Object.fromEntries(retrievedData);
      const email = userObject.email;
      setUserId(userObject.id);
      const response = await axios.post(`${API_BACKEND_URL}/user/getLanguage/`, {
        email,
      });
    
      if (response.data) {
        setsavedLang(response.data); // ✅ Set language correctly
        
        setSelectedItem(response.data);
      }
    } catch (error) {
      console.error("Error fetching language:", error);
    }
  };
  useEffect(() => {
    loadLanguage();
  }, []);
  const updateLanguageOnServer = async (language: string) => {
    try {
      if (!userId) {
        console.warn("No userId found, skipping server update");
        return;
      }

      // Send just the language string, not an object
      const response = await axios.post(
        `${API_BACKEND_URL}/user/setLanguage/${userId}?preferredLanguage=${language}`
      );

    } catch (error) {
      console.error("Error updating language on server:", error);
      // Don't throw error - allow local update to proceed
    }
  };

  const handleCheckboxPress = async (itemTitle: string) => {
    try {
      if (selectedItem === itemTitle) {
        // If the clicked item is already selected, deselect it
        setSelectedItem(null);
        await AsyncStorage.removeItem('selectedLanguage');
        return;
      }

      // Otherwise, select the clicked item
      setSelectedItem(itemTitle);
      setsavedLang(itemTitle);

      // Update local storage
      await AsyncStorage.setItem('selectedLanguage', itemTitle);
      
      // Change language in i18n
      i18n.changeLanguage(itemTitle);

      // Update on server
      await updateLanguageOnServer(itemTitle);

    } catch (error) {
      console.error("Error in handleCheckboxPress:", error);
    }
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
      <View style={[styles.container, { backgroundColor: COLORS.white }]}>
        <Header title={t('settings.languageRegion')} />
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
            checked={selectedItem === 'fr'}
            name="Français"
            onPress={() => handleCheckboxPress('fr')}
          />
          <LanguageItem
            checked={selectedItem === 'ar'}
            name="العربية"
            onPress={() => handleCheckboxPress('ar')}
          />
          
        </ScrollView>
      </View>
    </SafeAreaView>
  )
};

export default SettingsLanguage