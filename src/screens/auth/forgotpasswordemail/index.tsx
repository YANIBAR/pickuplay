import React, { useCallback } from 'react';
import { ScrollView, TouchableOpacity, Image, Alert, SafeAreaView } from 'react-native';
import { Header, Button, TextInput, View, Text } from '@components';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { yupResolver } from '@hookform/resolvers/yup';
import { COLORS, icons, images, screens } from '@constants';
import { Controller, useForm } from 'react-hook-form';
import { forgotSchema } from '@utils/validators';
import { useTranslation } from 'react-i18next';
import styles from './styles';
import axios from 'axios';
import { publicApi } from '@services/api';

interface forgotFormData {
  email: string;
}

type Nav = {
  navigate: (value: string) => void;
};

const defaultValues = {
  email: '',
};

const ForgotPasswordEmail = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<forgotFormData>({
    defaultValues,
    resolver: yupResolver(forgotSchema),
  });

  const onSubmit = (data: forgotFormData) =>  {
    const email = data.email;
    try {
      // Send the request to the backend
      const response = publicApi.post(`otp/send`, { email });
      
      // If successful, navigate to the OTP verification screen
      navigate(screens.otpverification, { email, action: 'resetPassword' });
      
      // Log the data for debugging purposes
      console.log('Form submission data:', JSON.stringify(data, null, 2));
    } catch (error) {
      // Handle any errors that occur during the request
      console.error('Error during forgot password request:', error);
      
      // Optionally, you can show an alert or other feedback to the user
      Alert.alert('Forgot Password Failed', 'There was an issue with your request. Please try again.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      return () => reset();
    }, [reset]),
  );

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
      <View style={[styles.container, { backgroundColor: COLORS.white }]}>
        <Header />
        <ScrollView
          style={{ marginVertical: 54 }}
          showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <Image
              source={images.logo}
              resizeMode="contain"
              style={styles.logo}
            />
          </View>
          <Text size="h2" style={[styles.title]}>
            {t('forgotPwdEmail.title')}
          </Text>
          <Text
            size="h3"
            align="center"
            style={[styles.center, { lineHeight: 24, marginVertical: 20 }]}>
            {t('forgotPwdEmail.subtitle')}
          </Text>
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onBlur={onBlur}
                icon={icons.email}
                onChangeText={onChange}
                label={t('forgotPwdEmail.emailAddress')}
                keyboardType="email-address"
                placeholder={t('forgotPwdEmail.emailPlaceholder')}
                errorText={errors?.email?.message}
              />
            )}
          />
          <Button
            filled
            title={t('forgotPwdEmail.send')}
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
          />
        </ScrollView>
        <View style={styles.bottomContainer}>
          <Text size="h4">{t('forgotPwdEmail.dontHaveAccount')}</Text>
          <TouchableOpacity onPress={() => navigate('register')}>
            <Text size="h4" color={COLORS.primary}>
              {'  '}
              {t('forgotPwdEmail.signUp')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
  
};

export default ForgotPasswordEmail;
