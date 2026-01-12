// services/SimpleNotificationService.js
import { Alert } from 'react-native';

export class xxNotificationService {
  static requestPermissions() {
    // In a real app, you'd request permissions here
    console.log('Notification permissions requested');
    return true;
  }
  
  static async sendLocalNotification(title, body, data = {}) {
    Alert.alert(
      title,
      body,
      [
        {
          text: 'View',
          onPress: () => {
            console.log('Notification "viewed":', data);
            if (data.onView) {
              data.onView();
            }
          }
        },
        {
          text: 'Dismiss',
          style: 'cancel'
        }
      ]
    );
  }
}

export default xxNotificationService;