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
import { API_BACKEND_URL } from '@env';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

type Nav = {
  navigate: (value: string) => void;
};

const CreateNewPassword = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const [isChecked, setChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { email } = useRoute().params;
  const [password, setPassword] = useState('');
  const handleResetPassword = async () => {
    const response = await axios.post(API_BACKEND_URL + '/auth/reset-password/', {
      email: email,
      newPassword: password,
      confirmPassword: password
    });
    setModalVisible(true);
    Alert.alert('Error', 'Token verification failed');
    // Store token and navigate to the next screen
    //navigate('login');
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
                    color: COLORS.greyscale600,
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
    <View style={[styles.container, { backgroundColor: COLORS.white }]}>
      <Header title={t('cnp.header.createNewPassword')} />
      <ScrollView showsVerticalScrollIndicator={false}>
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
        <View style={styles.checkBoxContainer}>
          <View style={{ flexDirection: 'row' }}>
            <Checkbox
              style={styles.checkbox}
              value={isChecked}
              onChange={setChecked}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.privacy,
                  {
                    color: COLORS.black,
                  },
                ]}>
                {t('cnp.form.rememberMe')}
              </Text>
            </View>
          </View>
        </View>
        <View></View>
      </ScrollView>
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
    </View>
  );

};

export default CreateNewPassword;
