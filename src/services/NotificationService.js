// NotificationService.js
import { firebase } from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';

// For iOS
import PushNotificationIOS from '@react-native-community/push-notification-ios';

class NotificationService {
  // Request permissions for notifications
  async requestPermissions() {
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

  // Get the FCM token
  async getFCMToken() {
    try {
      let fcmToken = await AsyncStorage.getItem('fcm_token');
      
      if (!fcmToken) {
        const app = firebase.app();
        const messagingInstance = messaging(app);
        fcmToken = await messagingInstance.getToken();
        
        if (fcmToken) {
          await AsyncStorage.setItem('fcm_token', fcmToken);
        }
      }
      
      return fcmToken;
    } catch (error) {
      console.log('Error getting FCM token:', error);
      return null;
    }
  }

  // Configure notification handlers
  configureNotificationHandlers({ onNotificationReceived, onNotificationOpened }) {
    // Configure for both Android and iOS
    PushNotification.configure({
      onRegister: function(token) {
        console.log('TOKEN:', token);
      },
      onNotification: function(notification) {
        console.log('NOTIFICATION:', notification);
        
        // Call the provided callback
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
        
        // Handle notification opened
        if (notification.userInteraction && onNotificationOpened) {
          onNotificationOpened(notification);
        }
        
        // Required on iOS only
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: false, // We handle permissions separately
    });

    // Setup foreground notification handler using the new approach
    const app = firebase.app();
    const messagingInstance = messaging(app);
    
    messagingInstance.onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage);
      
      // Display local notification when app is in foreground
      PushNotification.localNotification({
        channelId: "default-channel",
        title: remoteMessage.notification?.title || "New notification",
        message: remoteMessage.notification?.body || "",
        data: remoteMessage.data,
        smallIcon: "ic_notification",
      });
      
      if (onNotificationReceived) {
        onNotificationReceived(remoteMessage);
      }
    });

    // Setup background handler
    messagingInstance.setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
  }
}

export default new NotificationService();