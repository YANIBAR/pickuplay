import { View, Text, StyleSheet, TouchableOpacity, FlatList, PermissionsAndroid, Platform, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, icons } from '@constants';
import { NavigationProp } from '@react-navigation/native';
import { ScrollView } from 'react-native-virtualized-view';
import { useNotifications } from '@contexts/NotificationContext';
import NotificationCard from '@components/NotificationCard';
import { useNavigation } from '@react-navigation/native';
import { getMessaging, requestPermission, getToken, onMessage } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { Header } from '@components';
import { authenticatedApi } from '@services/api';

export type Notification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  type: string;
  isRead: boolean;
};
const Notifications = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { notifications, addNotification, markAllAsRead, initializeNotifications, isLoading } = useNotifications();
  const [storedNotifications, setStoredNotifications] = useState<Notification[]>([]); 
  useEffect(() => {
    requestPerm();
    fetchToken();
    initializeNotifications();
    // Listen for foreground notifications and add to list
    const unsubscribe = onMessage(getMessaging(getApp()), remoteMessage => {
      const newNotif = {
        id: Date.now().toString(),
        title: remoteMessage.notification?.title ?? 'New notification',
        description: remoteMessage.notification?.body ?? '',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: remoteMessage.data?.icon_type as string ?? 'general',
        attributes: JSON.parse(remoteMessage.data?.attributes as string ?? '30'),

        isNew: true,
      };

      console.log('Received foreground mssggs:', newNotif);
      addNotification(newNotif);
    });

    // Mark all as read when screen is opened
    markAllAsRead();

    return () => unsubscribe();
  }, []);

  async function requestPerm() {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        console.log('Android POST_NOTIFICATIONS:', granted);
      }
      // Register for remote messages before requesting permission or getting token
      await getMessaging(getApp()).registerDeviceForRemoteMessages();
      const authStatus = await requestPermission(getMessaging(getApp()));
      console.log('Firebase auth status:', authStatus);
    } catch (error) {
      console.error('Permission error:', error);
    }
  }

  async function fetchToken() {
    try {
      // Register for remote messages before getting token (safe to call again)
      await getMessaging(getApp()).registerDeviceForRemoteMessages();
      const token = await getToken(getMessaging(getApp()));
      // 🔥 Send this token to your backend
    } catch (error) {
      console.error('FCM Token error:', error);
    }
  }

  return (
      <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
        <Header title='Notifications'/>
        <ScrollView showsVerticalScrollIndicator={false}>
            <FlatList
              data={notifications}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
              <NotificationCard
                  title={item.title}
                  description={item.body}
                  date={item.createdAt}
                  type={item.type}
                  isNew={item.isRead}
                  onPress={() => {
                    if (item?.attributes) {
                        navigation.navigate('detail', JSON.parse(item?.attributes));
                    }
                  }}
                  />
              )}
              />
        </ScrollView>
      </SafeAreaView>
  )
};

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 16
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 16
    },
    scrollView: {
        backgroundColor: COLORS.tertiaryWhite
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center"
    },
    backIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.black,
        marginRight: 16
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "bold",
        color: COLORS.black
    },
    moreIcon: {
        width: 24,
        height: 24,
        tintColor: COLORS.black
    },
})

export default Notifications