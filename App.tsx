import React, { FC, useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { AppStack } from '@navigation';
import { withProviders } from '@hocs';
import AuthProvider from './src/shared/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@services/localisation';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { NotificationProvider, useNotifications } from '@contexts/NotificationContext';
import { notifications as initialNotifications } from '@data';
import messaging from '@react-native-firebase/messaging';

const navigationRef = createNavigationContainerRef();

// ✅ Safe JSON parser
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

const AppWithNotifications: FC<{ initialRoute: string }> = ({ initialRoute }) => {
  const { addNotification } = useNotifications();
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);

  // ✅ Deep linking ONLY for URLs (not notifications)
  const linking = {
    prefixes: [
      'http://162.222.205.74:3000',
      'pickuplay://',
    ],
    config: {
      screens: {
        game: 'game/:game_id',
        matchups: 'matchups',
      },
    },
  };

  // ✅ Handle notifications (ALL cases)
  useEffect(() => {
    // 🔹 Foreground notifications (app open)
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      const { messageId, notification } = remoteMessage;

      addNotification({
        id: messageId ?? Date.now().toString(),
        title: notification?.title ?? '',
        body: notification?.body ?? '',
        date: new Date().toLocaleDateString(),
        type: remoteMessage.data?.type ?? 'general',
        isNew: true,
      });

      // Show toast
      setToast({
        title: notification?.title ?? '',
        body: notification?.body ?? '',
      });

      setTimeout(() => setToast(null), 5000);
    });

    // 🔹 When app is in background and user taps notification
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      handleNavigationFromNotification(remoteMessage);
    });

    // 🔹 When app is opened from quit state via notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          handleNavigationFromNotification(remoteMessage);
        }
      });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, []);

  // ✅ Centralized navigation logic
  const handleNavigationFromNotification = (remoteMessage: any) => {
    const screen = remoteMessage?.data?.screen;
    const attributes = parseAttributes(remoteMessage?.data?.attributes);

    if (!navigationRef.isReady()) return;

    if (screen === 'game' && attributes?.game_id) {
      navigationRef.navigate('game', {
        game_id: attributes.game_id,
      });
    }

    if (screen === 'matchups') {
      navigationRef.navigate('matchups');
    }
  };

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <AuthProvider>
        <AppStack initialRouteName={initialRoute} />

        {toast && (
          <View style={styles.toast}>
            <Text style={styles.toastTitle}>{toast.title}</Text>
            <Text style={styles.toastBody}>{toast.body}</Text>
          </View>
        )}
      </AuthProvider>
    </NavigationContainer>
  );
};

// ✅ Root App
const App: FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string>('login');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await i18n.init();

        const storedLanguage = await AsyncStorage.getItem('selectedLanguage');
        if (storedLanguage && i18n.isInitialized) {
          await i18n.changeLanguage(storedLanguage);
        }

        setInitialRoute('welcome');
      } catch (error) {
        console.error('Initialization error:', error);
        setInitialRoute('onboarding');
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();

    // 🔹 Optional: listen to real deep links
    const sub = Linking.addEventListener('url', ({ url }) => {
      console.log('Deep link received:', url);
    });

    return () => sub.remove();
  }, []);

  if (!isReady) return null;

  return (
    <NotificationProvider initialData={initialNotifications}>
      <AppWithNotifications initialRoute={initialRoute} />
    </NotificationProvider>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
  },
  toastTitle: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  toastBody: {
    color: '#ebebf5cc',
    fontSize: 13,
  },
});

export default withProviders(App);