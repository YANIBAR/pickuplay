import { View, Text, StyleSheet, TouchableOpacity, FlatList, PermissionsAndroid, Platform, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, icons } from '@constants';
import { ScrollView } from 'react-native-virtualized-view';
import { useNotifications } from '@contexts/NotificationContext';
import NotificationCard from '@components/NotificationCard';
import { getMessaging, requestPermission, getToken, onMessage } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { Header } from '@components';

export type Notification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  type: string;
  isRead: boolean;
};
const Notifications = () => {
  const { notifications, addNotification, markAllAsRead, initializeNotifications, isLoading } = useNotifications();
  useEffect(() => {
    initializeNotifications();
    // Listen for foreground notifications and add to list
    const unsubscribe = onMessage(getMessaging(getApp()), remoteMessage => {
      const newNotif = {
        id: Date.now().toString(),
        title: remoteMessage.notification?.title ?? 'New notification',
        body: remoteMessage.notification?.body ?? '',
        date: new Date().toLocaleDateString(),
        type: remoteMessage.data?.icon_type as string ?? 'general',
        attributes: remoteMessage.data?.attributes as string,
        screen: remoteMessage.data?.screen as string ?? '',
        isNew: true,
      };

      addNotification(newNotif);
    });

    // Mark all as read when screen is opened
    markAllAsRead();
    return () => unsubscribe();
  }, []);

  
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
                  body={item.body}
                  date={item.createdAt}
                  type={item.type}
                  isNew={item.isRead}
                  screen={item.screen}
                  attributes={item.attributes}
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