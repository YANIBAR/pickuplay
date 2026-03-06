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
import { API_BACKEND_URL, JAVA_API } from '@env';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

type Nav = {
  navigate: (value: string) => void;
};

const CreateNewPassword = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const [isChecked, setChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { phone, otp} = useRoute().params;
  const [password, setPassword] = useState('');
  const handleResetPassword = async () => {
  if (!phone || !otp || !password) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }


  try {
    const response = await axios.post(`${JAVA_API}auth/reset-password`, {
      phone,
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
  // Render modal
  const renderModal = () => {
    return (
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContainer]}>
            <View
              style={[
                styles.modalSubContainer,
                {
                  backgroundColor: COLORS.White,
                },
              ]}>
              <Image
                source={illustrations.passwordSuccess}
                resizeMode="contain"
                style={styles.modalIllustration}
              />
              <Text style={styles.modalTitle}>{t('cnp.modal.congratulations')}</Text>
              <Text
                style={[
                  styles.modalSubtitle,
                  {
                    color: COLORS.grayscale600,
                  },
                ]}>
                {t('cnp.modal.accountReady')}
              </Text>
              <Button
                title={t('cnp.modal.continue')}
                filled
                onPress={() => {
                  setModalVisible(false);
                  navigate('login');
                }}
                style={{
                  width: '100%',
                  marginTop: 12,
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
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
      <ErrorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
      </ErrorModal>
    </SafeAreaView>
  );

};

export default CreateNewPassword;
