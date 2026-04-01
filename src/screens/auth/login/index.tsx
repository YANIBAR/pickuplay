import React, { useCallback, useEffect, useState } from 'react';
import { 
  ScrollView, 
  TouchableOpacity,
  Image
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View, Button, TextInput, Text, ErrorModal } from '@components';
import { COLORS, icons, images  } from '@constants';
import { loginFormData } from '@types';
import styles from './styles';
import { JAVA_API } from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@services/localisation';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@utils/validators';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import { authenticatedApi } from '@services/api';

const defaultValues = {
  identifier: '', // Changed from 'username' to 'email'
  password: '',
};

const Login = () => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    trigger, // Add trigger for manual validation
  } = useForm<loginFormData>({
    defaultValues,
    resolver: yupResolver(loginSchema),
    mode: 'onBlur', // Change to onBlur for better UX
    reValidateMode: 'onChange', // Re-validate on change after first validation
  });

  useFocusEffect(
    useCallback(() => {
      return () => reset();
    }, [reset]),
  );
  useEffect(() => {
    const keys = ['id', 'firstName', 'lastName', 'email', 'phone'];
    const result = AsyncStorage.multiGet(keys);
  }, []);

  const handleLogin = async (formData: loginFormData) => {
    
    try {
      setIsLoading(true);
      
      // Check if fields are empty
      if (!formData.identifier || !formData.password) {
        setTitle(t('login.error') || 'Error');
        setMessage(t('login.fieldsRequired') || 'Email and password are required');
        setModalVisible(true);
        setIsLoading(false);
        return;
      }

      const response = await axios.post(JAVA_API + 'auth/login', {
        username: formData.identifier,
        password: formData.password
      });
      const userData = response.data.data.user;
      const accessToken = response.data.data.token;
      
      if (!userData) {
        throw new Error("No user data received from the server");
      }
      
      if (!accessToken) {
        throw new Error('No access token received');
      }
      await storeToken(accessToken);
      await storeUser(userData);
      
      // Register device for notifications
      try {
        await messaging().registerDeviceForRemoteMessages();
        const fcmToken = await messaging().getToken();
        const deviceId = DeviceInfo.getUniqueId();
        console.log('User logged in successfully:', fcmToken, (await deviceId).toString);
        await authenticatedApi.post('notifications/register-device', {
            token: fcmToken,
            device_id: deviceId._j
        });
      } catch (regErr) {
        console.error('Device registration failed:', regErr);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      navigation.navigate("welcome", { screen: "Games"});
      
    } catch (error: any) {
      setIsLoading(false);
      
      // Handle specific error responses from backend
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Handle unverified account
        if (errorData.message?.includes('not verified') || errorData.code === 'ACCOUNT_NOT_VERIFIED') {
          setTitle(t('login.accountNotVerified') || 'Account Not Verified');
          setMessage(t('login.accountNotVerifiedMsg') || 'Please verify your email before logging in.');
          setModalVisible(true);
          return;
        }
        
        // Handle invalid credentials
        if (errorData.message?.includes('Invalid') || errorData.message?.includes('wrong') || errorData.code === 'INVALID_CREDENTIALS') {
          setTitle(t('login.error') || 'Error');
          setMessage(t('login.invalidCredentials') || 'Email or password is incorrect');
          setModalVisible(true);
          return;
        }
      }
      
      // Handle 401 Unauthorized (wrong credentials)
      if (error.response?.status === 401) {
        setTitle(t('login.error') || 'Error');
        setMessage(t('login.invalidCredentials') || 'Email or password is incorrect');
        setModalVisible(true);
        return;
      }
      
      // Handle 404 Not Found (user doesn't exist)
      if (error.response?.status === 404) {
        setTitle(t('login.error') || 'Error');
        setMessage(t('login.userNotFound') || 'Email or password is incorrect');
        setModalVisible(true);
        return;
      }
      
      // Handle network errors
      if (error.message === 'Network Error' || !error.response) {
        setTitle(t('login.networkError') || 'Network Error');
        setMessage(t('login.networkErrorMsg') || 'Unable to connect to the server. Please try again.');
        setModalVisible(true);
        return;
      }
      
      // Default error
      setTitle(t('login.error') || 'Error');
      setMessage(error.response?.data?.message || t('login.loginFailed') || 'Login failed. Please try again.');
      setModalVisible(true);
    }
  };

  // On successful login
  const storeToken = async (token: string) => {
    try {
      await AsyncStorage.setItem('access_token', token);
    } catch (error) {
      console.error(t('login.tokenStorageError'), error);
    }
  };

  // On successful login
  const storeUser = async (user: any) => {
    try {
      await AsyncStorage.multiSet([
        ['id', user.id?.toString() || ''], 
        ['firstName', user.firstname || ''],
        ['lastName', user.lastname || ''],
        ['email', user.email || ''],
        ['phone', user.phone || ''],
        ['city', user.city || ''],
        ['preferredLanguage', user.preferredLanguage || 'en'],
        ['role', user.role || ''],
        //['profileImage', user.profileImage || ''],
        //['gameId', user.role === "Partner" ? user.gameId || '' : ''],
      ]);
      
      // Change language
      i18n.changeLanguage(user.preferredLanguage);
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };
  
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: COLORS.white,
        },
      ]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}>
          <TouchableOpacity style={styles.logoContainer} onPress={() => navigation.navigate("welcome", {
        screen: "Games"  // Specify which tab to show
      })}>
            <Image
              source={images.logo}
              resizeMode="contain"
              style={styles.logo}
            />
          </TouchableOpacity>
        <Text
          style={[
            styles.title,
            {
              color: COLORS.black,
            },
          ]}>
          {t('c.signIn')}
        </Text>
        
        <Controller
          name="identifier"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onBlur={async (e) => {
                onBlur(); // Call form's onBlur
                await trigger('identifier'); // Trigger validation
              }}
              onChangeText={async (text) => {
                onChange(text);
                // Trigger validation after a short delay for better UX
                setTimeout(() => trigger('identifier'), 300);
              }}
              icon={icons.user}
              autoCapitalize="none"
              keyboardType="identifier"
              placeholder={t('signIn.usernameOrEmail')}
              errorText={errors?.identifier?.message}
            />
          )}
        />
        
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onBlur={async (e) => {
                onBlur(); // Call form's onBlur
                await trigger('password'); // Trigger validation
              }}
              onChangeText={async (text) => {
                onChange(text); // Update form value  
                // Trigger validation for password
                if (text.length === 0) {
                  setTimeout(() => trigger('password'), 300);
                }
              }}
              password
              icon={icons.padlock}
              autoCapitalize="none"
              placeholder={t('c.password')}
              secureTextEntry={true}
              errorText={errors?.password?.message}
            />
          )}
        />
        
        <Button
          filled
          title={ t('c.login')}
          onPress={handleSubmit(handleLogin)} // Use handleSubmit for validation
          style={[
            styles.button,
            { opacity: isLoading ? 0.7 : 1 }
          ]}
        />
        
        <TouchableOpacity onPress={() => navigation.navigate('forgotpasswordmethods')}>
          <Text style={styles.forgotPasswordBtnText}>
            {t('signIn.forgotPassword')}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.bottomContainer}>
          <Text size="h4">{t('signIn.dontHaveAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('register')}>
            <Text size="h4" color={COLORS.primary}>
              {'  '}
              {t('c.signUp')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <ErrorModal
        visible={modalVisible}
        title={title}
        message={message}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default Login;