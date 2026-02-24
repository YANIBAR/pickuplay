import React, { FC, useEffect, useState } from 'react';
//import SplashScreen from 'react-native-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { AppStack } from '@navigation';
import { withProviders } from '@hocs';
import AuthProvider from './src/shared/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@services/localisation';
import { Linking } from 'react-native';
import { createNavigationContainerRef } from '@react-navigation/native';

const navigationRef = createNavigationContainerRef();

const App: FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string>('login'); // Default route
  const linking = {
  prefixes: [
    'pickuplay://',
    'https://mgopass.com',
  ],
    config: {
      screens: {
        detail: {
          path: 'game/:gameId',
          parse: {
            gameId: (gameId: string) => gameId,
          },
        },
      },
    },
  };

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
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
          if(hasLaunched === 'false') {
           setInitialRoute('onboarding');
          } else {
            setInitialRoute('welcome');
          }
      } catch (error) {
        console.error('Initialization error:', error);
        setInitialRoute('onboarding'); // Fallback
      } finally {
        setIsReady(true);
      }
    };
    initializeApp();

    const sub = Linking.addEventListener('url', ({ url }) => {
      console.log('Deep link received:', url);
    });
    return () => sub.remove();
  }, []);

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer linking={linking}>
      <AuthProvider>
        <AppStack initialRouteName={initialRoute} />
      </AuthProvider>
    </NavigationContainer>
  );
};
export default withProviders(App);
