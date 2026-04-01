import { View, Text, StyleSheet, TouchableOpacity, FlatList, PermissionsAndroid, Platform } from 'react-native';
import React, { useEffect } from 'react';
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

import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
const Notifications = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const { notifications, addNotification, markAllAsRead } = useNotifications();

  useEffect(() => {
    requestPerm();
    fetchToken();

    // Listen for foreground notifications and add to list
    const unsubscribe = onMessage(getMessaging(getApp()), remoteMessage => {
      const newNotif = {
        id: Date.now().toString(),
        title: remoteMessage.notification?.title ?? 'New notification',
        description: remoteMessage.notification?.body ?? '',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: remoteMessage.data?.type as string ?? 'general',
        game_id: remoteMessage.data?.game_id as string ?? '30',
        isNew: true,
      };
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
      console.log('FCM Token:', token);
      // 🔥 Send this token to your backend
    } catch (error) {
      console.error('FCM Token error:', error);
    }
  }


  return (
      <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
          <View style={[styles.container, { backgroundColor: COLORS.white }]}>
              <Header title='Notifications'/>
              <ScrollView showsVerticalScrollIndicator={false}>
                  <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                    <NotificationCard
                        title={item.title}
                        description={item.description}
                        date={item.date}
                        time={item.time}
                        type={item.type}
                        isNew={item.isNew}
                        onPress={() => {
                            if (item.type === "Update") {
                                navigation.navigate('detail', { gameId: item.game_id });
                            }
                            // Optionally handle other notification types here
                        }}
                        />
                    )}
                    />
              </ScrollView>
          </View>
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