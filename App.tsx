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
import { NotificationProvider } from '@contexts/NotificationContext';
import { notifications as initialNotifications } from '@data';
import messaging from '@react-native-firebase/messaging';

const navigationRef = createNavigationContainerRef();

const App: FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string>('login'); // Default route
  const linking = {
  prefixes: ['https://play.google.com/store/apps/details?id=com.pickuplay.app://', 'http://162.222.205.74:3000/index.html://', 'pickuplay://'],
  config: {
    screens: {
      game: {
        path: 'game/:game_id',
      },
      matchups: {
        path: 'matchups',
      },
    },
  },
  // 👇 This overrides how NavigationContainer gets the initial URL
  async getInitialURL() {
    // 1. Check if app was opened from a deep link
    const url = await Linking.getInitialURL();
    if (url) return url;

    // 2. Check if app was opened from a quit-state notification
    const remoteMessage = await messaging().getInitialNotification();

      console.log('Foreground notification :', remoteMessage);
    if (remoteMessage?.data?.screen) {
      const screen = remoteMessage.data.screen;
      const attributes = parseAttributes(remoteMessage.data.attributes);

      // Build a deep link URL that matches your config
      if (screen === 'game' && attributes?.game_id) {
        return `pickuplay://game/${attributes.game_id}`;
      }
      if (screen === 'matchups') {
        return `pickuplay://matchups`;
      }
    }

    return null;
  },
  // 👇 This handles foreground/background notification taps
  subscribe(listener: (url: string) => void) {
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      const screen = remoteMessage?.data?.screen;
      const attributes = parseAttributes(remoteMessage?.data?.attributes);

      if (screen === 'game' && attributes?.game_id) {
        listener(`pickuplay://game/${attributes.game_id}`);
      }
      if (screen === 'matchups') {
        listener(`pickuplay://matchups`);
      }
    });

    // Background notification tap
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      const screen = remoteMessage?.data?.screen;
      const attributes = parseAttributes(remoteMessage?.data?.attributes);


      if (screen === 'game' && attributes?.game_id) {
        listener(`pickuplay://game/${attributes.game_id}`);
      }
      if (screen === 'matchups') {
        listener(`pickuplay://matchups`);
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  },
};

// Helper to safely parse attributes
function parseAttributes(attributes: unknown): Record<string, any> | undefined {
  if (typeof attributes === 'string' && attributes.trim().length > 0) {
    try {
      return JSON.parse(attributes);
    } catch (e) {
      console.warn('Failed to parse notification attributes:', e);
    }
  }
  return undefined;
}


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
        setInitialRoute('welcome');
        /*const hasLaunched = 'true';await AsyncStorage.getItem('hasLaunched');
          if(hasLaunched === 'false' || hasLaunched === null) {
           setInitialRoute('onboarding');
          } else {
            setInitialRoute('welcome');
          }*/
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
    <NotificationProvider initialData={initialNotifications}>
      <NavigationContainer linking={linking} ref={navigationRef}>
        <AuthProvider>
          <AppStack initialRouteName={initialRoute} />
        </AuthProvider>
      </NavigationContainer>
    </NotificationProvider>
  );
};
export default withProviders(App);
