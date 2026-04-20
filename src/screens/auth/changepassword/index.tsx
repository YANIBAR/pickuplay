import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Modal,
  Alert,
} from 'react-native';
import { Header, TextInput, Checkbox, Button, View, Text, ErrorModal, SuccessModal } from '@components';
import { COLORS, icons, illustrations } from '@constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from './styles';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authenticatedApi, publicApi } from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeToken } from '@services/auth/auth.utils';

type Nav = {
  navigate: (value: string) => void;
};

const CreateNewPassword = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const [isChecked, setChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState(''); // 👈 added
  const [confirmPassword, setConfirmPassword] = useState(''); // 👈 added

  const handleResetPassword = async () => {
    // 👇 Validate passwords match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const response = await authenticatedApi.post(`auth/change-password`, {
        password: currentPassword,  // 👈 current password
        newPassword: password,       // 👈 new password
      });

      if (response.status === 200) {
        navigate('login');
        Alert.alert('Success', 'Password reset successfully');
      } else {
        Alert.alert('Error', response.data.message || 'Password reset failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      Alert.alert('Error', errorMessage);
    }
  };

  useEffect(() => {
    const fetchRole = async () => {
      const token = await AsyncStorage.getItem('access_token');
      const userInfo = decodeToken(token);
      setEmail(userInfo.email);
    };
    
    fetchRole();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.white }]}>
      <Header title={t('cnp.header.changepassword')} />
      <View style={styles.logoContainer}>
        <Image
          source={illustrations.newPassword}
          resizeMode="contain"
          style={styles.success}
        />
      </View>
      <Text style={[styles.title, { color: COLORS.black }]}>
        {t('cnp.form.createYourNewPassword')}
      </Text>

      {/* 👇 Current password field */}
      <TextInput
        autoCapitalize="none"
        id="currentPassword"
        placeholder="Current Password"
        placeholderTextColor={COLORS.black}
        icon={icons.padlock}
        secureTextEntry={true}
        onChangeText={setCurrentPassword}
      />

      <TextInput
        autoCapitalize="none"
        id="newPassword"
        placeholder={t('cnp.form.newPassword')}
        placeholderTextColor={COLORS.black}
        icon={icons.padlock}
        secureTextEntry={true}
        onChangeText={setPassword}
      />

      <TextInput
        autoCapitalize="none"
        id="confirmNewPassword"
        placeholder={t('cnp.form.confirmNewPassword')}
        placeholderTextColor={COLORS.black}
        icon={icons.padlock}
        secureTextEntry={true}
        onChangeText={setConfirmPassword}  // 👈 wired up
      />

      <Button
        filled
        title={t('cnp.form.continue')}
        style={styles.button}
        onPress={handleResetPassword}
      />
    </SafeAreaView>
  );
};

export default CreateNewPassword;
