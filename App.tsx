import React, { FC, useCallback, useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { AppStack } from '@navigation';
import { withProviders } from '@hocs';
import AuthProvider from './src/shared/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@services/localisation';
import { Linking, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import { NotificationProvider, useNotifications } from '@contexts/NotificationContext';
import { notifications as initialNotifications } from '@data';
import {
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  requestPermission,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // tune as you like
      retry: 1,
    },
  },
});

// ✅ Centralized navigation logic
const handleNavigationFromNotification = (remoteMessage: any) => {
  const screen = remoteMessage?.data?.screen;
  const attributes = parseAttributes(remoteMessage?.data?.attributes);

  if (!navigationRef.isReady()) return;

  if (screen === 'game' && attributes?.game_id) {
    navigationRef.navigate('game' as never, { game_id: attributes.game_id } as never);
  }

  if (screen === 'matchups') {
    navigationRef.navigate('matchups' as never);
  }
};

const AppWithNotifications: FC<{ initialRoute: string }> = ({ initialRoute }) => {
  const { addNotification } = useNotifications();
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);

  // ✅ Deep linking ONLY for URLs (not notifications)
  const linking = {
    prefixes: ['http://162.222.205.74:3000', 'pickuplay://'],
    config: {
      screens: {
        game: 'game/:game_id',
        matchups: 'matchups',
      },
    },
  };

  // ✅ Handle notifications (ALL cases)
  useEffect(() => {
    const messagingInstance = getMessaging();
    let toastTimer: ReturnType<typeof setTimeout> | undefined;

    // 🔹 Foreground notifications (app open)
    const unsubscribeForeground = onMessage(messagingInstance, async remoteMessage => {
      const { messageId, notification } = remoteMessage;

      addNotification({
        id: messageId ?? Date.now().toString(),
        title: notification?.title ?? '',
        body: notification?.body ?? '',
        date: new Date().toLocaleDateString(),
        type: (remoteMessage.data?.type as string) ?? 'general',
        isNew: true,
      });

      // Show toast
      setToast({
        title: notification?.title ?? '',
        body: notification?.body ?? '',
      });

      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => setToast(null), 5000);
    });

    // 🔹 When app is in background and user taps notification
    const unsubscribeBackground = onNotificationOpenedApp(messagingInstance, remoteMessage => {
      handleNavigationFromNotification(remoteMessage);
    });

    // 🔹 When app is opened from quit state via notification
    getInitialNotification(messagingInstance)
      .then(remoteMessage => {
        if (remoteMessage) {
          handleNavigationFromNotification(remoteMessage);
        }
      })
      .catch(e => console.warn('getInitialNotification failed:', e));

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
      if (toastTimer) clearTimeout(toastTimer);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};

// ✅ Root App
const App: FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string>('login');

  // 🔹 Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        console.log('Android POST_NOTIFICATIONS:', granted);
      }

      const messagingInstance = getMessaging();

      // Register for remote messages before requesting permission or getting token
      await registerDeviceForRemoteMessages(messagingInstance);

      const authStatus = await requestPermission(messagingInstance);
      console.log('Firebase auth status:', authStatus);
    } catch (error) {
      console.error('Permission error:', error);
    }
  }, []);

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

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

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