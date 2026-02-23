import React, { FC, useEffect, useState } from 'react';
//import SplashScreen from 'react-native-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { AppStack } from '@navigation';
import { withProviders } from '@hocs';
import AuthProvider from './src/shared/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@services/localisation';

const App: FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string>('login'); // Default route

  useEffect(() => {
    const initializeApp = async () => {
      try {
        //SplashScreen.hide();
        // Initialize i18n first
        await i18n.init();
        
        // Get stored language preference if any
        const storedLanguage = await AsyncStorage.getItem('selectedLanguage');
        if (storedLanguage && i18n.isInitialized) {
          await i18n.changeLanguage(storedLanguage);
        }
        const token = await AsyncStorage.getItem('access_token');
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (token) {
          if(hasLaunched === 'false') {
           setInitialRoute('onboarding');
          } else {
            setInitialRoute('welcome');
          }
        } 
      } catch (error) {
        console.error('Initialization error:', error);
        setInitialRoute('onboarding'); // Fallback
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <AuthProvider>
        <AppStack initialRouteName={'welcome'} />
      </AuthProvider>
    </NavigationContainer>
  );
};
export default withProviders(App);
