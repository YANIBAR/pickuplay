import React, { useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Header, OtpInput, Button, View, Text, ModalBase } from '@components';
import { COLORS, screens } from '@constants';
import styles from './styles';
import { API_BACKEND_URL, JAVA_API } from '@env';
import axios from 'axios';
import { publicApi } from '@services/api';

type Nav = {
  navigate: (value: string) => void;
};

const OTPVerification = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const [time, setTime] = useState<number>(60);
  const [disabled, setDisabled] = useState<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [otp, setOtp] = useState('');
  const { email, action, phone } = useRoute().params;
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const next_navigation = action;
  const handleCheckOtp = async () => {
    if (time !== 0) {
        if (next_navigation === "register") {

          const response = await publicApi.post(`auth/verify-account`, {
            email: email,
            otp: otp
          });
  
          showAlert(
            t('otpVerification.successTitle'),
            t('otpVerification.otpVerifiedMessage')
          );
        }
          navigate(
            next_navigation === "resetPassword"
              ? screens.createnewpassword
              : screens.login,
            { email, otp }
          );
    } else {
      showAlert(
        t('otpVerification.errorTitle'),
        t('otpVerification.timeExpiredMessage')
      );
    }
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
    } catch (error) {
      console.error(t('otpVerification.resendErrorLog'), error);
  
      // Display a user-friendly error message
      if (error.response) {
        // Server returned a response (e.g., 4xx or 5xx status)
        showAlert(
          t('otpVerification.errorTitle'),
          t('otpVerification.serverError', {
            message: error.response.data.message || t('otpVerification.genericError')
          })
        );
      } else if (error.request) {
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
        <ModalBase
          visible={modalVisible}
          title={title}
          message={message}
          onClose={() => setModalVisible(false)}
        >
        </ModalBase>
      </View>
    </SafeAreaView>
  );
};

export default OTPVerification;
