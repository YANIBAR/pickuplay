import React, { useState } from 'react';
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
import { publicApi } from '@services/api';

type Nav = {
  navigate: (value: string) => void;
};

const CreateNewPassword = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const { email, otp} = useRoute().params;
  const [password, setPassword] = useState('');
  const handleResetPassword = async () => {

    console.log('Password reset response:', `auth/reset-password`, 
      email,
      otp,
      password);
    if (!email || !otp || !password) {

      console.log('Resetting password with:', { email, otp, password });
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }


    try {
      console.log(email,
        otp,
        password);
      const response = await publicApi.post(`auth/reset-password`, {
        email,
        otp,
        newPassword: password
      });
      if (response.status == 200) {
        // Navigate to login after a short delay
        navigate('login');
        Alert.alert('Success', 'Password reset successfully');
        
      } else {
        Alert.alert('Error', response.data.message || 'Password reset failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Token verification failed';
      navigate('login');
      Alert.alert('Error', errorMessage);
    } 
};

  return (
    
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.white }]}>
      
        <Header title={t('cnp.header.createNewPassword')} />
        <View style={styles.logoContainer}>
          <Image
            source={illustrations.newPassword}
            resizeMode="contain"
            style={styles.success}
          />
        </View>
        <Text
          style={[
            styles.title,
            {
              color: COLORS.black,
            },
          ]}>
          {t('cnp.form.createYourNewPassword')}
        </Text>
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
