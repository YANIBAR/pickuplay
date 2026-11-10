
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {checkAppVersion, AppVersionData} from '@services/appVersionService';
import styles from './styles';

interface Props {
  children: React.ReactNode;
}

const UpdateGate: React.FC<Props> = ({children}) => {
  const [checking, setChecking] = useState(true);
  const [updateInfo, setUpdateInfo] = useState<AppVersionData | null>(null);

  useEffect(() => {
    const checkVersion = async () => {
      const result = await checkAppVersion();

      if (result?.updateRequired) {
        setUpdateInfo(result);

        // Optional update: show a dismissible popup
        if (!result.forceUpdate) {
          Alert.alert(
            'Update Available',
            result.message,
            [
              {
                text: 'Later',
                style: 'cancel',
              },
              {
                text: 'Update Now',
                onPress: () => {
                  Linking.openURL(result.storeUrl).catch(console.error);
                },
              },
            ],
            {cancelable: true},
          );
        }
      }

      setChecking(false);
    };

    checkVersion();
  }, []);

  const handleUpdate = () => {
    if (updateInfo?.storeUrl) {
      Linking.openURL(updateInfo.storeUrl).catch(console.error);
    }
  };

  if (checking) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#22BB9C" />
      </View>
    );
  }

  // Only block users when the backend requires a mandatory update
  if (updateInfo?.updateRequired && updateInfo.forceUpdate) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🚀</Text>
        </View>

        <Text style={styles.title}>Update PickuPlay</Text>

        <Text style={styles.description}>
          {updateInfo.message}
        </Text>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdate}
          activeOpacity={0.8}>
          <Text style={styles.updateButtonText}>Update Now</Text>
        </TouchableOpacity>

        <Text style={styles.version}>
          Required version: {updateInfo.minimumSupportedVersion}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};
export default UpdateGate;
