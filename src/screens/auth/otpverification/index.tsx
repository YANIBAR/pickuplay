import React, { useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Header, OtpInput, Button, View, Text, ErrorModal, SuccessModal, Icon } from '@components';
import { COLORS, screens } from '@constants';
import styles from './styles';
import { authenticatedApi, publicApi } from '@services/api';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JAVA_API } from '@env';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import i18n from '@services/localisation';

type Nav = {
  navigate: (value: string, params?: any) => void;
};

const OTPVerification = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const [time, setTime] = useState<number>(60);
  const [disabled, setDisabled] = useState<boolean>(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [otp, setOtp] = useState('');
  const route = useRoute<any>();
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [action, setAction] = useState(route.params?.action ?? '');
  const [phone, setPhone] = useState(route.params?.phone ?? '');
  const [visible, setVisible] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const next_navigation = action;

  // Store tokens in AsyncStorage
  const storeToken = async (token: string, refreshToken: string) => {
    try {
      await AsyncStorage.setItem('access_token', token);
      await AsyncStorage.setItem('refresh_token', refreshToken);
    } catch (error) {
      console.error('Token storage error', error);
    }
  };

  // Store user data in AsyncStorage and set language
  const storeUser = async (user: any) => {
    try {
      await AsyncStorage.multiSet([
        ['id', user.id?.toString() || ''],
        ['firstName', user.firstname || user.firstName || ''],
        ['lastName', user.lastname || user.lastName || ''],
        ['email', user.email || ''],
        ['phone', user.phone || ''],
        ['city', user.city || ''],
        ['preferredLanguage', user.preferredLanguage || 'en'],
        ['role', user.role || ''],
      ]);
      i18n.changeLanguage(user.preferredLanguage || 'en');
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  // Attempt to register device for notifications
  const registerDevice = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const fcmToken = await messaging().getToken();
      const deviceId = await DeviceInfo.getUniqueId();
      await authenticatedApi.post('notifications/register-device', {
        token: fcmToken,
        device_id: deviceId,
      });
    } catch (err) {
      console.warn('Device registration failed:', err);
    }
  };

  // Auto-login using email + password
  const autoLogin = async (emailParam: string, password: string) => {
    try {
      const response = await axios.post(`${JAVA_API}auth/login`, {
        username: emailParam,
        password,
      });

      const userData = response.data.data.user;
      const accessToken = response.data.data.token;
      const refresh_token = response.data.data.refreshToken;

      if (!userData || !accessToken) {
        throw new Error('Invalid login response');
      }

      await storeToken(accessToken, refresh_token);
      await storeUser(userData);

      // register device for notifications (best-effort)
      await registerDevice();

      return true;
    } catch (err) {
      console.warn('Auto-login failed', err);
      return false;
    }
  };

  const handleCheckOtp = async () => {

    if (time === 0) {
      showAlert(
        t('otpVerification.errorTitle'),
        t('otpVerification.timeExpiredMessage')
      );
      return;
    }

    try {
      if (next_navigation === 'register') {
        // verify registration OTP
        await publicApi.post('auth/verify-account', { email, otp });

        // If password was passed from register screen, auto-login
        const providedPassword = route.params?.password;
        if (providedPassword) {
          await autoLogin(email, providedPassword);
        }

        // Redirect to dedicated onboarding/profile setup screen
        navigate(screens.profileOnboarding, { email, phone });
        return;
      }

      if (next_navigation === 'resetPassword') {
        await publicApi.post('auth/verify-reset-otp', { email, otp });
      }

      setVisible(true);
      navigate(next_navigation === 'resetPassword' ? screens.createnewpassword : screens.welcome, { email, otp });

    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 400 || status === 401) {
        showAlert(
          t('otpVerification.errorTitle'),
          t('otpVerification.invalidOtpMessage')
        );
      } else if (status === 410) {
        showAlert(
          t('otpVerification.errorTitle'),
          t('otpVerification.otpExpiredMessage')
        );
      } else {
        showAlert(
          t('otpVerification.errorTitle'),
          t('otpVerification.genericErrorMessage')
        );
      }
    }
  };
  
  // Clean onClose + setup handlers
  const onClose = (): void => {
    setVisible(false);
    navigate(screens.login);
  };

  const handleResend = async () => {
    try {
      // Send a request to refresh the OTP code for the given email
      const response = await publicApi.post(`otp/send`,
        {"email": email},
      );
  
      // Check if the request was successful
      showAlert(
        t('otpVerification.successTitle'),
        t('otpVerification.otpResentMessage', { email })
      );
  
      // Reset timer
      resend();
    } catch (error: any) {
      console.error(t('otpVerification.resendErrorLog'), error);
  
      // Display a user-friendly error message
      if ((error as any).response) {
        // Server returned a response (e.g., 4xx or 5xx status)
        showAlert(
          t('otpVerification.errorTitle'),
          t('otpVerification.serverError', {
            message: (error as any).response.data.message || t('otpVerification.genericError')
          })
        );
      } else if ((error as any).request) {
        // Request was made but no response was received
        showAlert(
          t('otpVerification.errorTitle'),
          t('otpVerification.noResponseError')
        );
      } else {
        // Something else went wrong
        showAlert(
          t('otpVerification.errorTitle'),
          t('otpVerification.unexpectedResendError')
        );
      }
    }
  };
  
  const showAlert = (title: string, message: string) => {
    setTitle(title);
    setMessage(message);
    setModalVisible(true);
  };
  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          setDisabled(false);
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (route.params?.email) setEmail(route.params.email);
    if (route.params?.action) setAction(route.params.action);
    if (route.params?.phone) setPhone(route.params.phone);
  }, [route.params]);
  
  const resend = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTime(60);
    setDisabled(true);
    startTimer();
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
      <View style={[styles.container, { backgroundColor: COLORS.white }]}>
        <Header />
        <ScrollView>
          <Text size="h1" align="center" style={styles.title}>
            {t('otpVerification.headerTitle')}
          </Text>
          <Text
            size="h3"
            align="center"
            style={{ justifyContent: 'center', marginVertical: 30 }}>
            {t('otpVerification.codeSent')} { email}
          </Text>
          <OtpInput
            digits={4}
            inputStyles={styles.inputStyles}
            onChange={code => setOtp(code)}
          />
          <View style={styles.codeContainer}>
            <Text
              style={[
                styles.code,
                {
                  color: COLORS.grayscale900,
                },
              ]}>
              {t('otpVerification.resendCodeIn')}
            </Text>
            <Text style={styles.time}>{`  ${time} `}</Text>
            <Text
              style={[
                styles.code,
                {
                  color: COLORS.grayscale900,
                },
              ]}>
              s
            </Text>
          </View>
          <View style={styles.resendBtn}>
            <TouchableOpacity
              onPress={handleResend}
              disabled={disabled}
              style={[disabled && { opacity: 0.3 }]}>
              <Text>{t('otpVerification.resend')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Button
          filled
          title={t('otpVerification.verify')}
          onPress={handleCheckOtp}
        />
        <ErrorModal
          visible={modalVisible}
          title={title}
          message={message}
          onClose={() => setModalVisible(false)}
        >
        </ErrorModal>
      </View>

          <SuccessModal visible={visible} onClose={onClose} />
    </SafeAreaView>
  );
};

export default OTPVerification;
