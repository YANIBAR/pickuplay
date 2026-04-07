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
  prefixes: [
    'pickuplay://',
    'https://mgopass.com',
  ],
    config: {
      screens: {
        game: {
          path: 'game/:game_id',
          parse: {
            gameId: (game_id: string) => game_id,
          },
        },
      },
    },
  };

  useEffect(() => {
  console.log('Handle when app is opened from background by tapping a notification');
  const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
    if (remoteMessage?.data?.screen === 'matchups' && remoteMessage.data.attributes) {
      const attrs = JSON.parse(remoteMessage.data?.attributes as string ?? '30');
      console.log("unsubscribe", remoteMessage.data?.screen);
      navigationRef.current?.navigate(remoteMessage.data?.screen, attrs);
    }
  });

  // Handle when app is opened from quit state by tapping a notification
  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage?.data?.screen === 'matchups' && remoteMessage.data.attributes) {
      const attrs = JSON.parse(remoteMessage.data?.attributes as string ?? '30');
      console.log("messaging", remoteMessage.data?.screen, attrs);
      navigationRef.current?.navigate(remoteMessage.data?.screen, attrs);
    }
  });

  // ...existing code...
  // ...initializeApp and Linking...

  return () => unsubscribe();
}, []);

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
